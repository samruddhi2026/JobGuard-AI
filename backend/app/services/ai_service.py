import os
import json
from loguru import logger
from app.core import config

try:
    import google.generativeai as genai
    HAS_GENAI = True
except ImportError:
    HAS_GENAI = False

class AIService:
    def __init__(self):
        self.api_key = config.GEMINI_API_KEY
        self.enabled = bool(self.api_key) and HAS_GENAI
        self._model = None
        
        if not self.enabled:
            logger.warning("AIService: Gemini AI not configured. Using template-based fallback.")

    async def _get_model(self):
        """Lazy-load and configure the Gemini model to speed up application startup."""
        if not self.enabled:
            return None
        
        if self._model is None:
            try:
                logger.info("AIService: Initializing Gemini AI model...")
                genai.configure(api_key=self.api_key)
                self._model = genai.GenerativeModel('gemini-1.5-flash')
                logger.info("AIService: Gemini AI model initialized successfully.")
            except Exception as e:
                logger.error(f"AIService: Failed to initialize Gemini: {e}")
                self.enabled = False
                return None
        return self._model

    async def generate_interview_prep(self, job_description: str, seniority: str = "Mid-Level") -> dict:
        """Generates interview questions and tips based on JD."""
        model = await self._get_model()
        if model:
            return await self._generate_with_gemini_interview(model, job_description, seniority)
        return self._generate_fallback_interview(job_description, seniority)

    async def generate_cover_letter_parts(self, job_description: str, resume_text: str = "") -> dict:
        """Generates tailored sections for a cover letter."""
        model = await self._get_model()
        if model:
            return await self._generate_with_gemini_cover_letter(model, job_description, resume_text)
        return self._generate_fallback_cover_letter(job_description, resume_text)

    async def generate_gap_analysis(self, job_description: str, resume_text: str) -> dict:
        """Analyzes the gap between resume and JD."""
        model = await self._get_model()
        if model:
            return await self._generate_with_gemini_gap(model, job_description, resume_text)
        return self._generate_fallback_gap(job_description, resume_text)

    async def generate_suggested_bullets(self, skill_name: str, job_description: str) -> dict:
        """Suggests professional bullet points for a missing skill."""
        model = await self._get_model()
        if model:
            return await self._generate_with_gemini_bullets(model, skill_name, job_description)
        return self._generate_fallback_bullets(skill_name, job_description)

    async def _generate_with_gemini_interview(self, model, jd: str, seniority: str) -> dict:
        prompt = f"""
        Act as an expert technical recruiter. Based on the following job description for a {seniority} role, 
        generate 5-7 high-quality interview questions. For each question, provide a brief 'Ideal Answer' hint.
        
        Job Description: {jd[:2000]}
        
        Return the result in JSON format:
        {{
            "questions": [
                {{"question": "...", "hint": "..."}},
                ...
            ],
            "general_tips": ["...", "..."]
        }}
        """
        try:
            response = await model.generate_content_async(prompt)
            text = response.text
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0].strip()
            return json.loads(text)
        except Exception as e:
            logger.error(f"Gemini Interview Prep Error: {e}")
            return self._generate_fallback_interview(jd, seniority)

    async def _generate_with_gemini_cover_letter(self, model, jd: str, resume: str) -> dict:
        prompt = f"""
        Act as a professional career coach. Generate a tailored cover letter for this job role.
        Use specific keywords from the job description and align them with the candidate's resume summary.
        
        Job Description: {jd[:1500]}
        Candidate Resume: {resume[:1500]}
        
        Return the result in JSON format:
        {{
            "salutation": "Dear Hiring Manager,",
            "opening": "...",
            "body_paragraphs": ["...", "..."],
            "closing": "..."
        }}
        """
        try:
            response = await model.generate_content_async(prompt)
            text = response.text
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0].strip()
            return json.loads(text)
        except Exception as e:
            logger.error(f"Gemini Cover Letter Error: {e}")
            return self._generate_fallback_cover_letter(jd, resume)

    def _generate_fallback_interview(self, jd: str, seniority: str) -> dict:
        return {
            "questions": [
                {"question": f"How do your past projects align with the core requirements of this {seniority} role?", "hint": "Focus on specific technical accomplishments."},
                {"question": "Can you describe a challenging technical problem you solved recently?", "hint": "Use the STAR method (Situation, Task, Action, Result)."},
                {"question": f"What attracts you most to this specific position based on the job description?", "hint": "Mention specific technologies or company values from the JD."}
            ],
            "general_tips": [
                "Research the company's recent engineering blog posts.",
                "Prepare 2-3 questions for the interviewer about their tech stack.",
                "Review core CS fundamentals and system design if applicable."
            ]
        }

    def _generate_fallback_cover_letter(self, jd: str, resume: str) -> dict:
        return {
            "salutation": "Dear Hiring Manager,",
            "opening": "I am writing to express my strong interest in the open position as described in your recent job posting.",
            "body_paragraphs": [
                "My background in software development and my passion for building scalable solutions align well with the requirements for this role.",
                "I have followed your company's growth and I am excited about the possibility of contributing to your team's success."
            ],
            "closing": "Thank you for your time and consideration. I look forward to the possibility of discussing my application with you."
        }

    async def _generate_with_gemini_gap(self, model, jd: str, resume: str) -> dict:
        prompt = f"""
        Act as an elite technical recruiter and ATS specialist. Compare the following Resume against the Job Description.
        
        Job Description: {jd[:1500]}
        Resume: {resume[:1500]}
        
        Return a strict JSON object with:
        1. "match_score": (0-100 integer)
        2. "matching_skills": [list of strings found in both]
        3. "missing_skills": [significant keywords from JD missing in Resume]
        4. "improvement_tips": [3 specific bullet points on how to update the resume]
        
        JSON Format only:
        {{
            "match_score": 85,
            "matching_skills": ["Python", "AWS"],
            "missing_skills": ["SQL", "FastAPI"],
            "improvement_tips": ["...", "...", "..."]
        }}
        """
        try:
            response = await model.generate_content_async(prompt)
            text = response.text
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0].strip()
            return json.loads(text)
        except Exception as e:
            logger.error(f"Gemini Gap Analysis Error: {e}")
            return self._generate_fallback_gap(jd, resume)

    def _generate_fallback_gap(self, jd: str, resume: str) -> dict:
        return {
            "match_score": 65,
            "matching_skills": ["Project Management", "Generic Soft Skills"],
            "missing_skills": ["Specific technical keywords from the role"],
            "improvement_tips": [
                "Quantify your accomplishments with metrics (%, $).",
                "Ensure technical keywords from the JD appear in your experience section.",
                "Verify that your formatting is clean and ATS-friendly."
            ]
        }

    async def _generate_with_gemini_bullets(self, model, skill: str, jd: str) -> dict:
        prompt = f"""
        Act as a professional resume writer. Generate 3 high-impact bullet points for a resume 
        highlighting the skill '{skill}' based on the context of this Job Description.
        
        Job Description Context: {jd[:1000]}
        
        Requirements:
        1. Use the STAR/XYZ method (Action -> Result -> Impact).
        2. Use strong action verbs (e.g., 'Architected', 'Spearheaded', 'Optimized').
        3. Include placeholder numbers [X%] or [Y$] to remind the user to quantify.
        
        Return JSON Format only:
        {{
            "skill": "{skill}",
            "suggestions": [
                "Spearheaded the integration of {skill}...",
                "Optimized {skill} workflows...",
                "Developed a scalable {skill} solution..."
            ]
        }}
        """
        try:
            response = await model.generate_content_async(prompt)
            text = response.text
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0].strip()
            return json.loads(text)
        except Exception as e:
            logger.error(f"Gemini Bullet Suggestion Error: {e}")
            return self._generate_fallback_bullets(skill, jd)

    def _generate_fallback_bullets(self, skill: str, jd: str) -> dict:
        return {
            "skill": skill,
            "suggestions": [
                f"Leveraged {skill} to improve operational efficiency by [X]%.",
                f"Implemented {skill} solutions to address core technical challenges described in the JD.",
                f"Collaborated with cross-functional teams to integrate {skill} into production environments."
            ]
        }
