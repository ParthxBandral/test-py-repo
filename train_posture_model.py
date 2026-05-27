"""
Posture Detection Model Training Script
This script collects pose landmark data and trains a classifier to distinguish
between correct and incorrect postures for exercises like squats and curls.
"""

import cv2
import mediapipe as mp
import numpy as np
import json
import os
from datetime import datetime
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import pickle
from mediapipe.framework.formats import landmark_pb2

# MediaPipe tasks API setup
import urllib.request

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
        print(f"Failed to download pose model: {e}")
        return None


class PostureDataCollector:
    def __init__(self, exercise_type="squat", label="correct"):
        """
        Initialize the data collector
        exercise_type: 'squat' or 'curl'
        label: 'correct' or 'incorrect'
        """
        self.exercise_type = exercise_type
        self.label = label
        self.data_dir = Path("posture_data")
        self.data_dir.mkdir(exist_ok=True)
        
        # Create subdirectories
        self.exercise_dir = self.data_dir / exercise_type
        self.exercise_dir.mkdir(exist_ok=True)
        
        self.label_dir = self.exercise_dir / label
        self.label_dir.mkdir(exist_ok=True)
        
        self.collected_data = []

    def extract_landmarks(self, pose_results):
        """Extract landmarks from MediaPipe pose results"""
        if not pose_results.pose_landmarks:
            return None
        
        landmarks = []
        for landmark in pose_results.pose_landmarks[0]:
            landmarks.extend([landmark.x, landmark.y, landmark.z])
        
        return np.array(landmarks)

    def collect_from_camera(self, samples_per_video=30, num_videos=5):
        """
        Collect training data from webcam
        samples_per_video: number of frames to extract per video
        num_videos: number of videos to record
        """
        print(f"\nCollecting {self.label} {self.exercise_type} data...")
        print(f"Press SPACE to start/stop recording")
        print(f"Press 'q' to quit collection\n")

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
            print(f"Error creating pose landmarker: {e}")
            return False

        cap = cv2.VideoCapture(0)
        
        if not cap.isOpened():
            print("Error: Cannot open webcam")
            pose.close()
            return False
        
        video_count = 0
        recording = False
        frame_count = 0
        
        while video_count < num_videos:
            ret, frame = cap.read()
            if not ret:
                break
            
            frame = cv2.flip(frame, 1)
            h, w, c = frame.shape
            
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)
            pose_results = pose.detect(mp_image)
            
            # Draw pose landmarks
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
                
                # Extract landmarks if recording
                if recording and frame_count < samples_per_video:
                    landmarks = self.extract_landmarks(pose_results)
                    if landmarks is not None:
                        self.collected_data.append(landmarks)
                        frame_count += 1
            
            # Display status
            status = "RECORDING" if recording else "READY"
            color = (0, 255, 0) if recording else (0, 0, 255)
            cv2.putText(frame, f"{status} - {self.label} {self.exercise_type}", 
                       (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, color, 2)
            cv2.putText(frame, f"Video: {video_count}/{num_videos} | Frames: {frame_count}/{samples_per_video}",
                       (10, 70), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
            
            cv2.imshow(f"Collecting {self.label} {self.exercise_type} Data", frame)
            
            key = cv2.waitKey(1) & 0xFF
            if key == ord(' '):  # Space to toggle recording
                if not recording:
                    recording = True
                    frame_count = 0
                    print(f"Started recording video {video_count + 1}")
                else:
                    recording = False
                    video_count += 1
                    print(f"Finished video {video_count}. Saved {frame_count} frames")
            elif key == ord('q'):
                break
        
        cap.release()
        cv2.destroyAllWindows()
        pose.close()
        
        return True

    def collect_from_video(self, video_path, samples_per_video=30):
        """Collect training data from a video file"""
        print(f"\nExtracting frames from {video_path}...")

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
            print(f"Error creating pose landmarker: {e}")
            return False

        cap = cv2.VideoCapture(video_path)
            
        if not cap.isOpened():
            print(f"Error: Cannot open video {video_path}")
            pose.close()
            return False
            
        frame_count = 0
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        frame_interval = max(1, total_frames // samples_per_video)
        
        frame_idx = 0
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            if frame_idx % frame_interval == 0 and len(self.collected_data) < samples_per_video:
                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)
                pose_results = pose.detect(mp_image)
                
                if pose_results.pose_landmarks:
                    landmarks = self.extract_landmarks(pose_results)
                    if landmarks is not None:
                        self.collected_data.append(landmarks)
                        frame_count += 1
            
            frame_idx += 1
        
        cap.release()
        pose.close()
        print(f"Extracted {frame_count} frames from video")
        return True

    def save_data(self):
        """Save collected data to JSON file"""
        if not self.collected_data:
            print("No data collected!")
            return False
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = self.label_dir / f"{self.label}_{timestamp}.json"
        
        data_to_save = {
            "exercise": self.exercise_type,
            "label": self.label,
            "count": len(self.collected_data),
            "landmarks": [arr.tolist() for arr in self.collected_data]
        }
        
        with open(filename, 'w') as f:
            json.dump(data_to_save, f)
        
        print(f"Saved {len(self.collected_data)} samples to {filename}")
        return True


class PostureModelTrainer:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.exercise_types = {}
        self.models_dir = Path("trained_models")
        self.models_dir.mkdir(exist_ok=True)

    def load_all_data(self):
        """Load all collected data from the data directory"""
        X = []
        y = []
        
        data_dir = Path("posture_data")
        if not data_dir.exists():
            print("No data directory found!")
            return None, None
        
        # Iterate through exercises
        for exercise_path in data_dir.iterdir():
            if exercise_path.is_dir():
                exercise_name = exercise_path.name
                label_map = {"correct": 1, "incorrect": 0}
                
                # Iterate through labels (correct/incorrect)
                for label_path in exercise_path.iterdir():
                    if label_path.is_dir():
                        label_name = label_path.name
                        label_value = label_map.get(label_name, -1)
                        
                        # Load all JSON files
                        for json_file in label_path.glob("*.json"):
                            with open(json_file, 'r') as f:
                                data = json.load(f)
                                for landmarks in data["landmarks"]:
                                    X.append(landmarks)
                                    y.append(label_value)
        
        if not X:
            print("No data files found in posture_data directory!")
            return None, None
        
        print(f"Loaded {len(X)} samples")
        return np.array(X), np.array(y)

    def train(self, exercise_type="squat"):
        """Train a classifier for a specific exercise"""
        print(f"\nTraining model for {exercise_type}...")
        
        X, y = self.load_all_data()
        
        if X is None or len(X) == 0:
            print("No training data available!")
            return False
        
        # Filter data for specific exercise if needed
        # (In this simple version, we train on all data)
        
        if len(np.unique(y)) < 2:
            print("Need both correct and incorrect samples!")
            return False
        
        # Split data (simple 80-20 split)
        from sklearn.model_selection import train_test_split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train Random Forest
        self.model = RandomForestClassifier(
            n_estimators=100,
            max_depth=15,
            random_state=42,
            n_jobs=-1
        )
        
        self.model.fit(X_train_scaled, y_train)
        
        # Evaluate
        train_score = self.model.score(X_train_scaled, y_train)
        test_score = self.model.score(X_test_scaled, y_test)
        
        print(f"Training accuracy: {train_score:.4f}")
        print(f"Testing accuracy: {test_score:.4f}")
        
        return True

    def save_model(self, exercise_type="squat"):
        """Save trained model and scaler"""
        if self.model is None:
            print("No model to save!")
            return False
        
        model_file = self.models_dir / f"{exercise_type}_model.pkl"
        scaler_file = self.models_dir / f"{exercise_type}_scaler.pkl"
        
        with open(model_file, 'wb') as f:
            pickle.dump(self.model, f)
        
        with open(scaler_file, 'wb') as f:
            pickle.dump(self.scaler, f)
        
        print(f"Model saved to {model_file}")
        print(f"Scaler saved to {scaler_file}")
        return True

    def load_model(self, exercise_type="squat"):
        """Load trained model and scaler"""
        model_file = self.models_dir / f"{exercise_type}_model.pkl"
        scaler_file = self.models_dir / f"{exercise_type}_scaler.pkl"
        
        if not model_file.exists() or not scaler_file.exists():
            print(f"Model files not found for {exercise_type}")
            return False
        
        with open(model_file, 'rb') as f:
            self.model = pickle.load(f)
        
        with open(scaler_file, 'rb') as f:
            self.scaler = pickle.load(f)
        
        print(f"Model loaded from {model_file}")
        return True


def main():
    print("=== AI Fitness Posture Training System ===\n")
    
    while True:
        print("\n1. Collect training data from webcam")
        print("2. Collect training data from video file")
        print("3. Train model")
        print("4. Exit")
        
        choice = input("\nSelect option (1-4): ").strip()
        
        if choice == "1":
            exercise = input("Exercise (squat/curl): ").strip().lower()
            label = input("Label (correct/incorrect): ").strip().lower()
            
            if exercise in ["squat", "curl"] and label in ["correct", "incorrect"]:
                collector = PostureDataCollector(exercise, label)
                collector.collect_from_camera(samples_per_video=30, num_videos=3)
                collector.save_data()
            else:
                print("Invalid exercise or label!")
        
        elif choice == "2":
            video_path = input("Enter video file path: ").strip()
            exercise = input("Exercise (squat/curl): ").strip().lower()
            label = input("Label (correct/incorrect): ").strip().lower()
            
            if Path(video_path).exists() and exercise in ["squat", "curl"] and label in ["correct", "incorrect"]:
                collector = PostureDataCollector(exercise, label)
                collector.collect_from_video(video_path, samples_per_video=30)
                collector.save_data()
            else:
                print("Invalid video path, exercise, or label!")
        
        elif choice == "3":
            trainer = PostureModelTrainer()
            exercise = input("Exercise (squat/curl): ").strip().lower()
            
            if exercise in ["squat", "curl"]:
                if trainer.train(exercise):
                    save = input("Save model? (y/n): ").strip().lower()
                    if save == "y":
                        trainer.save_model(exercise)
            else:
                print("Invalid exercise!")
        
        elif choice == "4":
            print("Goodbye!")
            break
        
        else:
            print("Invalid option!")


if __name__ == "__main__":
    main()
