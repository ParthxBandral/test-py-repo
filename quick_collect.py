"""
Quick Data Collection Script
Usage: python quick_collect.py <exercise> <label>
Example: python quick_collect.py squat correct
"""

import sys
import cv2
import mediapipe as mp
import numpy as np
import json
import os
from datetime import datetime
from pathlib import Path
from mediapipe.framework.formats import landmark_pb2
import urllib.request

BaseOptions = mp.tasks.BaseOptions
PoseLandmarker = mp.tasks.vision.PoseLandmarker
PoseLandmarkerOptions = mp.tasks.vision.PoseLandmarkerOptions
VisionRunningMode = mp.tasks.vision.RunningMode

def download_model():
    """Download the pose landmarker model if it doesn't exist"""
    model_path = Path("pose_landmarker.task")
    if model_path.exists():
        return str(model_path)
    
    print("Downloading pose landmarker model...")
    url = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task"
    
    try:
        urllib.request.urlretrieve(url, model_path)
        print("✓ Model downloaded successfully")
        return str(model_path)
    except Exception as e:
        print(f"❌ Failed to download model: {e}")
        return None

def extract_landmarks(pose_results):
    """Extract landmarks from MediaPipe pose results"""
    if not pose_results.pose_landmarks:
        return None
    landmarks = []
    for landmark in pose_results.pose_landmarks[0]:
        landmarks.extend([landmark.x, landmark.y, landmark.z])
    return np.array(landmarks)

def collect_data(exercise_type, label, num_videos=3, samples_per_video=30):
    """Collect training data from webcam"""
    
    # Setup directories
    data_dir = Path("posture_data")
    data_dir.mkdir(exist_ok=True)
    exercise_dir = data_dir / exercise_type
    exercise_dir.mkdir(exist_ok=True)
    label_dir = exercise_dir / label
    label_dir.mkdir(exist_ok=True)
    
    print(f"\n{'='*50}")
    print(f"Collecting {label.upper()} {exercise_type.upper()} data")
    print(f"{'='*50}")
    print(f"\nInstructions:")
    print(f"  - Position yourself in front of the camera")
    print(f"  - Press SPACE to START recording")
    print(f"  - Press SPACE again to STOP recording")
    print(f"  - Repeat {num_videos} times")
    print(f"  - Press Q to exit\n")
    
    collected_data = []
    
    # Download model if needed
    model_path = download_model()
    if not model_path:
        return False
    
    # Create pose landmarker
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
        return False
    
    video_count = 0
    recording = False
    frame_count = 0
    
    while video_count < num_videos:
        ret, frame = cap.read()
        if not ret:
            print("ERROR: Failed to read frame")
            break
        
        frame = cv2.flip(frame, 1)
        h, w, c = frame.shape
        
        # Convert to RGB and create MediaPipe Image
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)
        pose_results = pose.detect(mp_image)
        
        # Draw landmarks
        if pose_results.pose_landmarks:
            landmarks = pose_results.pose_landmarks[0]
            pose_landmarks_proto = landmark_pb2.NormalizedLandmarkList()
            pose_landmarks_proto.landmark.extend([
                landmark_pb2.NormalizedLandmark(x=landmark.x, y=landmark.y, z=landmark.z) for landmark in landmarks
            ])
            # Use drawing utils from tasks
            mp.solutions.drawing_utils.draw_landmarks(
                frame,
                pose_landmarks_proto,
                mp.solutions.pose.POSE_CONNECTIONS
            )
            
            if recording and frame_count < samples_per_video:
                landmarks = extract_landmarks(pose_results)
                if landmarks is not None:
                    collected_data.append(landmarks)
                    frame_count += 1
        
        # UI Display
        status = "● RECORDING" if recording else "○ READY"
        color = (0, 255, 0) if recording else (200, 200, 200)
        
        cv2.rectangle(frame, (0, 0), (w, 100), (0, 0, 0), -1)
        cv2.putText(frame, status, (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 1.2, color, 2)
        cv2.putText(
            frame, 
            f"Video {video_count + 1}/{num_videos} | Frames {frame_count}/{samples_per_video}",
            (20, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1
        )
        
        cv2.imshow(f"Collecting {label} {exercise_type} data", frame)
        
        key = cv2.waitKey(1) & 0xFF
        if key == ord(' '):
            if not recording:
                recording = True
                frame_count = 0
                print(f"▶ Started recording video {video_count + 1}/{num_videos}")
            else:
                recording = False
                video_count += 1
                print(f"✓ Saved video {video_count} with {frame_count} frames")
        elif key == ord('q'):
            print("✗ Cancelled")
            cap.release()
            cv2.destroyAllWindows()
            pose.close()
            return False
    
    cap.release()
    cv2.destroyAllWindows()
    pose.close()
    
    # Save data
    if collected_data:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = label_dir / f"{label}_{timestamp}.json"
        
        data_to_save = {
            "exercise": exercise_type,
            "label": label,
            "count": len(collected_data),
            "landmarks": [arr.tolist() for arr in collected_data]
        }
        
        with open(filename, 'w') as f:
            json.dump(data_to_save, f)
        
        print(f"\n✓ Saved {len(collected_data)} samples to {filename}\n")
        return True
    
    return False

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python quick_collect.py <exercise> <label>")
        print("Example: python quick_collect.py squat correct")
        sys.exit(1)
    
    exercise = sys.argv[1].lower()
    label = sys.argv[2].lower()
    
    if exercise not in ["squat", "curl"]:
        print(f"ERROR: Invalid exercise '{exercise}'. Use 'squat' or 'curl'")
        sys.exit(1)
    
    if label not in ["correct", "incorrect"]:
        print(f"ERROR: Invalid label '{label}'. Use 'correct' or 'incorrect'")
        sys.exit(1)
    
    collect_data(exercise, label)
