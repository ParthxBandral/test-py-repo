"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageCircle, 
  Send, 
  Sparkles, 
  Brain, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Greetings. I am the M1ETREPX Neural Coach. How can I optimize your performance today?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const recognitionRef = useRef<any>(null);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  // Initialize Speech Synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      const loadVoices = () => {
        const voices = synthRef.current?.getVoices() || [];
        // Prefer Indian English female voice for consistency
        const indianVoice = voices.find(v => v.lang === 'en-IN' && v.name.toLowerCase().includes('female'))
                          || voices.find(v => v.lang === 'en-IN')
                          || voices[0];
        voiceRef.current = indianVoice;
      };
      loadVoices();
      if (synthRef.current.onvoiceschanged !== undefined) {
        synthRef.current.onvoiceschanged = loadVoices;
      }
    }

    // Initialize Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        // Automatically send after voice input
        setTimeout(() => handleSend(transcript), 500);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const speak = (text: string) => {
    if (synthRef.current && voiceEnabled) {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      if (voiceRef.current) utterance.voice = voiceRef.current;
      utterance.rate = 1.0;
      utterance.pitch = 1.1;
      synthRef.current.speak(utterance);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setInput("");
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim()) return;

    const userMsg: Message = { role: "user", content: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulated AI Intelligence
    setTimeout(() => {
      const responses = [
        "Your recent utilization metrics suggest a focus on neural priming. I recommend a high-intensity push block today.",
        "Metabolic data indicates you require an additional 20g of protein to optimize recovery from your last squat session.",
        "Posture analysis from your live trainer logs shows a slight hip shift. Focus on bilateral stability.",
        "Optimization complete. I have updated your microcycle to include cluster sets for rear deltoids.",
        "I've analyzed your sleep data. Increasing your magnesium intake by 200mg tonight will improve your recovery score."
      ];
      const responseText = responses[Math.floor(Math.random() * responses.length)];
      const assistantMsg: Message = { role: "assistant", content: responseText };
      
      setMessages(prev => [...prev, assistantMsg]);
      setIsTyping(false);
      
      // Speak the response
      speak(responseText);
    }, 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-4xl mx-auto h-[calc(100dvh-132px)] sm:h-[calc(100dvh-170px)] md:h-[calc(100vh-180px)] min-h-[520px] flex flex-col space-y-4 sm:space-y-8"
    >
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4 sm:pb-6">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="relative h-12 w-12 border border-foreground flex items-center justify-center bg-background">
             <span className="absolute inset-0 blur-md bg-gradient-to-br from-red-600 to-black opacity-20 z-[-1] animate-pulse"></span>
             <Brain className="h-6 w-6 text-foreground" strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <p className="zara-subheading mb-1">Neural Interface</p>
            <h1 className="text-xl sm:text-3xl font-light tracking-tight">AI Performance Coach</h1>
          </div>
        </div>

        <button 
          onClick={() => setVoiceEnabled(!voiceEnabled)}
          className={`p-3 border transition-all self-start sm:self-center ${voiceEnabled ? 'border-foreground bg-foreground text-background' : 'border-border text-muted-foreground'}`}
        >
          {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </button>
      </header>

      <div className="flex-1 border border-border bg-background flex flex-col overflow-hidden relative shadow-2xl">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-4 sm:space-y-8 no-scrollbar"
        >
          <AnimatePresence mode="popLayout">
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[85%] sm:max-w-[80%] p-4 sm:p-6 ${
                  msg.role === "user" 
                    ? "bg-foreground text-background" 
                    : "bg-background border border-border text-foreground"
                }`}>
                  <p className="text-xs sm:text-sm font-light leading-relaxed tracking-wide">
                    {msg.content}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-background border border-border p-4 flex gap-1">
                <span className="h-1 w-1 bg-muted-foreground animate-bounce" />
                <span className="h-1 w-1 bg-muted-foreground animate-bounce [animation-delay:0.2s]" />
                <span className="h-1 w-1 bg-muted-foreground animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
        </div>

        <div className="p-3 sm:p-8 border-t border-border bg-background/50 backdrop-blur-sm relative">
          {isListening && (
            <div className="absolute -top-12 left-0 right-0 flex justify-center">
               <div className="bg-red-600 text-white px-4 py-1 text-[10px] font-black uppercase tracking-widest animate-pulse flex items-center gap-2">
                  <div className="flex gap-0.5">
                    <span className="w-0.5 h-3 bg-white animate-[scale_0.5s_ease-in-out_infinite]" />
                    <span className="w-0.5 h-3 bg-white animate-[scale_0.5s_ease-in-out_infinite_0.1s]" />
                    <span className="w-0.5 h-3 bg-white animate-[scale_0.5s_ease-in-out_infinite_0.2s]" />
                  </div>
                  Listening...
               </div>
            </div>
          )}

          <div className="flex gap-2 sm:gap-4">
            <button
              onClick={toggleListening}
              className={`shrink-0 p-3 sm:p-4 border transition-all ${isListening ? 'bg-red-600 border-red-600 text-white animate-pulse' : 'bg-background border-border text-foreground hover:border-foreground'}`}
            >
              {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>
            
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder={isListening ? "Listening..." : "Ask for optimization..."}
              className="min-w-0 flex-1 bg-background border border-border px-3 py-3 sm:px-6 sm:py-4 text-xs sm:text-sm font-light focus:outline-none focus:border-foreground transition-colors animate-none"
            />
            
            <button
              onClick={() => handleSend()}
              className="shrink-0 p-3 sm:p-4 bg-foreground text-background hover:bg-background hover:text-foreground border border-foreground transition-all"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <footer className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[9px] sm:text-[10px] uppercase tracking-[0.16em] sm:tracking-widest text-muted-foreground font-black">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3 w-3" />
          <span>Neural Voice Assistant Engaged</span>
        </div>
        <span>Speak to the Coach for instant feedback</span>
      </footer>
      
      <style jsx>{`
        @keyframes scale {
          0%, 100% { transform: scaleY(0.5); }
          50% { transform: scaleY(1.5); }
        }
      `}</style>
    </motion.div>
  );
}
