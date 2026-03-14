from app.services.matching_service import MatchingService
import json

def benchmark_advanced_match():
    matcher = MatchingService()
    
    resume = """
    John Doe
    Senior Data Scientist at TechCorp (5 years)
    Education: M.S. in Data Science from Stanford University.
    Skills: Python, SQL, Machine Learning, TensorFlow, PyTorch, Pandas, NumPy, Power BI.
    Led a team of 5 to develop predictive models that improved customer retention by 25%.
    """
    
    jd = """
    Lead Data Scientist
    Requirements:
    - Master's degree in Data Science or Computer Science.
    - 5+ years experience in professional ML roles.
    - Expertise in Python, SQL, Tableau, and Machine Learning.
    - Experience leading technical teams and communicating with stakeholders.
    """
    
    print("Benchmarking Advanced ATS Match...")
    result = matcher.get_match_score(resume, jd)
    
    print(json.dumps(result, indent=2))
    
    # Assertions based on weights
    print(f"\nFinal Score: {result['match_score']}%")
    print(f"SemSim (40%): {result['semantic_similarity']}%")
    print(f"Skills (30%): {result['skill_match']}%")
    print(f"Exp (20%): {result['experience_match']}%")
    print(f"Edu (10%): {result['education_match']}%")
    
    if result['match_score'] > 70:
        print("\nSUCCESS: Realistic high score for qualified candidate.")
    else:
        print("\nFAILURE: Score too low for a qualified candidate.")

if __name__ == "__main__":
    benchmark_advanced_match()
