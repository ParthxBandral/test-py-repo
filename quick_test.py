"""
Quick Model Testing Script
Usage: python quick_test.py <exercise>
Example: python quick_test.py squat
"""

import sys
import cv2
import mediapipe as mp
import numpy as np
import pickle
import urllib.request
from pathlib import Path
from mediapipe.framework.formats import landmark_pb2

# MediaPipe setup
BaseOptions = mp.tasks.BaseOptions
PoseLandmarker = mp.tasks.vision.PoseLandmarker
PoseLandmarkerOptions = mp.tasks.vision.PoseLandmarkerOptions
VisionRunningMode = mp.tasks.vision.RunningMode

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

def load_model(exercise_type):
    """Load trained model and scaler"""
    models_dir = Path("trained_models")
    
    model_file = models_dir / f"{exercise_type}_model.pkl"
    scaler_file = models_dir / f"{exercise_type}_scaler.pkl"
    
    if not model_file.exists() or not scaler_file.exists():
        print(f"ERROR: Model files not found for '{exercise_type}'")
        print(f"  Looking for: {model_file}")
        print(f"              {scaler_file}")
        return None, None
    
    with open(model_file, 'rb') as f:
        model = pickle.load(f)
    with open(scaler_file, 'rb') as f:
        scaler = pickle.load(f)
    
    print(f"✓ Loaded model from {model_file}")
    return model, scaler

def extract_landmarks(pose_results):
    """Extract landmarks from MediaPipe pose results"""
    if not pose_results.pose_landmarks:
        return None
    landmarks = []
    for landmark in pose_results.pose_landmarks[0]:
        landmarks.extend([landmark.x, landmark.y, landmark.z])
    return np.array(landmarks)

def test_model(exercise_type):
    """Test model with webcam feed"""
    
    print(f"\n{'='*50}")
    print(f"Testing {exercise_type.upper()} Model")
    print(f"{'='*50}\n")
    
    model, scaler = load_model(exercise_type)
    if model is None:
        return False
    
    print(f"Instructions:")
    print(f"  - Position yourself in front of camera")
    print(f"  - Model will predict: CORRECT or INCORRECT")
    print(f"  - Press Q to exit\n")
    
    model_path = download_model()
    if not model_path:
        return False

    options = PoseLandmarkerOptions(
        base_options=BaseOptions(model_asset_path=model_path),
        running_mode=VisionRunningMode.IMAGE
    )
    try:
        pose = PoseLandmarker.create_from_options(options)
    except Exception as e:
        print(f"ERROR: Could not create pose landmarker: {e}")
        return False

    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        print("ERROR: Cannot open webcam!")
        pose.close()
        return False
    
    frame_count = 0
    prediction_history = []

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame = cv2.flip(frame, 1)
        h, w, c = frame.shape
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)
        pose_results = pose.detect(mp_image)

        if pose_results.pose_landmarks:
            landmarks = pose_results.pose_landmarks[0]
            pose_landmarks_proto = landmark_pb2.NormalizedLandmarkList()
            pose_landmarks_proto.landmark.extend([
                landmark_pb2.NormalizedLandmark(x=landmark.x, y=landmark.y, z=landmark.z) for landmark in landmarks
            ])
            mp.solutions.drawing_utils.draw_landmarks(
                frame,
                pose_landmarks_proto,
                mp.solutions.pose.POSE_CONNECTIONS
            )

            landmarks = extract_landmarks(pose_results)
            if landmarks is not None:
                landmarks_scaled = scaler.transform([landmarks])
                prediction = model.predict(landmarks_scaled)[0]
                confidence = max(model.predict_proba(landmarks_scaled)[0])

                prediction_history.append(prediction)
                if len(prediction_history) > 5:
                    prediction_history.pop(0)

                avg_prediction = np.mean(prediction_history)
                label = "✓ CORRECT" if avg_prediction >= 0.5 else "✗ INCORRECT"
                color = (0, 255, 0) if avg_prediction >= 0.5 else (0, 0, 255)

                cv2.rectangle(frame, (0, 0), (w, 100), (0, 0, 0), -1)
                cv2.putText(frame, label, (20, 50), cv2.FONT_HERSHEY_SIMPLEX, 1.5, color, 2)
                cv2.putText(frame, f"Confidence: {confidence:.1%}", (20, 85), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)

        cv2.imshow(f"Testing {exercise_type} model (Press Q to exit)", frame)

        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break

        frame_count += 1

    cap.release()
    cv2.destroyAllWindows()
    pose.close()

    print(f"✓ Tested {frame_count} frames")
    return True

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python quick_test.py <exercise>")
        print("Example: python quick_test.py squat")
        sys.exit(1)
    
    exercise = sys.argv[1].lower()
    
    if exercise not in ["squat", "curl"]:
        print(f"ERROR: Invalid exercise '{exercise}'. Use 'squat' or 'curl'")
        sys.exit(1)
    
    test_model(exercise)
