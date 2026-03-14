from urllib.parse import urlparse
import socket
import re

class VerificationService:
    TRUSTED_PORTALS = ["greenhouse.io", "lever.co", "workday.com", "myworkdayjobs.com", "smartrecruiters.com", "taleo.net"]
    
    @staticmethod
    def extract_domain(url: str) -> str:
        if not url.startswith(('http://', 'https://')):
            url = 'http://' + url
        try:
            parsed_url = urlparse(url)
            domain = parsed_url.netloc.lower()
            # Remove port if present
            if ':' in domain:
                domain = domain.split(':')[0]
            return domain
        except:
            return ""

    @staticmethod
    def is_junk_domain(domain: str) -> bool:
        """Detects if a domain looks like a random string of characters."""
        # Simple heuristic: high ratio of consonants or suspicious character sequences
        parts = domain.split('.')
        if len(parts) < 2: return True
        
        main_part = parts[-2]
        if len(main_part) > 8:
            # Check for lack of vowels (often random strings)
            vowels = "aeiou0123456789-"
            vowel_count = sum(1 for char in main_part if char in vowels)
            if vowel_count / len(main_part) < 0.2:
                return True
        return False

    @staticmethod
    def check_suspicious_patterns(url: str) -> list:
        red_flags = []
        domain = VerificationService.extract_domain(url)
        
        if not domain:
            return ["Invalid URL structure"]

        # 0. Character Validation (Commas, Spaces, etc. are invalid in real domains)
        if not re.match(r"^[a-z0-9.-]+$", domain):
            red_flags.append(f"Domain contains invalid characters (found: {re.sub(r'[a-z0-9.-]', '', domain)})")

        # 1. URL Shorteners
        shorteners = ["bit.ly", "tinyurl.com", "t.co", "goo.gl", "rebrand.ly", "is.gd", "buff.ly"]
        if any(s in domain for s in shorteners):
            red_flags.append("Use of URL shortener (often used to hide phishing destinations)")

        # 2. Suspicious Keywords in Domain
        suspicious_keywords = ["jobs-career", "careers-job", "apply-now", "official-jobs", "login-verify", "hr-portal", "recruitment-center", "hiring-now", "dmnnkjf"]
        if any(k in domain for k in suspicious_keywords):
            red_flags.append("Suspicious recruitment or junk keywords in domain name")

        # 3. Junk/Random Domain Detection
        if VerificationService.is_junk_domain(domain):
            red_flags.append("Domain name appears to be a random string of characters (high entropy)")

        # 4. Fake Subdomains / Phishing Structure
        parts = domain.split('.')
        brands = ["google", "microsoft", "amazon", "apple", "facebook", "meta", "netflix", "stripe", "airbnb", "linkedin"]
        
        if len(parts) > 3:
            red_flags.append("Excessive subdomains (common phishing tactic)")
        
        for brand in brands:
            if brand in domain:
                # Proper official domain checks
                is_official = domain == f"{brand}.com" or domain.endswith(f".{brand}.com")
                # Exclude if it's just a common word (not applicable here but good to keep in mind)
                if not is_official:
                    # Ignore if it's a trusted portal slug (handled separately)
                    if not any(portal in domain for portal in VerificationService.TRUSTED_PORTALS):
                         red_flags.append(f"Suspicious use of brand name '{brand}' in non-official domain")

        # 5. TLD Checks
        suspicious_tlds = [".xyz", ".top", ".pw", ".bid", ".club", ".online", ".site", ".work", ".jobs", ".careers", ".buzz", ".monster"]
        if any(domain.endswith(tld) for tld in suspicious_tlds):
            red_flags.append(f"Suspicious TLD ({domain.split('.')[-1]}) commonly used for malicious sites")

        return red_flags

    @staticmethod
    async def get_trust_score(url: str, official_domain: str = None) -> dict:
        from app.services.scraper_service import ScraperService
        
        domain = VerificationService.extract_domain(url)
        red_flags = VerificationService.check_suspicious_patterns(url)
        
        trust_score = 100
        risk_score = 0
        
        # 1. Static Pattern Risk
        risk_score += len(red_flags) * 20
        
        # 2. Live Availability Check (New)
        live_check = await ScraperService.verify_url(url)
        availability_flag = ""
        
        if not live_check.get("is_reachable"):
            risk_score += 40
            red_flags.append(f"Connection Error: {live_check.get('reason')}")
        elif not live_check.get("is_available"):
            # If the domain is official but the job is gone, it's not a scam, but it's "unavailable"
            risk_score += 50
            availability_flag = live_check.get("reason", "Job no longer available")
            red_flags.append(f"Availability Issue: {availability_flag}")

        # 3. Domain Matching / Trusted Portals
        is_trusted_portal = any(portal in domain for portal in VerificationService.TRUSTED_PORTALS)
        
        if is_trusted_portal:
            trust_score = 95
            risk_score = min(risk_score, 10) # Caps risk if portal is known
            if "Matches known trusted career portal" not in red_flags:
                red_flags.append("Matches known trusted career portal")
        elif official_domain:
            official_domain = official_domain.lower()
            if official_domain in domain:
                # If it's the official domain but job is unavailable, we should still warn
                if not live_check.get("is_available"):
                    trust_score = 50
                    risk_score = 50
                else:
                    trust_score = 100
                    risk_score = 0
                red_flags.append("Matches official company domain")
            else:
                risk_score += 60
                red_flags.append(f"Domain '{domain}' does not match official company domain: {official_domain}")

        # Final normalization
        trust_score = max(0, 100 - risk_score)
        
        status = "Safe"
        if 30 <= risk_score < 60:
            status = "Inactive/Suspicious" if not live_check.get("is_available") else "Suspicious"
        elif risk_score >= 60:
            status = "Likely Scam"

        explanation = "This job link appears to be on a legitimate domain."
        if not live_check.get("is_available"):
            explanation = f"While the domain might be legitimate, the specific job page appears to be inactive or unavailable ({availability_flag})."
        elif risk_score > 40:
            explanation = "Potential phishing or illegitimate domain detected."

        return {
            "url": url,
            "domain": domain,
            "status": status,
            "trust_score": trust_score,
            "risk_score": min(100, risk_score),
            "red_flags": red_flags,
            "explanation": explanation
        }
