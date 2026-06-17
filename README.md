# 🧠 HiveMind

### One Question. Many Minds. One Consensus.

HiveMind is a multi-AI comparison platform that allows users to query multiple AI models simultaneously, compare responses, analyze consensus, and identify unique perspectives. The platform combines responses from different models into a unified analysis experience while maintaining user-specific cloud history.

## 📱 APK Download

Download the latest Android APK:

📱 [Download HiveMind APK](https://github.com/Swetha197-os/HiveMind/releases/tag/v1.0)

## 🚀 Features

* Multi-AI response comparison
* Consensus analysis and grouping
* Hive Agreement Score
* Queen Answer synthesis
* User authentication
* Cloud-based history storage
* Guest mode support
* Android APK support
* Secure backend API proxy
* Responsive mobile-friendly UI

## 📸 Screenshots

### Landing Page

![Landing Page](screenshots/landing.png)

### AI Comparison

![AI Comparison](screenshots/comparison.png)

### Consensus Analysis

![Consensus Analysis](screenshots/analysis.png)

### Grouping

![Grouping](screenshots/grouping.png)

## 🎥 Demo

▶️ [Watch Demo Video](https://github.com/Swetha197-os/HiveMind/releases/download/v1.0/HiveMind_Demo.mp4)

## 🛠️ Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS

### Backend

* Node.js
* Express.js

### Authentication

* Firebase Authentication

### Database

* Cloud Firestore

### AI Services

* OpenRouter API
* Google Gemini API

### Mobile

* Capacitor
* Android Studio

---

## 🏗️ Architecture

```text
Android App / Web App
          │
          ▼
     React Frontend
          │
          ▼
    Express Backend
          │
 ┌────────┴────────┐
 ▼                 ▼
OpenRouter      Gemini
          │
          ▼
 Firebase Auth + Firestore
```

---

## ⚙️ Setup Instructions

### Clone Repository

```bash
git clone https://github.com/Swetha197-os/HiveMind.git
cd HiveMind
```

### Install Dependencies

```bash
npm install
```

### Frontend Environment

Create a `.env` file:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

### Backend Environment

Create `backend/.env`:

```env
OPENROUTER_API_KEY=
GEMINI_API_KEY=
```

### Run Frontend

```bash
npm run dev
```

### Run Backend

```bash
cd backend
npm install
npm run dev
```

---

## 📂 Project Structure

```text
HiveMind
│
├── src/
│   ├── pages/
│   ├── components/
│   ├── utils/
│   └── contexts/
│
├── backend/
│   ├── server.js
│   └── .env
│
├── android/
├── public/
└── README.md
```

---

## ✨ Highlights

* Full-stack architecture
* Multi-model AI integration
* Authentication and cloud storage
* Android APK release
* Backend API security layer
* Real-world deployment workflow

---

## 👩‍💻 Developer

**Swetha R**

Integrated M.Tech Software Engineering, VIT Chennai

GitHub: https://github.com/Swetha197-os

---

HiveMind — *One Question. Many Minds. One Consensus.*
Compare responses from multiple AI models, discover consensus, and uncover unique perspectives through intelligent analysis.
