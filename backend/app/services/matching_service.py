from loguru import logger
from sentence_transformers import SentenceTransformer, util
from app.services.ats_service import ATSService
import numpy as np

class MatchingService:
    def __init__(self):
        self.ats_service = ATSService()
        try:
            # lightweight model for production speed
            self.model = SentenceTransformer('all-MiniLM-L6-v2')
            logger.success("Loaded SentenceTransformer model 'all-MiniLM-L6-v2' successfully.")
        except Exception as e:
            logger.critical(f"Failed to load SentenceTransformer model. Error: {e}")
            self.model = None

    def _extract_years(self, text: str) -> int:
        """Helper to extract maximum years of experience mentioned in text."""
        import re
        patterns = [
            r"(\d+)\+?\s*years?",
            r"(\d+)\+?\s*yrs?",
            r"experience\s*of\s*(\d+)",
            r"(\d+)\s*years?\s*of\s*experience"
        ]
        years = 0
        for pattern in patterns:
            matches = re.findall(pattern, text.lower())
            for m in matches:
                try:
                    years = max(years, int(m))
                except: continue
        return years

    def evaluate_experience(self, resume_text: str, jd_text: str) -> float:
        """Heuristic evaluation of experience match using years and seniority."""
        resume_lower = resume_text.lower()
        jd_lower = jd_text.lower()
        
        # 1. Years of Experience Check
        jd_years_req = self._extract_years(jd_lower)
        resume_years = self._extract_years(resume_lower)
        
        year_score = 100.0
        if jd_years_req > 0:
            if resume_years >= jd_years_req:
                year_score = 100.0
            elif resume_years > 0:
                # Partial credit for having some experience but less than required
                year_score = (resume_years / jd_years_req) * 100
            else:
                year_score = 40.0 # No years mentioned but might have bullet points

        # 2. Seniority Levels
        senior_keywords = ["senior", "lead", "staff", "manager", "head", "principal", "architect"]
        junior_keywords = ["junior", "entry", "associate", "intern", "trainee"]
        
        is_senior_jd = any(word in jd_lower for word in senior_keywords)
        is_junior_jd = any(word in jd_lower for word in junior_keywords)
        
        has_senior_resume = any(word in resume_lower for word in senior_keywords)
        has_junior_resume = any(word in resume_lower for word in junior_keywords)
        
        seniority_score = 75.0 # Baseline
        
        if is_senior_jd:
            if has_senior_resume or resume_years >= 5:
                seniority_score = 95.0
            else:
                seniority_score = 50.0
        elif is_junior_jd:
            if has_junior_resume or (resume_years > 0 and resume_years <= 3):
                seniority_score = 95.0
            else:
                seniority_score = 80.0 # High match for professional transition
                
        # Weighted average of year match and seniority context
        final_exp_score = (year_score * 0.6) + (seniority_score * 0.4)
        return round(final_exp_score, 2)

    def evaluate_education(self, resume_text: str, jd_text: str) -> float:
        """Heuristic evaluation of education match."""
        # Check for field alignment (e.g., Computer Science, Data Science, AI)
        fields = ["computer science", "data science", "artificial intelligence", "ai", "ml", "information technology", "it", "business"]
        score = 50.0 # Baseline
        
        resume_lower = resume_text.lower()
        jd_lower = jd_text.lower()
        
        # Find required fields in JD
        required_fields = [f for f in fields if f in jd_lower]
        if not required_fields: return 90.0 # If no specific education reqs
        
        # Check if resume matches any of these
        matches = [f for f in required_fields if f in resume_lower]
        if matches:
            score = 90.0
            
        # Check for degree levels
        if "master" in jd_lower or "phd" in jd_lower:
            if not ("master" in resume_lower or "phd" in resume_lower):
                score -= 20.0
                
        return max(30.0, score)

    def get_match_score(self, resume_text: str, job_description: str) -> dict:
        if not self.model:
            return {"match_score": 0, "error": "Model not loaded"}

        # 1. Semantic Similarity (40% Weight)
        resume_embedding = self.model.encode(resume_text, convert_to_tensor=True)
        job_embedding = self.model.encode(job_description, convert_to_tensor=True)
        cosine_score = float(util.cos_sim(resume_embedding, job_embedding)[0][0])
        sem_sim_pct = round(cosine_score * 100, 2)
        
        # 2. Skill-based Matching (30% Weight)
        resume_skills = set(self.ats_service.extract_skills(resume_text))
        job_skills = set(self.ats_service.extract_skills(job_description))
        
        matched_skills = list(resume_skills.intersection(job_skills))
        missing_skills = list(job_skills.difference(resume_skills))
        
        skill_match_score = (len(matched_skills) / len(job_skills)) * 100 if job_skills else 100.0
        
        # 3. Experience Match (20% Weight)
        experience_score = self.evaluate_experience(resume_text, job_description)
        
        # 4. Education Match (10% Weight)
        education_score = self.evaluate_education(resume_text, job_description)
        
        # Category Breakdown (as requested in point 5: matched / total in category)
        category_match = {}
        for cat, cat_skills in self.ats_service.SKILL_CATEGORIES.items():
            # Find which of these skills are actually in the JD
            jd_cat_skills = [s for s in cat_skills if s in job_skills]
            if not jd_cat_skills:
                continue # Skip categories not mentioned in JD
                
            matched_cat_skills = [s for s in jd_cat_skills if s in resume_skills]
            category_match[cat] = round((len(matched_cat_skills) / len(jd_cat_skills)) * 100)
        
        # Final Score Formula (Point 6)
        final_score = (
            0.40 * sem_sim_pct +
            0.30 * skill_match_score +
            0.20 * experience_score +
            0.10 * education_score
        )
        
        # Suggestions (Point 8)
        suggestions = []
        if missing_skills:
            suggestions.append(f"Add {missing_skills[0].title()} if you have experience.")
        suggestions.append("Quantify project impact (e.g., improved metrics by 20%).")
        if experience_score < 70:
            suggestions.append("Elaborate on professional work experience or relevant internships.")
        if education_score < 70:
            suggestions.append("Highlight certifications if degree field doesn't perfectly match.")

        # Strengths and Weaknesses (for UI compatibility)
        strengths = []
        if sem_sim_pct > 70:
            strengths.append("High semantic alignment with job responsibilities.")
        if len(matched_skills) > 5:
            strengths.append(f"Strong match for technical stack ({len(matched_skills)} skills).")
        if experience_score > 80:
            strengths.append("Professional experience aligns well with seniority needs.")

        weaknesses = []
        if len(missing_skills) > 3:
            weaknesses.append(f"Gap detected in {len(missing_skills)} key JD skills.")
        if education_score < 60:
            weaknesses.append("Educational background field mismatch.")
        if sem_sim_pct < 40:
            weaknesses.append("Low contextual relevance in resume projects.")

        # Advice (Detailed logic)
        advice = []
        if final_score > 80:
            advice.append("Excellent match! Your profile aligns closely with the core requirements of this role.")
        elif final_score > 60:
            advice.append("You have a good foundation. Highlight your transferable skills more clearly.")
        else:
            advice.append("Significant gap detected. Focus on acquiring the missing technical keywords.")

        return {
            "match_score": round(final_score),
            "semantic_similarity": sem_sim_pct,
            "skill_match": round(skill_match_score, 2),
            "experience_match": experience_score,
            "education_match": education_score,
            "category_match": category_match,
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "suggestions": suggestions[:4],
            "strengths": strengths if strengths else ["Good overall technical baseline."],
            "weaknesses": weaknesses if weaknesses else ["No critical gaps detected."],
            "advice": advice
        }
