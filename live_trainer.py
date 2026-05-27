import sys
import time
import cv2
import mediapipe as mp
from mediapipe.framework.formats import landmark_pb2
import numpy as np
import pickle
from pathlib import Path
import urllib.request
import threading

try:
    import pyttsx3
    HAS_PYTTSX3 = True
except ImportError:
    HAS_PYTTSX3 = False
    print("Warning: pyttsx3 not installed. Audio feedback will be disabled. Run 'pip install pyttsx3' to enable.")

# MediaPipe setup
BaseOptions = mp.tasks.BaseOptions
PoseLandmarker = mp.tasks.vision.PoseLandmarker
PoseLandmarkerOptions = mp.tasks.vision.PoseLandmarkerOptions
VisionRunningMode = mp.tasks.vision.RunningMode

def init_engine():
    if not HAS_PYTTSX3:
        return None
    try:
        engine = pyttsx3.init()
        engine.setProperty('rate', 150)
        return engine
    except Exception as e:
        print(f"Warning: Could not initialize pyttsx3: {e}")
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
    # Map from PoseLandmarker IDs to our points
    LEFT_SHOULDER = 11
    LEFT_ELBOW = 13
    LEFT_WRIST = 15
    LEFT_HIP = 23
    LEFT_KNEE = 25
    LEFT_ANKLE = 27

    RIGHT_SHOULDER = 12
    RIGHT_ELBOW = 14
    RIGHT_WRIST = 16
    RIGHT_HIP = 24
    RIGHT_KNEE = 26
    RIGHT_ANKLE = 28

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

def main():
    exercise = "squat"
    if len(sys.argv) > 1:
        choice = sys.argv[1].lower()
        if choice in ["squat", "pushup", "curl"]:
            exercise = choice
        else:
            print(f"Usage: python live_trainer.py [squat|pushup|curl]")
            print(f"Defaulting to squat.")

    print(f"Starting Live AI Fitness Trainer - {exercise.upper()}")
    print("Press ESC or Q to quit")
    
    # Load ML Model
    ml_model, scaler = load_ml_model(exercise)
    if ml_model is None:
        print(f"WARNING: No trained ML model found for '{exercise}'.")
        print(f"Run 'python quick_train.py {exercise}' to train one.")
        print(f"Continuing with angle-based rep counting only.")
    else:
        print(f"Successfully loaded model for {exercise}.")

    model_path = download_model()
    if not model_path:
        return

    options = PoseLandmarkerOptions(
        base_options=BaseOptions(model_asset_path=model_path),
        running_mode=VisionRunningMode.IMAGE
    )
    
    try:
        pose = PoseLandmarker.create_from_options(options)
    except Exception as e:
        print(f"ERROR: Could not create pose landmarker: {e}")
        return

    cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
    if not cap.isOpened():
        cap = cv2.VideoCapture(0) # Fallback
        if not cap.isOpened():
            print("ERROR: Cannot open webcam. Try a different camera index.")
            return

    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

    rep_count = 0
    stage = None
    prev_time = time.time()
    fps = 0.0
    prediction_history = []
    no_pose_print_time = time.time()

    engine = init_engine()

    while True:
        success, frame = cap.read()
        if not success:
            print("ERROR: Failed to read frame from webcam.")
            break

        frame = cv2.flip(frame, 1)
        height, width = frame.shape[:2]

        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)
        
        try:
            results = pose.detect(mp_image)
        except Exception as e:
            print(f"Error during pose detection: {e}")
            continue

        if results.pose_landmarks:
            landmarks = results.pose_landmarks[0]
            
            pose_landmarks_proto = landmark_pb2.NormalizedLandmarkList()
            pose_landmarks_proto.landmark.extend([
                landmark_pb2.NormalizedLandmark(x=landmark.x, y=landmark.y, z=landmark.z) for landmark in landmarks
            ])
            
            mp.solutions.drawing_utils.draw_landmarks(
                frame,
                pose_landmarks_proto,
                mp.solutions.pose.POSE_CONNECTIONS,
                mp.solutions.drawing_utils.DrawingSpec(color=(0, 255, 0), thickness=2, circle_radius=3),
                mp.solutions.drawing_utils.DrawingSpec(color=(255, 255, 255), thickness=2)
            )

            angles = get_joint_angles(landmarks, width, height)
            
            # Predict Posture using the Trained Model
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
                color = (0, 255, 0) if is_correct else (0, 0, 255)
                
                # Draw the status at the top center
                text_size = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 1.0, 2)[0]
                text_x = (width - text_size[0]) // 2
                cv2.putText(frame, label, (text_x, 50), cv2.FONT_HERSHEY_SIMPLEX, 1.0, color, 3)
                cv2.putText(frame, f"Conf: {confidence:.2f}", (text_x + 20, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)

            # Rep Counting based on angles and model validation
            if exercise == "squat":
                main_angle = min(angles["left_knee"], angles["right_knee"])
                if main_angle > 160:
                    stage = "up"
                if main_angle < 90 and stage == "up":
                    stage = "down"
                    if is_correct or ml_model is None:
                        rep_count += 1
                        print(f"Rep {rep_count}. Good form!")
                        speak_async(f"Rep {rep_count}. Good form!", engine)
                    else:
                        speak_async("Check your form.", engine)
                
                draw_angle_text(frame, (20, 30), "Knee", main_angle)
            else:
                main_angle = min(angles["left_elbow"], angles["right_elbow"])
                if main_angle > 160:
                    stage = "up"
                if main_angle < 90 and stage == "up":
                    stage = "down"
                    if is_correct or ml_model is None:
                        rep_count += 1
                        print(f"Rep {rep_count}. Good form!")
                        speak_async(f"Rep {rep_count}. Good form!", engine)
                    else:
                        speak_async("Check your form.", engine)
                        
                draw_angle_text(frame, (20, 30), "Elbow", main_angle)

            cv2.putText(frame, f"Exercise: {exercise}", (20, height - 70), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 0), 2)
            cv2.putText(frame, f"Reps: {rep_count}", (20, height - 35), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 255, 255), 2)
        else:
            if time.time() - no_pose_print_time > 2.0:
                print("DEBUG: Pose not detected. Check lighting, camera angle, or distance.")
                no_pose_print_time = time.time()

        current_time = time.time()
        fps = 0.9 * fps + 0.1 * (1.0 / (current_time - prev_time + 1e-8))
        prev_time = current_time

        cv2.putText(frame, f"FPS: {int(fps)}", (width - 120, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
        
        cv2.imshow("Live AI Fitness Trainer", frame)

        key = cv2.waitKey(1) & 0xFF
        if key == 27 or key == ord("q") or key == ord("Q"):
            break

    cap.release()
    cv2.destroyAllWindows()
    pose.close()
    print(f"Session ended. Total {exercise} reps: {rep_count}")

if __name__ == "__main__":
    main()
