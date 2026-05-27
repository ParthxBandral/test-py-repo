# Posture Detection Model Training Guide

## Overview
This guide explains how to train your AI fitness posture detection model using the provided training script.

## Setup

1. **Install Dependencies** (already done):
```powershell
& "C:\Users\Parth\AppData\Local\Programs\Python\Python312\python.exe" -m pip install opencv-python mediapipe numpy scikit-learn
```

## Training Workflow

### Step 1: Collect Training Data

You need to collect samples of **correct** and **incorrect** postures for each exercise (squat, curl, etc.).

#### Option A: Collect from Webcam (Recommended for Starting)
```powershell
& "C:\Users\Parth\AppData\Local\Programs\Python\Python312\python.exe" train_posture_model.py
```

Then select option `1`:
- Enter exercise type: `squat` (or `curl`)
- Enter label: `correct` (or `incorrect`)
- Press SPACE to start/stop recording each video
- Record 3-5 videos with 30 frames each
- Press `q` to exit

**Tips:**
- Make sure you have good lighting
- Position your camera so the full body is visible
- Record from different angles
- Include various body positions within the correct posture range

#### Option B: Collect from Video Files
```powershell
& "C:\Users\Parth\AppData\Local\Programs\Python\Python312\python.exe" train_posture_model.py
```

Then select option `2`:
- Provide path to your video file
- Enter exercise and label
- The script will extract frames automatically

### Step 2: Organize Your Data

After collection, your data structure will look like:
```
posture_data/
  squat/
    correct/
      correct_20260428_120000.json
      correct_20260428_120030.json
    incorrect/
      incorrect_20260428_120100.json
  curl/
    correct/
    incorrect/
```

### Step 3: Train the Model

Run the script again and select option `3`:
```powershell
& "C:\Users\Parth\AppData\Local\Programs\Python\Python312\python.exe" train_posture_model.py
```

The script will:
1. Load all collected data from `posture_data/` directory
2. Split into training (80%) and testing (20%) sets
3. Train a Random Forest classifier
4. Show training and testing accuracy
5. Ask if you want to save the model

**Expected Results:**
- Aim for 80%+ accuracy on test data
- If accuracy is low, collect more diverse samples

### Step 4: Use the Trained Model

Once saved, your models will be in `trained_models/`:
```
trained_models/
  squat_model.pkl
  squat_scaler.pkl
  curl_model.pkl
  curl_scaler.pkl
```

## Integration with Your Next.js App

To use the trained model in your frontend, you can:

1. **Option A**: Use TensorFlow.js to convert the model (advanced)
2. **Option B**: Create a Python API backend that uses the trained models
3. **Option C**: Retrain models using TensorFlow/Keras for web deployment

For now, focus on Step 1-3 above to build a good dataset and train locally.

## Data Collection Best Practices

### For Correct Posture:
- **Squat**: Feet shoulder-width apart, knees aligned with toes, back straight, weight on heels
- **Curl**: Elbow stationary, arm bent 90 degrees, controlled movement, no swinging

### For Incorrect Posture:
- **Squat**: Knees caving inward, heel lift, excessive forward lean, curved back
- **Curl**: Excessive elbow movement, swinging the weight, using momentum, elbows out

### Minimum Dataset Size:
- Minimum: 30 samples per category (correct/incorrect per exercise)
- Recommended: 100+ samples per category for best accuracy
- Ideal: 200+ samples per category

## Troubleshooting

**Problem: "No data found" when training**
- Solution: Make sure you've collected and saved data in Step 1

**Problem: Low accuracy (< 70%)**
- Solution: 
  - Collect more diverse samples
  - Ensure correct samples are truly correct
  - Ensure incorrect samples show common mistakes
  - Record from multiple angles

**Problem: Camera not opening**
- Solution:
  - Check if webcam is connected
  - Close other applications using camera
  - Try a different USB port

**Problem: Slow performance**
- Solution: The Random Forest model is lightweight and should run on most machines. If slow:
  - Close unnecessary applications
  - Reduce number of frames collected

## Next Steps

Once you have a trained model:
1. Test it with new videos to verify accuracy
2. Create more categories (other exercises)
3. Integrate with your Next.js app
4. Consider deploying the Python backend as an API

## File Structure

```
c:\Users\Parth\Desktop\ai\
├── train_posture_model.py          # Main training script
├── posture_data/                   # Collected training data
│   ├── squat/
│   │   ├── correct/
│   │   └── incorrect/
│   └── curl/
│       ├── correct/
│       └── incorrect/
└── trained_models/                 # Saved trained models
    ├── squat_model.pkl
    ├── squat_scaler.pkl
    ├── curl_model.pkl
    └── curl_scaler.pkl
```

## Contact & Support

If you have issues:
1. Check the error message carefully
2. Verify your video file exists and is readable
3. Ensure webcam permissions are granted
4. Try with a different video/exercise
