"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Dumbbell, ArrowRight, X, Camera, Flame, Target, Zap, Volume2, VolumeX, Mic, MicOff } from "lucide-react";

const REP_MESSAGES: Record<number, string> = {
  1: "Good start.",
  2: "Nice, keep going.",
  3: "You can do more.",
  4: "One more.",
  5: "Strong rep.",
  6: "Push, push.",
  7: "Stay tight.",
  8: "Excellent.",
  9: "Finish strong.",
  10: "Great set."
};

const MOTIVATIONAL_PHRASES = [
  "Keep it up.",
  "Strong work.",
  "Let’s go.",
  "Stay with it.",
  "You’ve got this."
];

// --- Helper calculations for client-side pose tracking ---
const calculateAngle = (a: {x: number, y: number}, b: {x: number, y: number}, c: {x: number, y: number}) => {
  const ba = { x: a.x - b.x, y: a.y - b.y };
  const bc = { x: c.x - b.x, y: c.y - b.y };

  const ba_norm_val = Math.sqrt(ba.x * ba.x + ba.y * ba.y);
  const bc_norm_val = Math.sqrt(bc.x * bc.x + bc.y * bc.y);

  const ba_norm = { x: ba.x / (ba_norm_val + 1e-8), y: ba.y / (ba_norm_val + 1e-8) };
  const bc_norm = { x: bc.x / (bc_norm_val + 1e-8), y: bc.y / (bc_norm_val + 1e-8) };

  const dot = ba_norm.x * bc_norm.x + ba_norm.y * bc_norm.y;
  const clippedDot = Math.min(Math.max(dot, -1.0), 1.0);

  return Math.acos(clippedDot) * (180 / Math.PI);
};

const getJointAngles = (landmarks: any) => {
  const left_shoulder = landmarks[11];
  const left_elbow = landmarks[13];
  const left_wrist = landmarks[15];
  const left_hip = landmarks[23];
  const left_knee = landmarks[25];
  const left_ankle = landmarks[27];

  const right_shoulder = landmarks[12];
  const right_elbow = landmarks[14];
  const right_wrist = landmarks[16];
  const right_hip = landmarks[24];
  const right_knee = landmarks[26];
  const right_ankle = landmarks[28];

  return {
    left_knee: calculateAngle(left_hip, left_knee, left_ankle),
    right_knee: calculateAngle(right_hip, right_knee, right_ankle),
    left_elbow: calculateAngle(left_shoulder, left_elbow, left_wrist),
    right_elbow: calculateAngle(right_shoulder, right_elbow, right_wrist),
    wrist_y: (left_wrist.y + right_wrist.y) / 2,
    shoulder_y: (left_shoulder.y + right_shoulder.y) / 2,
    ankle_dist: Math.abs(left_ankle.x - right_ankle.x)
  };
};

