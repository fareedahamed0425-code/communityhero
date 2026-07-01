# 🦸🏽‍♂️ Community Hero — Civic Issue Reporter

![Project](https://img.shields.io/badge/PROJECT-COMMUNITY_HERO-ef4444?style=for-the-badge)
![App Category](https://img.shields.io/badge/CATEGORY-CIVIC_ENGAGEMENT-000000?style=for-the-badge)
![AI Analysis](https://img.shields.io/badge/AI_ANALYSIS-GEMINI_FLASH-0ea5e9?style=for-the-badge)
![Framework](https://img.shields.io/badge/FRAMEWORK-REACT_+_FASTAPI-000000?style=for-the-badge&logo=react)

**Advanced AI-powered civic engagement platform with real-time mapping, intelligent image categorization, and automated complaint filing.**

---

## 🛠️ Architecture & Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, TypeScript
- **Mapping:** `react-leaflet` with OpenStreetMap (OSM) for high-performance interactive maps and live tracking
- **Authentication:** Firebase (Email/Password & Google Sign-In)
- **Backend:** Python 3.11, FastAPI, SQLAlchemy, GeoAlchemy2
- **Database:** PostgreSQL (with PostGIS) / SQLite (for local dev)
- **AI Stack:** Google Gemini 2.5 Flash (for Image Analysis, Auto-Categorization, and Conversational AI)

---

## ✨ Key Features

### For Citizens
* **AI-Powered Reporting Wizard:** Take photos of civic issues. The Gemini AI automatically analyzes the image, determines the category (e.g., *pothole*, *garbage*), and estimates the severity.
* **Interactive Map Explorer:** A fast, interactive map plotting all active community issues, featuring real-time geolocation tracking.
* **Community Dashboard:** A public analytics board showing real-time statistics on open, resolved, and critical issues.
* **Smart AI Chatbot:** A floating AI assistant that answers civic questions and can **automatically file complaints** in the database through natural conversation.
* **Emergency Helplines:** Quick-access modal containing vital Indian emergency and civic helpline numbers.

### For Administrators
* **Admin Command Center:** A secure, exclusive dashboard providing full CRUD capabilities.
* **User Management:** View all registered users, promote to admin roles, or remove accounts.
* **Issue Management:** Change the status of issues (e.g., *Reported*, *In Progress*, *Resolved*) and delete invalid reports.

---

## 🚀 Setup & Installation

### 1. Environment Variables
Create a `.env.local` file in the `frontend` directory with your API keys:
```env
VITE_API_URL="http://localhost:8000/api"
VITE_GEMINI_API_KEY="your-gemini-key"
VITE_FIREBASE_API_KEY="your-firebase-key"
# ... other firebase config
```

### 2. Start the Backend
Navigate to the `backend` folder, install requirements, and run FastAPI:
```bash
cd backend
pip install -r requirements.txt
# Note: Ensure geoalchemy2 is installed!
uvicorn main:app --reload
```

### 3. Start the Frontend
Navigate to the `frontend` folder and run the Vite dev server:
```bash
cd frontend
npm install
npm run dev
```
