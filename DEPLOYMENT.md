# JobGuard AI - Deployment Guide

This guide provides instructions for deploying JobGuard AI in production environments.

## Prerequisites

- Docker and Docker Compose
- Python 3.11+ (for local development)
- Node.js 18+ (for local development)

## Deployment Options

### 1. Using Docker Compose (Recommended)

The easiest way to deploy the entire stack is using Docker Compose.

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-repo/jobguard-ai.git
    cd jobguard-ai
    ```

2.  **Environment Variables**:
    Create a `.env` file in the root directory:
    ```env
    POSTGRES_USER=postgres
    POSTGRES_PASSWORD=your_secure_password
    POSTGRES_DB=jobguard
    ```

3.  **Run the application**:
    ```bash
    docker-compose up -d --build
    ```

4.  **Access the application**:
    - Frontend: [http://localhost:3000](http://localhost:3000)
    - Backend API: [http://localhost:8000](http://localhost:8000)
    - API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### 2. Manual Deployment (Local Dev)

#### Backend (FastAPI)
1.  Navigate to `backend/`.
2.  Create virtual environment: `python -m venv venv`.
3.  Activate venv and install dependencies: `pip install -r requirements.txt`.
4.  Download spaCy model: `python -m spacy download en_core_web_sm`.
5.  Run server: `uvicorn app.main:app --reload`.

#### Frontend (Next.js)
1.  Navigate to `frontend/`.
2.  Install dependencies: `npm install`.
3.  Run development server: `npm run dev`.

## Security Considerations

- **CORS**: Update `allow_origins` in `backend/app/main.py` to match your production domain.
- **SSL**: Use an Nginx reverse proxy or Cloudflare to handle HTTPS termination.
- **Database**: Ensure your PostgreSQL password is strong and the database is not publicly accessible.
- **Rate Limiting**: The system uses Redis for basic caching; consider adding `slowapi` for endpoint-level rate limiting in `main.py`.

## Scraping & Scalability

- The scraper service currently uses a mock for LinkedIn/Indeed to avoid bot detection issues in basic setups.
- For production-grade scraping, integrate a proxy service (e.g., BrightData, ScrapingBee) and use `Playwright` in headless mode.
