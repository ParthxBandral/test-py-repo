# Quick Start Commands

## 1. Collect Data from Webcam

### Collect CORRECT Squat Form
```powershell
& "C:\Users\Parth\AppData\Local\Programs\Python\Python312\python.exe" quick_collect.py squat correct
```

### Collect INCORRECT Squat Form
```powershell
& "C:\Users\Parth\AppData\Local\Programs\Python\Python312\python.exe" quick_collect.py squat incorrect
```

### Collect CORRECT Curl Form
```powershell
& "C:\Users\Parth\AppData\Local\Programs\Python\Python312\python.exe" quick_collect.py curl correct
```

## 2. Train Model
```powershell
& "C:\Users\Parth\AppData\Local\Programs\Python\Python312\python.exe" quick_train.py squat
```

## 3. Test Model
```powershell
& "C:\Users\Parth\AppData\Local\Programs\Python\Python312\python.exe" quick_test.py squat
```

---

## Typical Workflow:

1. Collect 50-100 examples of correct squat form
2. Collect 50-100 examples of incorrect squat form  
3. Train the model
4. Test with your live trainer
5. Repeat for curl and other exercises

Each data collection session:
- Press SPACE to START recording
- Press SPACE again to STOP recording (saves frames)
- Repeat 3-5 times to collect multiple videos
- Press Q to finish

**Time estimate**: ~10 minutes per exercise to collect good training data
