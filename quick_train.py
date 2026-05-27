"""
Quick Training Script
Usage: python quick_train.py <exercise>
Example: python quick_train.py squat
"""

import sys
import json
import numpy as np
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, precision_score, recall_score, confusion_matrix
import pickle

def load_all_data():
    """Load all collected data"""
    X = []
    y = []
    
    data_dir = Path("posture_data")
    if not data_dir.exists():
        print("ERROR: No posture_data directory found!")
        print("Please collect data first using quick_collect.py")
        return None, None
    
    sample_count = 0
    for exercise_path in data_dir.iterdir():
        if exercise_path.is_dir():
            for label_path in exercise_path.iterdir():
                if label_path.is_dir():
                    label_value = 1 if label_path.name == "correct" else 0
                    
                    for json_file in label_path.glob("*.json"):
                        with open(json_file, 'r') as f:
                            data = json.load(f)
                            for landmarks in data["landmarks"]:
                                X.append(landmarks)
                                y.append(label_value)
                                sample_count += 1
    
    if sample_count == 0:
        print("ERROR: No training data found!")
        return None, None
    
    print(f"✓ Loaded {sample_count} samples")
    return np.array(X), np.array(y)

def train_model(exercise_type):
    """Train and evaluate the model"""
    
    print(f"\n{'='*50}")
    print(f"Training {exercise_type.upper()} Model")
    print(f"{'='*50}\n")
    
    X, y = load_all_data()
    
    if X is None:
        return False
    
    unique_labels = np.unique(y)
    if len(unique_labels) < 2:
        print("ERROR: Need both correct and incorrect samples!")
        print("Please collect more data using quick_collect.py")
        return False
    
    print(f"✓ Found {np.sum(y == 1)} correct samples and {np.sum(y == 0)} incorrect samples")
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"✓ Training set: {len(X_train)} samples")
    print(f"✓ Test set: {len(X_test)} samples\n")
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train model
    print("Training Random Forest Classifier...")
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=15,
        random_state=42,
        n_jobs=-1
    )
    
    model.fit(X_train_scaled, y_train)
    
    # Evaluate
    y_train_pred = model.predict(X_train_scaled)
    y_test_pred = model.predict(X_test_scaled)
    
    train_acc = accuracy_score(y_train, y_train_pred)
    test_acc = accuracy_score(y_test, y_test_pred)
    
    print(f"\n{'='*50}")
    print(f"Training Results")
    print(f"{'='*50}")
    print(f"Training Accuracy:  {train_acc:.1%}")
    print(f"Testing Accuracy:   {test_acc:.1%}")
    print(f"Precision:          {precision_score(y_test, y_test_pred):.1%}")
    print(f"Recall:             {recall_score(y_test, y_test_pred):.1%}")
    
    cm = confusion_matrix(y_test, y_test_pred)
    print(f"\nConfusion Matrix:")
    print(f"  Incorrect → Incorrect: {cm[0][0]}")
    print(f"  Incorrect → Correct:   {cm[0][1]}")
    print(f"  Correct → Incorrect:   {cm[1][0]}")
    print(f"  Correct → Correct:     {cm[1][1]}")
    
    # Save model
    models_dir = Path("trained_models")
    models_dir.mkdir(exist_ok=True)
    
    model_file = models_dir / f"{exercise_type}_model.pkl"
    scaler_file = models_dir / f"{exercise_type}_scaler.pkl"
    
    with open(model_file, 'wb') as f:
        pickle.dump(model, f)
    with open(scaler_file, 'wb') as f:
        pickle.dump(scaler, f)
    
    print(f"\n✓ Model saved to {model_file}")
    print(f"✓ Scaler saved to {scaler_file}\n")
    
    return True

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python quick_train.py <exercise>")
        print("Example: python quick_train.py squat")
        sys.exit(1)
    
    exercise = sys.argv[1].lower()
    
    if exercise not in ["squat", "curl"]:
        print(f"ERROR: Invalid exercise '{exercise}'. Use 'squat' or 'curl'")
        sys.exit(1)
    
    train_model(exercise)
