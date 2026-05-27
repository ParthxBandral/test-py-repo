import sys
import time
import cv2
import mediapipe as mp
from mediapipe.framework.formats import landmark_pb2
import numpy as np
import pickle
import random
from pathlib import Path
import urllib.request
import threading
from flask import Flask, Response, jsonify
from flask_cors import CORS

try:
    import pyttsx3
    HAS_PYTTSX3 = True
except ImportError:
    HAS_PYTTSX3 = False
    print("Warning: pyttsx3 not installed. Audio feedback disabled.")

# MediaPipe setup
BaseOptions = mp.tasks.BaseOptions
PoseLandmarker = mp.tasks.vision.PoseLandmarker
PoseLandmarkerOptions = mp.tasks.vision.PoseLandmarkerOptions
VisionRunningMode = mp.tasks.vision.RunningMode

app = Flask(__name__)
CORS(app)

# Global State
global_rep_count = 0
global_bad_reps = 0
global_exercise = "squat"
global_form_status = "Waiting for pose..."

GOOD_PHRASES = ["Good job", "Nice one", "Keep going", "Excellent", "Perfect"]
BAD_PHRASES = ["Straight your back", "Move your arms properly", "Fix your position", "Control your movement"]

def handle_rep(is_correct, ml_model, current_time, last_speak_time, engine, rep_count, bad_reps):
    if is_correct or ml_model is None:
        rep_count += 1
        if current_time - last_speak_time > 3.0:
            phrase = random.choice(GOOD_PHRASES)
            speak_async(f"{rep_count}. {phrase}", engine)
            last_speak_time = current_time
    else:
        bad_reps += 1
        if current_time - last_speak_time > 3.0:
            phrase = random.choice(BAD_PHRASES)
            speak_async(phrase, engine)
            last_speak_time = current_time
    return rep_count, bad_reps, last_speak_time

def init_engine():
    if not HAS_PYTTSX3:
        return None
    try:
        engine = pyttsx3.init()
        engine.setProperty('rate', 150)
        return engine
    except:
        return None

def speak_async(text, engine):
    if engine is None:
        return
    def run_speech():
        try:
            local_engine = pyttsx3.init()
            local_engine.setProperty('rate', 150)
            local_engine.say(text)
            local_engine.runAndWait()
        except:
            pass
    threading.Thread(target=run_speech, daemon=True).start()

def download_model():
    model_path = Path("pose_landmarker.task")
    if model_path.exists():
        return str(model_path)
    url = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task"
    try:
        urllib.request.urlretrieve(url, model_path)
        return str(model_path)
    except Exception as e:
        print(f"ERROR: Failed to download pose model: {e}")
        return None

def load_ml_model(exercise_type):
    models_dir = Path("trained_models")
    model_file = models_dir / f"{exercise_type}_model.pkl"
    scaler_file = models_dir / f"{exercise_type}_scaler.pkl"
    if not model_file.exists() or not scaler_file.exists():
        return None, None
    try:
        with open(model_file, 'rb') as f:
            model = pickle.load(f)
        with open(scaler_file, 'rb') as f:
            scaler = pickle.load(f)
        return model, scaler
    except Exception as e:
        print(f"ERROR: Could not load model: {e}")
        return None, None

def calculate_angle(a, b, c):
    a = np.array(a, dtype=np.float32)
    b = np.array(b, dtype=np.float32)
    c = np.array(c, dtype=np.float32)

    ba = a - b
    bc = c - b

    ba_norm = ba / (np.linalg.norm(ba) + 1e-8)
    bc_norm = bc / (np.linalg.norm(bc) + 1e-8)

    cosine_angle = np.dot(ba_norm, bc_norm)
    cosine_angle = np.clip(cosine_angle, -1.0, 1.0)

    angle = np.degrees(np.arccos(cosine_angle))
    return angle

def get_landmark_point(landmarks, idx, width, height):
    lm = landmarks[idx]
    return int(lm.x * width), int(lm.y * height)

