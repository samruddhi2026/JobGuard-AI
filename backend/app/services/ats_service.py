from loguru import logger
import spacy
import re
from typing import List, Dict

class ATSService:
    SKILL_DB = [
        # Technical
        "python", "sql", "machine learning", "pandas", "numpy", "power bi", "tableau", "tensorflow", "pytorch",
        "javascript", "typescript", "java", "c++", "c#", "go", "rust", "php", "ruby", "swift", "kotlin",
        "react", "next.js", "vue", "angular", "fastapi", "django", "flask", "node.js",
        "postgresql", "mongodb", "redis", "aws", "azure", "gcp", "docker", "kubernetes",
        # Analytics
        "data analysis", "dashboard", "visualization", "reporting", "kpi tracking", "data cleaning", "data reconciliation", "power query",
        # Management
        "stakeholder communication", "project management", "agile", "scrum", "leadership", "management",
        # Business / Sales
        "sales analytics", "customer insights", "market analysis", "business intelligence", "sales", "crm", "salesforce"
    ]

    SKILL_CATEGORIES = {
        "Technical": [
            "python", "sql", "machine learning", "pandas", "numpy", "power bi", "tableau", "tensorflow", "pytorch",
            "javascript", "typescript", "java", "react", "fastapi", "aws", "docker"
        ],
        "Analytics": [
            "data analysis", "dashboard", "visualization", "reporting", "kpi tracking", "data cleaning", "data reconciliation", "power query"
        ],
        "Management": [
            "stakeholder communication", "project management", "agile", "scrum", "leadership"
        ],
        "Business / Sales": [
            "sales analytics", "customer insights", "market analysis", "business intelligence"
        ]
    }

    def __init__(self):
        try:
            # Using sm model for performance, but we can use md/lg for better vectors
            self.nlp = spacy.load("en_core_web_sm")
            logger.success("Loaded spaCy model 'en_core_web_sm' successfully.")
        except (OSError, ImportError, Exception) as e:
            logger.critical(f"Failed to load spaCy model 'en_core_web_sm'. Error: {e}")
            self.nlp = None

    def get_skill_category(self, skill: str) -> str:
        for cat, skills in self.SKILL_CATEGORIES.items():
            if skill.lower() in skills:
                return cat
        return "Other"

    def extract_skills(self, text: str) -> List[str]:
        found_skills = set()
        text_lower = text.lower()
        
        # 1. Dictionary-based matching with word boundaries
        for skill in self.SKILL_DB:
            if re.search(rf"\b{re.escape(skill)}\b", text_lower):
                found_skills.add(skill)
        
        return list(found_skills)

    def analyze_resume_structure(self, text: str) -> dict:
        sections = {
            "experience": False,
            "education": False,
            "skills": False,
            "projects": False,
            "contact": False
        }
        
        patterns = {
            "experience": r"(experience|work history|employment history)",
            "education": r"(education|academic background|university)",
            "skills": r"(skills|technical skills|competencies)",
            "projects": r"(projects|portfolio|personal work)",
            "contact": r"(contact|email|phone|linkedin)"
        }
        
        for section, pattern in patterns.items():
            if re.search(pattern, text, re.IGNORECASE):
                sections[section] = True
        
        return sections

    def is_gibberish(self, text: str) -> bool:
        """Detects if the input text is likely garbage/random characters."""
        if not text or not text.strip():
            return True
            
        words = text.split()
        if len(words) < 5: return False # Too short to be gibberish
            
        # 1. Very long words (indicator of random typing, but allow for long paths/technical terms)
        long_words = [w for w in words if len(w) > 35]
        if len(long_words) / len(words) > 0.25:
            logger.warning("Detected high ratio of extremely long words (potential gibberish).")
            return True
            
        # 2. Vowel ratio check (relaxed for technical resumes)
        vowels = "aeiouAEIOU"
        text_no_space = "".join(text.split())
        if not text_no_space: return True
        vowel_count = sum(1 for char in text_no_space if char.isalpha() and char in vowels)
        alpha_count = sum(1 for char in text_no_space if char.isalpha())
        
        # English baseline is ~40%, but technical resumes can be much lower. 10% is very safe.
        if alpha_count > 20 and (vowel_count / alpha_count) < 0.10: 
            logger.warning(f"Detected low vowel-to-consonant ratio: {vowel_count/alpha_count:.2f}")
            return True
        
        # 3. Repeating alphanumeric sequences (ignore symbols like ----- which are common separators)
        if re.search(r"([a-zA-Z0-9])\1{6,}", text):
            logger.warning("Detected long repeating alphanumeric sequence.")
            return True
            
        return False

    def calculate_ats_score(self, resume_text: str, job_description: str = None) -> dict:
        logger.info("Calculating ATS score...")
        # Check for gibberish first
        if not resume_text or self.is_gibberish(resume_text):
            logger.error("Input failed gibberish/empty check.")
            return {
                "ats_score": 0,
                "breakdown": {
                    "keyword_score": 0,
                    "formatting_score": 0,
                    "readability_score": 0,
                    "structure_score": 0
                },
                "suggestions": ["The provided text does not appear to be a valid resume. Please upload a properly formatted document."],
                "extracted_skills": [],
                "sections_found": []
            }

        score_breakdown = {
            "keyword_score": 0,
            "formatting_score": 85,
            "readability_score": 80,
            "structure_score": 0
        }
        
        # 1. Keywords (Skills)
        skills = self.extract_skills(resume_text)
        score_breakdown["keyword_score"] = min(100, (len(skills) / 10) * 100) if skills else 0
        
        # 2. Structure
        sections = self.analyze_resume_structure(resume_text)
        found_sections = sum(1 for v in sections.values() if v)
        score_breakdown["structure_score"] = (found_sections / len(sections)) * 100
        
        # 3. Readability & Formatting (Simple heuristics)
        word_count = len(resume_text.split())
        if word_count < 100:
            score_breakdown["readability_score"] -= 30 # Too short
        elif word_count > 1000:
            score_breakdown["readability_score"] -= 20 # Possibly too verbose
            
        # If no sections or keywords found at all, it's a very poor resume or still slightly messy
        if found_sections == 0 and not skills:
            score_breakdown["formatting_score"] = 20
            score_breakdown["readability_score"] = 20

        total_score = sum(score_breakdown.values()) / len(score_breakdown)
        
        suggestions = []
        if not sections["experience"]:
            suggestions.append("Missing 'Experience' section.")
        if not sections["education"]:
            suggestions.append("Missing 'Education' section.")
        if len(skills) < 8:
            suggestions.append("Add more technical keywords related to your field.")
        if score_breakdown["readability_score"] < 70:
            suggestions.append("Your resume readability is low. Use clear headings and standardized fonts.")

        return {
            "ats_score": round(total_score),
            "breakdown": score_breakdown,
            "suggestions": suggestions,
            "extracted_skills": skills,
            "sections_found": [k for k, v in sections.items() if v]
        }
