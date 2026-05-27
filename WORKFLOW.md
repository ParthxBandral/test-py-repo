# Complete AI Fitness Trainer Workflow

## 🚀 Full Pipeline: Data → Train → Live

### Phase 1️⃣: Collect Training Data

```powershell
# Collect CORRECT squat form (record 3-5 videos)
& python quick_collect.py squat correct

# Collect INCORRECT squat form (record 3-5 videos)  
& python quick_collect.py squat incorrect
```

**What to do:**
- Press SPACE to START recording
- Do the exercise properly (or incorrectly for the "incorrect" version)
- Press SPACE to STOP recording
- Repeat 3-5 times to capture variety

**Tips:**
- Record from different angles
- Include different speeds and ranges
- Make sure lighting is good

---

### Phase 2️⃣: Train Your Model

```powershell
& python quick_train.py squat
```

**Output will show:**
- Training accuracy (aim for 80%+)
- Testing accuracy
- Model saved to `trained_models/squat_model.pkl`

---

### Phase 3️⃣: Test Model (Optional)

```powershell
& python quick_test.py squat
```

**Real-time testing:**
- Shows prediction accuracy
- Verifies model works with your form

---

### Phase 4️⃣: Use Live Trainer

```powershell
# Start training with rep counter
& python live_trainer.py squat

# Or use default (squat)
& python live_trainer.py
```

**Live trainer features:**
- ✓ Real-time posture feedback
- ✓ Rep counting
- ✓ Audio feedback ("Rep 1. Good form!")
- ✓ Confidence scoring

---

## 📊 Data Collection Requirements

### Minimum Dataset
- **30+ samples** per category (correct/incorrect)
- **Recommended**: 50-100 per category for best accuracy

### Quality Checklist
- ✅ Full body visible
- ✅ Good lighting
- ✅ Multiple angles
- ✅ Clear, correct form in "correct" videos
- ✅ Common mistakes in "incorrect" videos

---

## 🎯 Quick Start Commands

Create an alias to avoid typing the full Python path:

### Option A: PowerShell Profile (Recommended)

1. Open PowerShell and run:
```powershell
notepad $PROFILE
```

2. Add these lines:
```powershell
Set-Alias python "C:\Users\Parth\AppData\Local\Programs\Python\Python312\python.exe"
```

3. Save and restart PowerShell

4. Now you can use:
```powershell
python quick_collect.py squat correct
python quick_train.py squat
python live_trainer.py squat
```

### Option B: Batch File

Create `C:\Users\Parth\Desktop\ai\run.bat`:
```batch
@echo off
"C:\Users\Parth\AppData\Local\Programs\Python\Python312\python.exe" %*
```

Then use:
```powershell
.\run.py quick_collect.py squat correct
.\run.py quick_train.py squat
.\run.py live_trainer.py squat
```

---

## 📈 Typical Workflow

### Day 1: Initial Setup (45 minutes)
```powershell
# Collect correct squat data
python quick_collect.py squat correct          # 10 min

# Collect incorrect squat data
python quick_collect.py squat incorrect        # 10 min

# Train model
python quick_train.py squat                    # 5 min

# Test model
python quick_test.py squat                     # 5 min

# Use live trainer
python live_trainer.py squat                   # 15 min
```

### Subsequent Days: Just Use It
```powershell
python live_trainer.py squat                   # Ready to go!
```

---

## 🔄 Rep Counting Logic

### How it Works

For **Squat** exercise:
1. **Incorrect posture** → "down" stage
2. **Correct posture** → "up" stage
3. When transition from down→up happens → **Rep counted!**
4. Audio feedback: "Rep 1. Good form!"

### Rep Counting Process
```
Frame 1: Incorrect form (down)
Frame 2: Incorrect form (down)  
Frame 3: Incorrect form (down)
Frame 4: Correct form (up) ← Rep counted! "Rep 1. Good form!"
Frame 5: Correct form (up)
Frame 6: Incorrect form (down)
Frame 7: Incorrect form (down)
Frame 8: Correct form (up) ← Rep counted! "Rep 2. Good form!"
```

---

## 📁 File Structure

```
c:\Users\Parth\Desktop\ai\
├── posture_data/                 # Your collected training data
│   └── squat/
│       ├── correct/
│       │   ├── correct_*.json    # Your recorded data
│       │   └── correct_*.json
│       └── incorrect/
│           ├── incorrect_*.json
│           └── incorrect_*.json
│
├── trained_models/               # Trained model files
│   ├── squat_model.pkl           # Random Forest classifier
│   └── squat_scaler.pkl          # Feature scaler
│
├── live_trainer.py               # Rep counter (main app)
├── quick_collect.py              # Data collection
├── quick_train.py                # Model training
├── quick_test.py                 # Model testing
└── train_posture_model.py        # Full-featured trainer
```

---

## ⚙️ Customization

### Change Rep Counting Logic

Edit `live_trainer.py`, find the rep counting section:

```python
# For squat - adjust based on your form
if exercise_type == "squat":
    if most_common_pred == 0 and stage != "down":  # Down position
        stage = "down"
    elif most_common_pred == 1 and stage == "down":  # Up position
        stage = "up"
        rep_count += 1
        speak(f"Rep {rep_count}. Good form!")
```

### Adjust Speech Speed

In `live_trainer.py`:
```python
engine.setProperty('rate', 150)  # 150 = normal, 100 = slow, 200 = fast
```

### Change Confidence Threshold

```python
confidence_threshold = 0.6  # Increase to 0.7+ for stricter predictions
```

---

## 🐛 Troubleshooting

### Issue: Model not found
```
❌ Model files not found for 'squat'
```
**Solution**: Run `python quick_train.py squat` first

### Issue: Low accuracy during training
**Solution**: Collect more data (100+ samples per category)

### Issue: Rep counter not working
**Solution**: 
1. Run `python quick_test.py squat` to verify model accuracy
2. Ensure training data represents actual form differences
3. Adjust stage transition logic if needed

### Issue: No audio feedback
**Solution**: 
- Check system volume
- Verify speakers/headphones connected
- Try different text: `speak("Test")`

---

## 📊 Monitoring Performance

### After each session:
- Note the final rep count
- Note accuracy (confidence percentages)
- Collect more data if accuracy < 75%
- Retrain model periodically for better accuracy

### Track progress:
- Day 1: X reps completed
- Day 2: Y reps completed
- Watch accuracy improve with more data collection

---

## 🎓 Next Steps

### Step 1: Get working
- Collect 30 squat samples (correct + incorrect)
- Train model
- Test with live trainer

### Step 2: Improve
- Collect 100+ samples for higher accuracy
- Retrain model
- Test different exercises (curl, pushup, etc.)

### Step 3: Deploy
- Integrate with your Next.js frontend
- Create Python API backend
- Build web interface for tracking

---

## 💡 Pro Tips

1. **Collect incrementally**: Don't collect everything at once. Train, test, collect more problematic cases
2. **Rebalance**: Keep correct/incorrect samples roughly equal
3. **Retrain often**: Every 50 new samples, retrain for better accuracy
4. **Vary angles**: Record from front, side, and 45-degree angles
5. **Include failures**: Show common form mistakes in "incorrect" category

---

## 📞 Support

**Command reference:**
- Collect data: `python quick_collect.py <exercise> <label>`
- Train model: `python quick_train.py <exercise>`
- Test model: `python quick_test.py <exercise>`
- Live training: `python live_trainer.py <exercise>`

All scripts auto-generate directories, no manual setup needed!