def get_joint_angles(landmarks, width, height):
    LEFT_SHOULDER, LEFT_ELBOW, LEFT_WRIST = 11, 13, 15
    LEFT_HIP, LEFT_KNEE, LEFT_ANKLE = 23, 25, 27
    RIGHT_SHOULDER, RIGHT_ELBOW, RIGHT_WRIST = 12, 14, 16
    RIGHT_HIP, RIGHT_KNEE, RIGHT_ANKLE = 24, 26, 28

    left_shoulder = get_landmark_point(landmarks, LEFT_SHOULDER, width, height)
    left_elbow = get_landmark_point(landmarks, LEFT_ELBOW, width, height)
    left_wrist = get_landmark_point(landmarks, LEFT_WRIST, width, height)
    left_hip = get_landmark_point(landmarks, LEFT_HIP, width, height)
    left_knee = get_landmark_point(landmarks, LEFT_KNEE, width, height)
    left_ankle = get_landmark_point(landmarks, LEFT_ANKLE, width, height)

    right_shoulder = get_landmark_point(landmarks, RIGHT_SHOULDER, width, height)
    right_elbow = get_landmark_point(landmarks, RIGHT_ELBOW, width, height)
    right_wrist = get_landmark_point(landmarks, RIGHT_WRIST, width, height)
    right_hip = get_landmark_point(landmarks, RIGHT_HIP, width, height)
    right_knee = get_landmark_point(landmarks, RIGHT_KNEE, width, height)
    right_ankle = get_landmark_point(landmarks, RIGHT_ANKLE, width, height)

    return {
        "left_knee": calculate_angle(left_hip, left_knee, left_ankle),
        "right_knee": calculate_angle(right_hip, right_knee, right_ankle),
        "left_elbow": calculate_angle(left_shoulder, left_elbow, left_wrist),
        "right_elbow": calculate_angle(right_shoulder, right_elbow, right_wrist),
        "wrist_y": (left_wrist[1] + right_wrist[1]) / 2,
        "shoulder_y": (left_shoulder[1] + right_shoulder[1]) / 2,
        "ankle_dist": abs(left_ankle[0] - right_ankle[0])
    }

def draw_angle_text(frame, position, label, angle):
    cv2.putText(
        frame,
        f"{label}: {int(angle)}°",
        position,
        cv2.FONT_HERSHEY_SIMPLEX,
        0.6,
        (255, 255, 255),
        2,
        cv2.LINE_AA,
    )

def extract_features(landmarks):
    features = []
    for landmark in landmarks:
        features.extend([landmark.x, landmark.y, landmark.z])
    return np.array(features)