export default function LiveTrainerPage() {
  const [useDeviceCamera, setUseDeviceCamera] = useState(true);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [status, setStatus] = useState<string>("Standby");
  const [isRunning, setIsRunning] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [stats, setStats] = useState({ rep_count: 0, form_status: "Awaiting tracking...", exercise: "" });
  const [voiceFeedback, setVoiceFeedback] = useState(true);
  const [isListening, setIsListening] = useState(false);
  
  const lastRepRef = useRef(0);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const recognitionRef = useRef<any>(null);

  // Client-side camera tracking refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const activeStreamRef = useRef<MediaStream | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const poseLandmarkerRef = useRef<any>(null);
  const stageRef = useRef<string>("up");

  const getBackendUrl = (path: string) => {
    if (path === '/stats') return '/api/stats';
    if (path === '/video_feed') return '/api/video-feed';
    return `/api${path}`;
  };

  const exercises = [
    { id: "squat", title: "Squat", icon: Dumbbell, desc: "Hip, knee, and ankle angle tracking.", color: "from-fuchsia-400 to-purple-500" },
    { id: "curl", title: "Bicep Curl", icon: Activity, desc: "Elbow extension and flexion tracking.", color: "from-cyan-400 to-blue-500" },
    { id: "pushup", title: "Push-up", icon: Flame, desc: "Shoulder-elbow 90-degree break.", color: "from-orange-400 to-red-500" },
    { id: "jumping_jack", title: "Jumping Jack", icon: Zap, desc: "Cardio extremity extension.", color: "from-yellow-400 to-amber-500" },
    { id: "lunge", title: "Lunges", icon: Target, desc: "Bilateral knee depth tracking.", color: "from-emerald-400 to-green-500" },
  ];

  // Auto-detect device and select default camera mode + pre-load MediaPipe Pose AI
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPreference = window.localStorage.getItem("live-trainer-use-device-camera");
      if (savedPreference !== null) {
        setUseDeviceCamera(savedPreference === "true");
      } else {
        const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent) || 
                      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        const isAndroid = /Android/i.test(navigator.userAgent);
        const isMobile = isIOS || isAndroid;
        setUseDeviceCamera(isMobile);
      }

      // Pre-load MediaPipe Pose model in background for instant user-gesture action
      setTimeout(() => {
        initLocalPose().catch(err => console.warn("Background MediaPipe pre-load failed:", err));
      }, 1000);
    }
  }, []);

  // Initialize Speech and load Voice
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      const loadVoices = () => {
        const voices = synthRef.current?.getVoices() || [];
        const energeticVoice = voices.find(v => v.lang === 'en-IN' && v.name.toLowerCase().includes('female'))
                          || voices.find(v => v.name.toLowerCase().includes('google'))
                          || voices.find(v => v.lang.startsWith('en'))
                          || voices[0];
        voiceRef.current = energeticVoice;
      };
      loadVoices();
      if (synthRef.current.onvoiceschanged !== undefined) {
        synthRef.current.onvoiceschanged = loadVoices;
      }
    }

    // Initialize Speech Recognition for Voice Commands
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const command = event.results[event.results.length - 1][0].transcript.toLowerCase();
        console.log("Voice Command Received:", command);

        if (command.includes("stop") || command.includes("terminate") || command.includes("close")) {
          stopTrainer();
        } else {
          // Check for exercise start commands
          exercises.forEach(ex => {
            if (command.includes(`start ${ex.id.replace('_', ' ')}`) || command.includes(`start ${ex.title.toLowerCase()}`)) {
              launchTrainer(ex.id);
            }
          });
        }
      };

      recognitionRef.current.onend = () => {
        if (isListening) recognitionRef.current.start();
      };
    }

    return () => {
      stopLocalTracking();
    };
  }, [isListening]);

  const toggleVoiceCommands = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
      speak("Voice commands active. Say start followed by exercise name.");
    }
  };

  const speak = (text: string) => {
    if (synthRef.current && voiceFeedback) {
      synthRef.current.cancel(); 
      const utterance = new SpeechSynthesisUtterance(text);
      if (voiceRef.current) utterance.voice = voiceRef.current;
      utterance.volume = 1;
      utterance.rate = 1.1;
      utterance.pitch = 1.1;
      synthRef.current.speak(utterance);
    }
  };

  // Handle Rep Audio Motivation
  useEffect(() => {
    if (isRunning && stats.rep_count > lastRepRef.current) {
      const currentRep = stats.rep_count;
      lastRepRef.current = currentRep;
      
      let message = "";
      if (currentRep <= 10) {
        message = REP_MESSAGES[currentRep];
      } else {
        const phraseIdx = (currentRep - 11) % MOTIVATIONAL_PHRASES.length;
        message = MOTIVATIONAL_PHRASES[phraseIdx];
      }
      
      speak(`Good rep ${currentRep}. ${message}`);
    }
  }, [stats.rep_count, isRunning]);

  // --- LOCAL WEB-BASED CAMERA DETECTION SYSTEM ---
  const initLocalPose = async () => {
    if (poseLandmarkerRef.current) return poseLandmarkerRef.current;
    setIsModelLoading(true);
    try {
      const vision = await import("@mediapipe/tasks-vision");
      const filesetResolver = await vision.FilesetResolver.forVisionTasks(
        "/wasm"
      );
      const isIOS = typeof window !== "undefined" && (
        /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
      );
      const preferredDelegate = isIOS ? "CPU" : "GPU";
      console.log(`Preferred MediaPipe delegate selected: ${preferredDelegate}`);

      let poseLandmarker;
      try {
        poseLandmarker = await vision.PoseLandmarker.createFromOptions(
          filesetResolver,
          {
            baseOptions: {
              modelAssetPath: "/pose_landmarker.task",
              delegate: preferredDelegate
            },
            runningMode: "VIDEO",
            outputSegmentationMasks: false
          }
        );
      } catch (gpuError) {
        console.warn("GPU delegate failed, falling back to CPU:", gpuError);
        poseLandmarker = await vision.PoseLandmarker.createFromOptions(
          filesetResolver,
          {
            baseOptions: {
              modelAssetPath: "/pose_landmarker.task",
              delegate: "CPU"
            },
            runningMode: "VIDEO",
            outputSegmentationMasks: false
          }
        );
      }
      poseLandmarkerRef.current = poseLandmarker;
      setIsModelLoading(false);
      return poseLandmarker;
    } catch (e) {
      console.error("Failed to load MediaPipe Pose model:", e);
      setIsModelLoading(false);
      throw e;
    }
  };

  const startLocalTracking = async (exercise: string) => {
    try {
      setStatus(`Loading AI...`);
      const landmarker = await initLocalPose();

      setStatus(`Opening Camera...`);
      const constraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user" // Use front camera
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      activeStreamRef.current = stream;

      // Wait for state updates to apply so the video ref is bound
      setShowCamera(true);
      setIsRunning(true);
      setStatus("Recording");
      speak("Camera active. Start your first rep.");

      lastRepRef.current = 0;
      setStats({ rep_count: 0, form_status: "Awaiting posture...", exercise: exercise });
      stageRef.current = exercise === "jumping_jack" ? "down" : "up";

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play()
            .then(() => {
              console.log("iOS video playback started successfully.");
              runLocalLoop(landmarker, exercise);
            })
            .catch((playErr) => {
              console.warn("video.play() failed, using metadata callback fallback:", playErr);
              videoRef.current!.onloadedmetadata = () => {
                videoRef.current?.play().catch(console.error);
                runLocalLoop(landmarker, exercise);
              };
            });
        }
      }, 100);
    } catch (err) {
      console.error("Camera open error:", err);
      setStatus("Error");
      speak("Failed to access device camera. Please check permissions.");
    }
  };

  const runLocalLoop = (landmarker: any, exercise: string) => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let lastVideoTime = -1;

    const tick = () => {
      if (video.paused || video.ended) {
        animationFrameIdRef.current = requestAnimationFrame(tick);
        return;
      }

      if (video.videoWidth > 0 && video.videoHeight > 0) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        // Draw camera frame mirroring it visually
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
        ctx.restore();

        // Run detection
        const now = Math.round(performance.now());
        if (video.currentTime !== lastVideoTime) {
          lastVideoTime = video.currentTime;

          // Pass the already-rendered, visible canvas directly to MediaPipe.
          // This entirely bypasses the iOS Safari WebKit bug that fails to upload raw <video> textures,
          // and avoids aggressive suspension since the canvas is in the DOM.
          const result = landmarker.detectForVideo(canvas, now);

          if (result.poseLandmarks && result.poseLandmarks.length > 0) {
            // Note: Since we passed the MIRRORED canvas to MediaPipe, the landmarks
            // returned are already mirroring the physical reality (X is flipped).
            // We can draw them directly without modifying their X coordinates.
            const landmarks = result.poseLandmarks[0];
            
            drawSkeleton(ctx, landmarks, canvas.width, canvas.height);
            processLocalPose(landmarks, exercise);
          } else {
            setStats(prev => ({ ...prev, form_status: "No posture detected" }));
          }
        }
      }

      animationFrameIdRef.current = requestAnimationFrame(tick);
    };

    animationFrameIdRef.current = requestAnimationFrame(tick);
  };

  const drawSkeleton = (ctx: CanvasRenderingContext2D, landmarks: any[], width: number, height: number) => {
    // Draw landmarks as neon dots
    landmarks.forEach((lm) => {
      if (lm.visibility > 0.5) {
        ctx.beginPath();
        ctx.arc(lm.x * width, lm.y * height, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "#22d3ee"; // Neon Cyan
        ctx.shadowColor = "#22d3ee";
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }
    });

    // Draw main connection lines
    const connections = [
      [11, 12], // shoulders
      [11, 13], [13, 15], // left arm
      [12, 14], [14, 16], // right arm
      [11, 23], [12, 24], // shoulder to hip
      [23, 24], // hips
      [23, 25], [25, 27], // left leg
      [24, 26], [26, 28]  // right leg
    ];

    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
    ctx.lineWidth = 3;
    connections.forEach(([i, j]) => {
      const lmA = landmarks[i];
      const lmB = landmarks[j];
      if (lmA && lmB && lmA.visibility > 0.5 && lmB.visibility > 0.5) {
        ctx.beginPath();
        ctx.moveTo(lmA.x * width, lmA.y * height);
        ctx.lineTo(lmB.x * width, lmB.y * height);
        ctx.stroke();
      }
    });
  };

  const processLocalPose = (landmarks: any[], exercise: string) => {
    const angles = getJointAngles(landmarks);
    
    setStats(prev => {
      let currentRep = prev.rep_count;
      let form = prev.form_status;

      if (exercise === "squat") {
        const main_angle = Math.min(angles.left_knee, angles.right_knee);
        form = `Knee: ${Math.round(main_angle)}° (Target: <90°)`;
        if (main_angle > 150) {
          stageRef.current = "up";
        }
        if (main_angle < 95 && stageRef.current === "up") {
          stageRef.current = "down";
          currentRep += 1;
        }
      } else if (exercise === "curl") {
        const main_angle = Math.min(angles.left_elbow, angles.right_elbow);
        form = `Elbow: ${Math.round(main_angle)}° (Target: <45°)`;
        if (main_angle > 150) {
          stageRef.current = "up";
        }
        if (main_angle < 45 && stageRef.current === "up") {
          stageRef.current = "down";
          currentRep += 1;
        }
      } else if (exercise === "pushup") {
        const main_angle = Math.min(angles.left_elbow, angles.right_elbow);
        form = `Elbow: ${Math.round(main_angle)}° (Target: <90°)`;
        if (main_angle > 150) {
          stageRef.current = "up";
        }
        if (main_angle < 95 && stageRef.current === "up") {
          stageRef.current = "down";
          currentRep += 1;
        }
      } else if (exercise === "lunge") {
        const min_knee = Math.min(angles.left_knee, angles.right_knee);
        form = `Knee: ${Math.round(min_knee)}° (Target: <90°)`;
        const max_knee = Math.max(angles.left_knee, angles.right_knee);
        if (min_knee > 150 && max_knee > 150) {
          stageRef.current = "up";
        }
        if (min_knee < 95 && stageRef.current === "up") {
          stageRef.current = "down";
          currentRep += 1;
        }
      } else if (exercise === "jumping_jack") {
        const wrist_above_shoulder = angles.wrist_y < angles.shoulder_y;
        const feet_apart = angles.ankle_dist > 0.15;
        form = wrist_above_shoulder ? "Extended Form ✓" : "Ready";
        if (!wrist_above_shoulder && !feet_apart) {
          stageRef.current = "down";
        }
        if (wrist_above_shoulder && feet_apart && stageRef.current === "down") {
          stageRef.current = "up";
          currentRep += 1;
        }
      }

      return {
        ...prev,
        rep_count: currentRep,
        form_status: form
      };
    });
  };

  const stopLocalTracking = () => {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach((track) => track.stop());
      activeStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };
  // ---------------------------------------------

  const launchTrainer = async (exercise: string) => {
    try {
      setStatus(`Initializing ${exercise}...`);
      setIsRunning(false); 
      setShowCamera(false);
      lastRepRef.current = 0;
      setStats({ rep_count: 0, form_status: "Initializing...", exercise: exercise });
      
      speak(`Initializing ${exercise} session. Get ready.`);
      
      if (useDeviceCamera) {
        await startLocalTracking(exercise);
        return;
      }

      // Call the backend API to start the Python trainer process
      const res = await fetch('/api/run-trainer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exercise })
      });
      
      if (!res.ok) {
        throw new Error('Failed to start trainer');
      }

      // Wait for the Flask server to come up (poll until /stats responds)
      let serverReady = false;
      for (let i = 0; i < 15; i++) {
        await new Promise(r => setTimeout(r, 1000));
        try {
          const check = await fetch(getBackendUrl('/stats'));
          if (check.ok) {
            serverReady = true;
            break;
          }
        } catch {
          // Server not ready yet, keep waiting
        }
      }

      if (!serverReady) {
        setStatus("Server Timeout");
        speak("Backend server failed to start. Please try again.");
        return;
      }

      setShowCamera(true);
      setIsRunning(true);
      setStatus(`Recording`);
      speak("Camera active. Start your first rep.");
    } catch (e) {
      console.error(e);
      setStatus("Error");
      speak("Connection failed.");
    }
  };

  const stopTrainer = async () => {
    try {
      setStatus("Terminating...");
      setIsRunning(false);
      setShowCamera(false);
      
      const total = stats.rep_count;
      speak(`Great session. You completed ${total} reps. Well done.`);

      if (useDeviceCamera) {
        stopLocalTracking();
      } else {
        // Call the backend API to stop the Python trainer process
        try {
          await fetch('/api/stop-trainer', { method: 'POST' });
        } catch {
          // Ignore errors from stop-trainer
        }
      }
      
      if (total > 0 && stats.exercise) {
        const stored = window.localStorage.getItem("m1etrepx-workouts");
        let list = [];
        if (stored) {
          try {
            list = JSON.parse(stored);
          } catch (e) {}
        }
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const newSession = {
          id: Date.now().toString(),
          exercise: stats.exercise,
          reps: total,
          date: "Today",
          time: timeStr,
          intensity: "95% EFFICIENCY"
        };
        list.unshift(newSession);
        window.localStorage.setItem("m1etrepx-workouts", JSON.stringify(list));
      }
      
      setStats({ rep_count: 0, form_status: "Awaiting tracking...", exercise: "" });
      setStatus("Standby");
    } catch (e) {
      console.error(e);
      setStatus("Error");
    }
  };

  // Poll real stats from the Python backend (only if NOT using local camera)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && !useDeviceCamera) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(getBackendUrl('/stats'));
          if (res.ok) {
            const data = await res.json();
            setStats(prev => ({
              ...prev,
              rep_count: data.rep_count ?? prev.rep_count,
              form_status: data.form_status ?? prev.form_status,
            }));
          }
        } catch {
          // Backend may have stopped, ignore
        }
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isRunning, useDeviceCamera]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-7xl mx-auto pb-12 sm:pb-16 space-y-8 sm:space-y-12"
    >
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-5 sm:gap-6 border-b border-border pb-6 transition-colors duration-300">
        <div>
          <p className="zara-subheading mb-2">Live Studio</p>
          <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-foreground flex items-center gap-3">
            Motion Tracking
          </h1>
        </div>
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 md:gap-4 text-sm w-full md:w-auto">
            {/* Elegant Mode Toggle for iPhone Camera vs PC Webcam */}
            <div className="flex border border-border overflow-hidden">
              <button
                onClick={() => {
                  stopTrainer();
                  setUseDeviceCamera(true);
                  if (typeof window !== 'undefined') {
                    window.localStorage.setItem("live-trainer-use-device-camera", "true");
                  }
                }}
                className={`px-3 py-2 text-[10px] uppercase tracking-widest font-black transition-all ${
                  useDeviceCamera
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/10"
                }`}
              >
                Device Camera (iPhone)
              </button>
              <button
                onClick={() => {
                  stopTrainer();
                  setUseDeviceCamera(false);
                  if (typeof window !== 'undefined') {
                    window.localStorage.setItem("live-trainer-use-device-camera", "false");
                  }
                }}
                className={`px-3 py-2 text-[10px] uppercase tracking-widest font-black transition-all ${
                  !useDeviceCamera
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/10"
                }`}
              >
                PC Webcam (Localhost)
              </button>
            </div>

            <button 
              onClick={toggleVoiceCommands}
              className={`flex w-full sm:w-auto items-center justify-center gap-2 px-4 py-2 border transition-all ${isListening ? 'bg-red-600 border-red-600 text-white animate-pulse' : 'border-border text-muted-foreground hover:border-foreground'}`}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              <span className="text-[10px] uppercase tracking-widest font-black">
                {isListening ? "Listening Commands" : "Voice Commands"}
              </span>
            </button>

            <button 
              onClick={() => setVoiceFeedback(!voiceFeedback)}
              className={`flex w-full sm:w-auto items-center justify-center gap-2 px-3 py-2 sm:py-1.5 border transition-all ${voiceFeedback ? 'border-foreground bg-foreground text-background shadow-lg' : 'border-border text-muted-foreground opacity-50'}`}
            >
              {voiceFeedback ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
              <span className="text-[10px] uppercase tracking-widest font-bold">Feedback</span>
            </button>
            <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
              <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
                Status: <span className="text-foreground font-black">{status}</span>
              </span>
              <div className={`h-2.5 w-2.5 rounded-full ${isRunning ? 'bg-zara-red animate-pulse shadow-[0_0_10px_rgba(122,0,0,0.5)]' : 'bg-border'}`}></div>
            </div>
        </div>
      </header>

      <div className="w-full max-w-5xl mx-auto space-y-8 sm:space-y-12">
        <AnimatePresence>
          {showCamera && (
            <motion.section
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="border border-foreground bg-background transition-colors shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-foreground p-4 sm:p-5">
                  <span className="text-xs uppercase tracking-widest font-black flex items-center gap-2 text-foreground">
                    <div className="h-2 w-2 rounded-full bg-zara-red animate-pulse" />
                    Live Stream Active
                  </span>
                  <button 
                    onClick={stopTrainer}
                    className="text-xs uppercase tracking-[0.16em] sm:tracking-[0.2em] font-black hover:text-zara-red transition-colors flex items-center gap-2 text-foreground group self-start sm:self-auto"
                  >
                    <X className="h-4 w-4 group-hover:rotate-90 transition-transform" strokeWidth={3} /> Terminate
                  </button>
                </div>

                <div className="grid md:grid-cols-[1.5fr_1fr] gap-0">
                  <div className="relative aspect-video md:aspect-auto min-h-[250px] sm:min-h-[350px] md:min-h-[450px] border-b md:border-b-0 md:border-r border-foreground bg-black flex items-center justify-center overflow-hidden">
                    {useDeviceCamera ? (
                      <>
                        <video 
                          ref={videoRef} 
                          playsInline 
                          muted 
                          autoPlay
                          className="absolute inset-0 w-full h-full object-cover z-0"
                        />
                        {isModelLoading ? (
                          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 bg-zinc-950 text-white p-6 z-20">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
                            <p className="text-xs uppercase tracking-[0.2em] font-bold text-cyan-400 animate-pulse">Initializing Device Pose AI...</p>
                          </div>
                        ) : null}
                        <canvas 
                          ref={canvasRef} 
                          className="absolute inset-0 w-full h-full object-cover z-10" 
                        />
                      </>
                    ) : (
                      <img 
                        src={getBackendUrl('/video_feed')}
                        alt="Live Workout Video Feed"
                        className="w-full h-full"
                        style={{
                          display: 'block',
                          width: '100%',
                          height: '100%',
                          backgroundColor: '#000000',
                          objectFit: 'cover'
                        }}
                      />
                    )}
                  </div>

                  <div className="p-5 sm:p-10 flex flex-col justify-center space-y-6 sm:space-y-12 bg-background">
                    <div className="space-y-4">
                      <p className="zara-subheading">Module</p>
                      <h2 className="text-3xl sm:text-5xl font-light tracking-tighter capitalize text-foreground">
                        {stats.exercise || "..."}
                      </h2>
                    </div>

                    <div className="space-y-4 border-t border-border pt-10">
                      <p className="zara-subheading">Form Assessment</p>
                      <div className="text-sm font-light uppercase tracking-widest text-muted-foreground">
                        Status: <span className="font-bold text-foreground">{stats.form_status}</span>
                      </div>
                    </div>

                    <div className="space-y-4 border-t border-border pt-10">
                      <p className="zara-subheading">Progress</p>
                      <div className="flex items-baseline gap-3 sm:gap-4">
                        <span className="text-6xl sm:text-8xl font-serif tracking-tighter text-foreground leading-none">
                          {stats.rep_count}
                        </span>
                        <span className="text-xs uppercase tracking-[0.3em] font-black text-muted-foreground">Reps</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <div className="space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
            <h3 className="text-base sm:text-lg font-light tracking-wide uppercase text-foreground">Exercise Catalog</h3>
            <span className="zara-subheading">{exercises.length} Protocols Loaded</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {exercises.map((ex) => {
              const Icon = ex.icon;
              return (
                <div key={ex.id} className="minimal-card group flex flex-col justify-between h-full space-y-8 sm:space-y-12">
                  <div>
                    <div className="relative h-14 w-14 sm:h-16 sm:w-16 flex items-center justify-center border-2 border-border bg-background mb-6 sm:mb-10 z-10 transition-all group-hover:border-foreground">
                      <span className={`absolute inset-0 blur-md bg-gradient-to-br ${ex.color} opacity-40 dark:opacity-20 z-[-1] animate-pulse group-hover:opacity-80 dark:group-hover:opacity-40 transition-opacity`}></span>
                      <Icon className="h-7 w-7 text-foreground" strokeWidth={1} />
                    </div>
                    <h2 className="text-2xl font-light mb-4 text-foreground">{ex.title}</h2>
                    <p className="text-sm font-light text-muted-foreground leading-relaxed">
                      {ex.desc}
                    </p>
                  </div>
                  <button
                    onClick={() => launchTrainer(ex.id)}
                    className="w-full inline-flex items-center justify-between border-t border-border pt-6 group-hover:border-foreground transition-colors"
                  >
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-foreground">
                      Initialize
                    </span>
                    <ArrowRight className="h-5 w-5 transform group-hover:translate-x-3 transition-transform text-foreground" strokeWidth={1} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
