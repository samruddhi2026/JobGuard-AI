import requests
import json

def test_detailed_match():
    url = "http://localhost:8000/api/v1/ats/match"
    payload = {
        "resume_text": "visualization dashboards to present analytical findings. EDUCATION B.Tech – Artificial Intelligence & Machine Learning|D. Y. Patil Agriculture & Technical University | 2023 – 2026 Diploma – Computer Engineering |Datta Polytechnic, Shirol | 2020 – 2023 CERTIFICATIONS Artificial Intelligence Journey – Udemy Deep Learning Specialization – Udemy AI Essentials – Udemy",
        "job_description": "Job Description Job Description Title: Sales Excellence – COE - Avanade Analytics Support Associate Manager Role (Job Profile): Analytics & Modeling Associate Manager Management Level: Associate Manager (ML8) About Accenture: At Accenture, we believe your career is about what you want to be and who you want to be. It's about bringing your skills, your curiosity, and your best true self to your work. Here, you'll match your ingenuity with the latest technology to do incredible things. Together, we can create positive, long-lasting change. We are: Sales Excellence at Accenture. We empower our management leadership sales"
    }
    
    try:
        response = requests.post(url, json=payload)
        print(f"Status: {response.status_code}")
        print(json.dumps(response.json(), indent=2))
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_detailed_match()