def generate_frames():
    global global_rep_count, global_bad_reps, global_form_status, global_exercise
    
    ml_model, scaler = load_ml_model(global_exercise)
    model_path = download_model()
    if not model_path:
        return
        
    options = PoseLandmarkerOptions(
        base_options=BaseOptions(model_asset_path=model_path),
        running_mode=VisionRunningMode.IMAGE
    )
    try:
        pose = PoseLandmarker.create_from_options(options)
    except:
        return

    cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
    if not cap.isOpened():
        cap = cv2.VideoCapture(0)

    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

    rep_count = 0
    bad_reps = 0
    stage = None
    prediction_history = []
    engine = init_engine()
    last_speak_time = 0

    while True:
        success, frame = cap.read()
        if not success:
            break

        frame = cv2.flip(frame, 1)
        height, width = frame.shape[:2]
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)
        
        try:
            results = pose.detect(mp_image)
        except:
            continue

        if results.pose_landmarks:
            landmarks = results.pose_landmarks[0]
            
            pose_landmarks_proto = landmark_pb2.NormalizedLandmarkList()
            pose_landmarks_proto.landmark.extend([
                landmark_pb2.NormalizedLandmark(x=lm.x, y=lm.y, z=lm.z) for lm in landmarks
            ])
            
            mp.solutions.drawing_utils.draw_landmarks(
                frame,
                pose_landmarks_proto,
                mp.solutions.pose.POSE_CONNECTIONS,
                mp.solutions.drawing_utils.DrawingSpec(color=(0, 255, 0), thickness=2, circle_radius=3),
                mp.solutions.drawing_utils.DrawingSpec(color=(255, 255, 255), thickness=2)
            )
            
            angles = get_joint_angles(landmarks, width, height)
            
            is_correct = True
            confidence = 1.0
            
            if ml_model is not None:
                features = extract_features(landmarks)
                features_scaled = scaler.transform([features])
                pred = ml_model.predict(features_scaled)[0]
                confidence = max(ml_model.predict_proba(features_scaled)[0])
                
                prediction_history.append(pred)
                if len(prediction_history) > 5:
                    prediction_history.pop(0)
                    
                avg_pred = np.mean(prediction_history)
                is_correct = avg_pred >= 0.5
                
                label = "V CORRECT FORM" if is_correct else "X INCORRECT FORM"
                global_form_status = label
                color = (0, 255, 0) if is_correct else (0, 0, 255)
                
                text_size = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 1.0, 2)[0]
                text_x = (width - text_size[0]) // 2
                cv2.putText(frame, label, (text_x, 50), cv2.FONT_HERSHEY_SIMPLEX, 1.0, color, 3)
            else:
                global_form_status = "Using Angle Tracker (No ML Model)"

            current_time = time.time()
            if global_exercise == "squat":
                main_angle = min(angles["left_knee"], angles["right_knee"])
                if main_angle > 160:
                    stage = "up"
                if main_angle < 90 and stage == "up":
                    stage = "down"
                    rep_count, bad_reps, last_speak_time = handle_rep(is_correct, ml_model, current_time, last_speak_time, engine, rep_count, bad_reps)
                draw_angle_text(frame, (20, 30), "Knee", main_angle)
                
            elif global_exercise == "curl":
                main_angle = min(angles["left_elbow"], angles["right_elbow"])
                if main_angle > 160:
                    stage = "up"
                if main_angle < 40 and stage == "up":
                    stage = "down"
                    rep_count, bad_reps, last_speak_time = handle_rep(is_correct, ml_model, current_time, last_speak_time, engine, rep_count, bad_reps)
                draw_angle_text(frame, (20, 30), "Elbow", main_angle)
                
            elif global_exercise == "pushup":
                main_angle = min(angles["left_elbow"], angles["right_elbow"])
                if main_angle > 160:
                    stage = "up"
                if main_angle < 90 and stage == "up":
                    stage = "down"
                    rep_count, bad_reps, last_speak_time = handle_rep(is_correct, ml_model, current_time, last_speak_time, engine, rep_count, bad_reps)
                draw_angle_text(frame, (20, 30), "Elbow", main_angle)
                
            elif global_exercise == "lunge":
                min_knee = min(angles["left_knee"], angles["right_knee"])
                max_knee = max(angles["left_knee"], angles["right_knee"])
                if min_knee > 160 and max_knee > 160:
                    stage = "up"
                if min_knee < 90 and stage == "up":
                    stage = "down"
                    rep_count, bad_reps, last_speak_time = handle_rep(is_correct, ml_model, current_time, last_speak_time, engine, rep_count, bad_reps)
                draw_angle_text(frame, (20, 30), "Knee", min_knee)
                
            elif global_exercise == "jumping_jack":
                wrist_above_shoulder = angles["wrist_y"] < angles["shoulder_y"]
                feet_apart = angles["ankle_dist"] > (width * 0.15)
                
                if not wrist_above_shoulder and not feet_apart:
                    stage = "down"
                if wrist_above_shoulder and feet_apart and stage == "down":
                    stage = "up"
                    rep_count, bad_reps, last_speak_time = handle_rep(is_correct, ml_model, current_time, last_speak_time, engine, rep_count, bad_reps)
                        
            global_rep_count = rep_count
            global_bad_reps = bad_reps
            cv2.putText(frame, f"Exercise: {global_exercise}", (20, height - 70), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 0), 2)
            cv2.putText(frame, f"Reps: {rep_count}", (20, height - 35), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 255, 255), 2)
        else:
            global_form_status = "No pose detected"

        # Encode frame to JPEG
        ret, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/stats')
def stats():
    return jsonify({
        "rep_count": global_rep_count,
        "form_status": global_form_status,
        "exercise": global_exercise
    })

@app.route('/finish_workout')
def finish_workout():
    engine = init_engine()
    if engine is not None:
        text = f"Workout complete. You did {global_rep_count} good reps, and {global_bad_reps} wrong reps."
        speak_async(text, engine)
    return jsonify({"success": True})

if __name__ == '__main__':
    if len(sys.argv) > 1:
        choice = sys.argv[1].lower()
        if choice in ["squat", "pushup", "curl", "lunge", "jumping_jack"]:
            global_exercise = choice
    app.run(host='127.0.0.1', port=5000, debug=False, threaded=True)
