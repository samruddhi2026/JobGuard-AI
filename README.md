# 🛡️ JobGuard AI

JobGuard AI is a production-grade, AI-powered platform designed to protect job seekers from "suspicious" listings and optimize career success. It features a world-class **Premium ATS Aggregator** that sources 100% genuine job postings directly from elite corporate boards.

![JobGuard AI Banner](https://img.shields.io/badge/Status-Production--Ready-success?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-Next.js%20|%20FastAPI%20|%20PostgreSQL-blue?style=for-the-badge)

## 🚀 Key Features

### 🏢 Premium Career Finder
*   **100% Genuine Listings**: Integrated with official **Greenhouse** and **Lever** APIs for 50+ tech giants (Stripe, Discord, Airbnb, Netflix, etc.).
*   **Direct Application**: Zero proxying or masked links; every "Apply" button leads directly to the official corporate portal.
*   **Intelligent Geo-Location**: Smart search that understands region aliases (USA, India) and maps them to local tech hubs.
*   **Authentic Descriptions**: Real, descriptive job snippets extracted and cleaned directly from corporate ATS data.

### 🧠 AI-Powered Intelligence
*   **Expert Matcher**: Semantic similarity analysis that detects actual tenure (e.g., "5+ years") rather than just keywords.
*   **ATS Checker**: Evaluates resume compatibility against global ATS standards with deep skill gap analysis.
*   **Job Verifier**: Analyzes URLs and descriptions for phishing indicators and domain reputation.

### 💼 Professional Infrastructure
*   **Industrial Backend**: Hardened with **SlowApi** rate limiting and **Loguru** structured logging.
*   **Modern UI**: Built with **Next.js 15**, **Framer Motion**, and **Sonner** notifications.
*   **Theme Engine**: Full support for Dark/Light modes with premium glassmorphism aesthetics.

## 🛠️ Tech Stack

*   **Frontend**: Next.js 15 (App Router), TailwindCSS, TypeScript, Framer Motion.
*   **Backend**: Python 3.10+, FastAPI, SQLAlchemy, Pydantic.
*   **Database**: PostgreSQL.
*   **AI/NLP**: Sentence Transformers, BeautifulSoup4, HTML-cleaning engine.

## 🏁 Getting Started

### Prerequisites
*   Node.js 18+
*   Python 3.10+
*   PostgreSQL

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # .\venv\Scripts\activate on Windows
pip install -r requirements.txt
# Set your environment variables (DB_URL, etc. in .env)
uvicorn app.main:app --reload
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 📂 Project Structure
```text
├── backend/            # FastAPI Microservice (ATS Aggregator & AI Logic)
│   ├── app/
│   │   ├── api/        # REST Endpoints
│   │   ├── services/   # Premium Scrapers & NLP Matching
│   │   └── db/         # SQLAlchemy Models
├── frontend/           # Next.js Application
│   ├── app/            # Location-Aware UI & API Routes
│   ├── components/     # Framer Motion UI Kit
└── docker-compose.yml  # Production Orchestration
```

## 📜 License
This project is proprietary. All rights reserved by **samruddhi2026**. See the [LICENSE](./LICENSE) file for more information.

---
*Copyright (c) 2026 samruddhi2026. Built with passion for safe and intelligent career growth.*
