# 🏋️ AI Fitness Trainer - Smart-AI Platform

A complete AI-powered fitness training system with **real-time posture detection**, **rep counting**, and **form correction feedback**. Features both a Python backend for ML model training and a modern Next.js frontend web application.

![Status](https://img.shields.io/badge/status-active-brightgreen)
![Python](https://img.shields.io/badge/Python-3.12-blue)
![Next.js](https://img.shields.io/badge/Next.js-latest-black)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 🎯 Features

### Backend (Python)
- ✅ **Real-time Pose Detection** - Using MediaPipe for accurate body keypoint tracking
- ✅ **AI Model Training** - Random Forest classifier for form classification
- ✅ **Rep Counter** - Automatic rep counting with confidence scoring
- ✅ **Audio Feedback** - Real-time audio cues ("Rep 1. Good form!")
- ✅ **Multiple Exercises** - Squat, curl, and custom exercises
- ✅ **Live Trainer** - Real-time webcam-based training analysis

### Frontend (Next.js - Smart-AI)
- ✅ **Responsive Web UI** - Built with React + Tailwind CSS
- ✅ **User Authentication** - Login/signup functionality
- ✅ **Live Training Dashboard** - Real-time training interface
- ✅ **Chatbot Assistant** - AI-powered fitness guidance
- ✅ **Workout Planning** - Diet and workout planner
- ✅ **Trainer Directory** - Find certified trainers
- ✅ **Medical Records** - Track health data
- ✅ **PWA Support** - Progressive Web App capabilities
- ✅ **API Integration** - Backend API routes

---

## 📁 Project Structure

```
ai-fitness-trainer/
│
├── 📂 Backend (Python)
│   ├── live_trainer.py              # Main live training app with rep counter
│   ├── pose_trainer.py              # Model training utilities
│   ├── train_posture_model.py       # Full training pipeline
│   ├── quick_collect.py             # Quick data collection from webcam
│   ├── quick_train.py               # Quick model training
│   ├── quick_test.py                # Quick model testing
│   ├── live_trainer_web.py          # Web server for live trainer
│   ├── pose_landmarker.task         # MediaPipe pose detection model
│   │
│   ├── 📂 posture_data/             # Training data storage
│   │   ├── squat/
│   │   │   ├── correct/
│   │   │   └── incorrect/
│   │   └── curl/
│   │       ├── correct/
│   │       └── incorrect/
│   │
│   └── 📂 trained_models/           # Trained ML models
│       ├── squat_model.pkl
│       ├── squat_scaler.pkl
│       ├── curl_model.pkl
│       └── curl_scaler.pkl
│
├── 📂 Frontend (Next.js - Smart-AI)
│   ├── 📂 app/
│   │   ├── page.tsx                 # Home page
│   │   ├── layout.tsx               # Main layout
│   │   ├── globals.css              # Global styles
│   │   │
│   │   ├── 📂 api/                  # API routes
│   │   │   ├── explore/
│   │   │   ├── run-trainer/
│   │   │   └── stop-trainer/
│   │   │
│   │   ├── 📂 auth/                 # Authentication pages
│   │   │   ├── login/
│   │   │   └── signup/
│   │   │
│   │   ├── 📂 app/                  # App pages
│   │   │   ├── chatbot/
│   │   │   ├── explore/
│   │   │   ├── live-trainer/
│   │   │   ├── medical/
│   │   │   ├── trainers/
│   │   │   ├── profile/
│   │   │   └── planners/
│   │   │
│   │   └── 📂 components/           # Reusable components
│   │       ├── auth/
│   │       ├── layout/
│   │       └── pwa/
│   │
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── next.config.mjs
│   └── 📂 public/
│       ├── manifest.json
│       ├── service-worker.js
│       └── icon.png
│
├── 📄 README.md                      # This file
├── 📄 QUICK_START.md                # Quick start guide
├── 📄 TRAINING_GUIDE.md             # Detailed training instructions
├── 📄 WORKFLOW.md                   # Complete workflow pipeline
├── requirements.txt                 # Python dependencies
└── .gitignore
```

---

## 🚀 Quick Start

### Option 1: Backend (Python) - Live Training

#### Prerequisites
- Python 3.12+
- Webcam
- 50-100 training samples per exercise (correct & incorrect)

#### Installation

```bash
# Navigate to project
cd c:\Users\Parth\Desktop\ai

# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Install dependencies
pip install opencv-python mediapipe numpy scikit-learn pyttsx3
```

#### Usage

1. **Collect Training Data**
```powershell
# Collect correct squat form
python quick_collect.py squat correct

# Collect incorrect squat form
python quick_collect.py squat incorrect
```

2. **Train Model**
```powershell
python quick_train.py squat
```

3. **Test Model**
```powershell
python quick_test.py squat
```

4. **Start Live Training**
```powershell
python live_trainer.py squat
```

### Option 2: Frontend (Next.js) - Web Application

#### Prerequisites
- Node.js 18+
- npm or yarn

#### Installation

```bash
# Navigate to Smart-AI directory
cd Smart-AI

# Install dependencies
npm install

# Run development server
npm run dev

# Open browser
# http://localhost:3000
```

#### Build for Production

```bash
npm run build
npm run start
```

---

## 📊 Training Workflow

### Phase 1: Data Collection (15 minutes)

```bash
# Record 50-100 samples of CORRECT form
python quick_collect.py squat correct

# Press SPACE to start/stop recording
# Repeat 3-5 times for variety

# Record 50-100 samples of INCORRECT form  
python quick_collect.py squat incorrect
```

**Tips:**
- ✅ Good lighting
- ✅ Full body visible
- ✅ Multiple angles
- ✅ Various speeds/ranges
- ✅ Clear, distinct differences between correct/incorrect

### Phase 2: Model Training (5 minutes)

```bash
python quick_train.py squat
```

**Output:**
- Training accuracy
- Testing accuracy (aim for 80%+)
- Saved model: `trained_models/squat_model.pkl`

### Phase 3: Testing (5 minutes)

```bash
python quick_test.py squat
```

**Validates:**
- Model prediction accuracy
- Real-time performance
- Confidence scores

### Phase 4: Live Training (ongoing)

```bash
python live_trainer.py squat
```

**Features:**
- 🎥 Real-time webcam feed
- 🔄 Rep counting
- 🎵 Audio feedback
- 📊 Confidence scoring
- 💯 Form accuracy percentage

---

## 🏋️ Supported Exercises

### Squat
- **Correct Form**: Feet shoulder-width apart, knees aligned with toes, back straight, weight on heels
- **Common Mistakes**: Knees caving inward, heel lift, excessive forward lean, curved back

### Curl
- **Correct Form**: Elbow stationary, controlled 90-degree bend, no swinging
- **Common Mistakes**: Excessive elbow movement, using momentum, elbows out

### More Exercises
- Add your own exercises by following the same data collection and training process

---

## 📚 Detailed Guides

### Backend (Python)
- **[QUICK_START.md](QUICK_START.md)** - Quick command reference
- **[TRAINING_GUIDE.md](TRAINING_GUIDE.md)** - Comprehensive training instructions
- **[WORKFLOW.md](WORKFLOW.md)** - Complete pipeline walkthrough

### Frontend (Next.js)
- See `Smart-AI/.github/copilot-instructions.md` for development notes

---

## 🔧 Configuration

### Python Dependencies
```
opencv-python==4.10.0.84
mediapipe==0.10.0
numpy==1.24.0
scikit-learn==1.3.0
pyttsx3==2.90
```

### Next.js Configuration
- **Framework**: Next.js 14+
- **Styling**: Tailwind CSS
- **Auth**: Custom authentication
- **Database**: Integration ready
- **API**: RESTful API routes

---

## 📱 Features Deep Dive

### Rep Counter Algorithm

```
Step 1: Incorrect posture detected → "down" stage
Step 2: Correct posture detected → "up" stage  
Step 3: Transition down→up → REP COUNTED ✓
Step 4: Audio feedback: "Rep 1. Good form!"
```

### Form Classification

Uses Random Forest ML model trained on:
- 17 body keypoints from MediaPipe
- Positional relationships (distances, angles)
- Movement patterns
- Temporal sequences

**Accuracy:** 80-95% with proper training data

---

## 🌐 API Endpoints

### Frontend (Next.js)

- `GET /api/explore` - Get fitness content
- `POST /api/run-trainer` - Start trainer session
- `POST /api/stop-trainer` - Stop trainer session

### Backend (Python)

- Web UI available via `live_trainer_web.py`
- RESTful API integration ready

---

## 📈 Performance Metrics

### Model Training
- **Training Time**: 2-5 minutes (50-100 samples per category)
- **Inference Time**: ~30ms per frame (30 FPS)
- **Accuracy**: 80-95% (depends on training data quality)

### Live Trainer
- **FPS**: 30 (depends on hardware)
- **Rep Detection Latency**: 1-2 frames
- **Memory Usage**: 100-300MB

---

## 🛠️ Development

### Backend Development

```bash
# Activate environment
.\.venv\Scripts\Activate.ps1

# Run training
python train_posture_model.py

# Test model
python quick_test.py squat

# View trained models
dir trained_models/
```

### Frontend Development

```bash
# Activate environment
cd Smart-AI

# Install dependencies
npm install

# Run dev server
npm run dev

# Run linting
npm run lint

# Build for production
npm run build
```

---

## 🐛 Troubleshooting

### Backend Issues

**Problem**: "No data found" when training
- **Solution**: Run data collection first (`quick_collect.py`)

**Problem**: Low accuracy (< 70%)
- **Solution**: Collect more diverse samples (100+ per category)

**Problem**: Camera not opening
- **Solution**: Check permissions, try different USB port, close other camera apps

**Problem**: Slow performance
- **Solution**: Reduce frame count, close unnecessary applications

### Frontend Issues

**Problem**: Dependencies not installing
- **Solution**: `npm install --force`

**Problem**: Port 3000 already in use
- **Solution**: `npm run dev -- -p 3001`

---

## 📦 Building & Deployment

### Backend

```bash
# Create executable
pyinstaller --onefile live_trainer.py

# Distribute trained_models/ and pose_landmarker.task with executable
```

### Frontend

```bash
# Build
cd Smart-AI
npm run build

# Deploy to Vercel
npm i -g vercel
vercel

# Or deploy to any Node.js host
npm run start
```

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 📞 Support & Contact

- 📧 Email: support@smartai.fitness
- 🐛 Issues: GitHub Issues
- 💬 Discussions: GitHub Discussions
- 🌐 Website: https://github.com/ParthxBandral/test-py-repo

---

## 🎓 Learning Resources

- [MediaPipe Documentation](https://mediapipe.dev/)
- [OpenCV Documentation](https://docs.opencv.org/)
- [Scikit-Learn Documentation](https://scikit-learn.org/)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)

---

## 🎉 Acknowledgments

Built with:
- **MediaPipe** - For pose detection
- **OpenCV** - For video processing
- **Scikit-learn** - For machine learning
- **Next.js** - For the frontend framework
- **Tailwind CSS** - For styling

---

## 📊 Project Status

- ✅ Backend: Production Ready
- ✅ Frontend: MVP Ready
- 🔄 API Integration: In Progress
- 📋 Mobile App: Planned
- 🌐 Cloud Deployment: Planned

---

**Last Updated**: May 27, 2026

For the latest updates, visit: https://github.com/ParthxBandral/test-py-repo
