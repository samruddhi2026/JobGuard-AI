class FakeJobDetectionService:
    @staticmethod
    def analyze_job_post(job_data: dict) -> dict:
        score = 0
        reasons = []

        # 1. Salary Realism
        salary = job_data.get("salary", 0)
        salary_max = job_data.get("salary_max", salary)
        if salary > 500000 or salary_max > 800000:
            score += 35
            reasons.append("Unrealistically high salary for the typical market rate of this role")

        # 2. Grammar/Patterns & Urgency
        description = job_data.get("description", "").lower()
        # Common scam phrases
        suspicious_phrases = [
            "kindly contact", "western union", "wire transfer", "immediate start no interview",
            "no experience needed high pay", "whatsapp us at", "telegram recruitment",
            "pay for training", "application fee", "buy equipment"
        ]
        for phrase in suspicious_phrases:
            if phrase in description:
                score += 30
                reasons.append(f"Scam-associated language detected: '{phrase}'")

        # 3. Contact Method (Email Domain Check)
        contact_email = job_data.get("contact_email", "").lower()
        free_emails = ["@gmail.com", "@yahoo.com", "@outlook.com", "@hotmail.com", "@proton.me"]
        if any(email in contact_email for email in free_emails):
            score += 25
            reasons.append("Recruiter is using a free/personal email provider instead of a corporate domain")

        # 4. Urgency & Missing Details
        if "immediate" in description and "urgent" in description:
            score += 10
            reasons.append("High pressure/urgency tactics detected")

        # Normalize score
        final_score = min(100, score)
        
        status = "Safe"
        if 30 <= final_score < 60:
            status = "Suspicious"
        elif final_score >= 60:
            status = "Likely Scam"

        return {
            "fake_probability_score": final_score,
            "status": status,
            "reasons": reasons,
            "explanation": "This job post has multiple indicators commonly associated with employment scams." if final_score > 50 else "This job post appears generally safe but always exercise caution."
        }
