# AI Learning Assistant (v2.0 Pro Edition) 🎓🎙️
> **Final Year Project (FYP)** • Intelligent Study Companion with Advanced Voice Tutoring, Smart PDF Parsing, Automated Flashcards & Dynamic Quizzes.

---

## 🌟 Overview & Key Advancements

The **AI Learning Assistant** is a full-stack, AI-powered educational platform designed to elevate the student learning experience. It transforms static textbooks, lecture slides, and research papers into interactive study material with automated executive summaries, concept breakdowns, spaced repetition flashcards, and personalized knowledge check quizzes.

### 🎙️ Advanced AI Voice Tutor Suite (New FYP Coordinator Request)
- **Interactive Conversational Voice Tutor (`VoiceTutorModal`)**:
  - Live **Speech-to-Text (STT)** powered by real-time voice streaming.
  - Multi-bar animated **Siri/Gemini-style Soundwave Visualizer** with dynamic amplitude feedback (`listening`, `thinking`, `speaking`).
  - **Hands-Free Conversation Mode**: After the AI speaks its response, it automatically listens for your follow-up voice query!
  - **Neural-Grade Text-to-Speech (TTS)**: Chunk-buffered speech synthesis prevents browser 15-second cutoffs.
  - **Customizable Audio Controls**: Speed rate adjustments (0.8x, 1.0x, 1.25x, 1.5x), pitch control, and browser voice selection.
- **Audio-Powered Flashcards & Quizzes**:
  - Voice narration for flashcard questions and answers.
  - Auditory question reader for quizzes to support multimodal learning.
- **Microphone Dictation in Chat & AI Tools**:
  - Direct speech-to-text input icon in the chat bar and concept breakdown inputs.
  - "Listen Aloud" button on every AI answer.

---

## 🚀 Solved Vercel Deployment & Runtime Issues

1. **Monorepo Detection on Vercel**:
   - Added root `vercel.json` and root `package.json` with build commands (`cd frontend && npm install && npm run build`) and output mapping (`frontend/dist`), eliminating the *"No build script / package.json found"* error when deploying the repository root.
   - Updated `frontend/vercel.json` with `dist` directory and SPA rewrites for single-page routing.
2. **Mixed Content (HTTPS vs HTTP)**:
   - Configured `apiPath.js` to intelligently detect HTTPS in production and route to the deployed backend without triggering browser insecure content blocks.
3. **AI Request Timeout Fix**:
   - Increased Axios client timeout from 8,000ms (8s) to 60,000ms (60s), eliminating `ECONNABORTED: timeout exceeded` during heavy LLM generation.
4. **Eliminated Critical Runtime Crashes**:
   - Fixed missing `Flashcard` component import in `FlashcardPage.jsx`.
   - Fixed illegal function call on array `flashcards(currentCardIndex)` -> `flashcards[currentCardIndex]`.
   - Fixed broken JSX syntax in `QuizResultPage.jsx` (`<div ...> return <Spinner /> </div>`).
   - Fixed file size unit display in `DocumentCard.jsx` (`unites[unitIndex]`).
   - Fixed `buttonText` visibility in `EmptyState.jsx`.
   - Restored and linked the new dedicated **Quiz Hub (`/quizzes`)** directly in the primary navigation sidebar.

---

## 🛠️ Project Structure

```
Ai-Learning-Assistant/
├── vercel.json                 # Monorepo Vercel configuration
├── package.json                # Root package for automated builds
├── frontend/                   # React 19 + Vite 7 SPA
│   ├── vercel.json             # Sub-project Vercel rewrite configuration
│   ├── src/
│   │   ├── components/
│   │   │   ├── voice/          # VoiceVisualizer & VoiceTutorModal
│   │   │   ├── chat/           # ChatInterface with STT & TTS
│   │   │   ├── ai/             # AIActions with Audio Narration
│   │   │   ├── flashcards/     # Spaced Repetition Flashcards + Audio
│   │   │   ├── quizzes/        # QuizManager & Quiz Cards
│   │   │   └── layout/         # Sidebar, Header & App Layout
│   │   ├── pages/
│   │   │   ├── Dashboard/      # Hero Banner with Voice Tutor launch
│   │   │   ├── Documents/      # Document Manager & PDF viewer
│   │   │   ├── Flashcards/     # Flashcard List & Study Pages
│   │   │   └── Quizzes/        # Dedicated Quiz Hub & Result Review
│   │   ├── services/
│   │   │   ├── voiceService.js # Resilient Web Speech STT & TTS Engine
│   │   │   └── ...             # AI, Document, Quiz, Auth services
│   │   └── utils/
│   └── ...
└── backend/                    # Node.js + Express + Mongoose REST API
    ├── server.js               # Express application entry
    ├── routes/                 # Auth, AI, Documents, Flashcards, Quizzes
    ├── controllers/            # Gemini LLM integration & CRUD logic
    ├── models/                 # Mongoose schemas (User, Document, Flashcard, Quiz)
    ├── middleware/             # JWT Authentication Protection
    └── utils/                  # PDF Parser & AI helpers
```

---

## 💻 Local Development Setup

### 1. Frontend
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 2. Backend
```bash
cd backend
npm install
npm run dev
```
Ensure your `backend/.env` is configured with `MONGO_URI`, `JWT_SECRET`, and `GEMINI_API_KEY`.

---

## 🌐 Deploying to Vercel

### Option A: Deploying from Root Repository
1. Push your changes to GitHub.
2. In Vercel, click **Add New Project** and select this repository.
3. Leave **Root Directory** as `./` (the root `vercel.json` handles building `frontend`).
4. In **Environment Variables**, add:
   - `VITE_API_URL`: `https://ai-learning-backend-sooty.vercel.app` (or your backend URL).
5. Click **Deploy**.

### Option B: Deploying Frontend Only
1. In Vercel Project Settings, set **Root Directory** to `frontend`.
2. Add environment variable `VITE_API_URL`.
3. Click **Deploy**.
