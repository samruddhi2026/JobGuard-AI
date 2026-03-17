import aiohttp
import asyncio
import random
import re
import urllib.parse
from typing import List, Dict
from bs4 import BeautifulSoup
from loguru import logger

class ScraperService:
    USER_AGENTS = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0",
        "Mozilla/5.0 (Apple) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15"
    ]

    @staticmethod
    def get_headers():
        return {
            "User-Agent": random.choice(ScraperService.USER_AGENTS),
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Referer": "https://www.google.com/"
        }

    @staticmethod
    async def verify_url(url: str) -> dict:
        """
        Checks if a URL is reachable and actually looks like a career page,
        filtering out parked domains and generic landing pages.
        Returns a dict with availability status.
        """
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, timeout=7, headers=ScraperService.get_headers()) as response:
                    if response.status != 200:
                        return {"is_reachable": False, "is_available": False, "reason": f"HTTP {response.status}"}
                    
                    text = (await response.text()).lower()
                    
                    # 1. Parked Domain Detection (Regex with word boundaries to avoid false positives)
                    parked_indicators = [
                        r"\bgodaddy\b", r"domain is for sale", r"buy this domain", r"\bparked free\b", 
                        r"\bhugedomains\b", r"\bsedo\b", r"this domain may be for sale"
                    ]
                    if any(re.search(pattern, text) for pattern in parked_indicators):
                        return {"is_reachable": True, "is_available": False, "reason": "Parked domain"}
                    
                    # 2. Availability Check
                    unavailable_phrases = [
                        "job because it's not available at this time",
                        "this job is no longer available",
                        "the job you are looking for is no longer available",
                        "position is closed",
                        "no longer accepting applications",
                        "no longer taking applications",
                        "job you are looking for has been filled",
                        "listing has expired",
                        "listing is no longer active",
                        "invalid job id",
                        "job not found",
                        "vacancy has closed",
                        "page you are looking for is no longer available"
                    ]
                    if any(phrase in text for phrase in unavailable_phrases):
                        return {"is_reachable": True, "is_available": False, "reason": "Job no longer available"}

                    # 3. Generic ATS Landing Page Detection
                    final_url = str(response.url).lower()
                    generic_portals = [
                        "jobs.workable.com", 
                        "apply.workable.com/oops", 
                        "lever.co/jobs", 
                        "greenhouse.io/jobs",
                        "workable.com/jobs"
                    ]
                    
                    if any(portal in final_url for portal in generic_portals):
                        if "workable.com" in url:
                             return {"is_reachable": True, "is_available": False, "reason": "Redirected to generic Workable portal", "final_url": final_url}
                        if "/jobs" in final_url and "/jobs" not in url:
                             return {"is_reachable": True, "is_available": False, "reason": "Redirected to generic ATS job board", "final_url": final_url}

                    # 3. Parked Domain Detection (Regex with word boundaries to avoid false positives)
                    parked_indicators = [
                        r"\bgodaddy\b", r"domain is for sale", r"buy this domain", r"\bparked free\b", 
                        r"\bhugedomains\b", r"\bsedo\b", r"this domain may be for sale"
                    ]
                    if any(re.search(pattern, text) for pattern in parked_indicators):
                        return {"is_reachable": True, "is_available": False, "reason": "Parked domain", "final_url": final_url}

                    # 4. Career Page Indicators
                    career_keywords = ["jobs", "careers", "openings", "opportunities", "hiring", "apply now", "asessments", "job board", "work with us", "vacancy", "employment"]
                    keyword_matches = sum(1 for kw in career_keywords if kw in text.lower())
                    
                    is_valid = False
                    # Professional Check: If the URL itself is a known official pattern, be more lenient
                    url_lower = url.lower()
                    if "/careers" in url_lower or "careers." in url_lower or "jobs." in url_lower:
                        is_valid = keyword_matches >= 1
                    elif "lever.co" in url_lower or "greenhouse.io" in url_lower or "workable.com" in url_lower:
                        is_valid = keyword_matches >= 1
                    else:
                        is_valid = keyword_matches >= 2

                    # 5. Playwright Fallback for SPA (if not valid yet but reachable and not parked)
                    if not is_valid and response.status == 200:
                        try:
                            logger.info(f"Low keywords ({keyword_matches}) for {url}, attempting SPA rendering check...")
                            async with async_playwright() as p:
                                browser = await p.chromium.launch(headless=True)
                                ctx = await browser.new_context(user_agent=ScraperService.get_headers()["User-Agent"])
                                pg = await ctx.new_page()
                                await pg.goto(url, wait_until="networkidle", timeout=15000)
                                content = await pg.content()
                                await browser.close()
                                
                                keyword_matches = sum(1 for kw in career_keywords if kw in content.lower())
                                if "/careers" in url_lower or "careers." in url_lower or "jobs." in url_lower:
                                    is_valid = keyword_matches >= 1
                                else:
                                    is_valid = keyword_matches >= 2
                        except Exception as e:
                            logger.warning(f"Playwright fallback failed for {url}: {e}")

                    # 6. Playwright Fallback for SPA (if not valid yet but reachable and not parked)
                    if not is_valid and response.status == 200:
                        try:
                            logger.info(f"Low keywords ({keyword_matches}) for {url}, attempting SPA rendering check...")
                            async with async_playwright() as p:
                                browser = await p.chromium.launch(headless=True)
                                ctx = await browser.new_context(user_agent=ScraperService.get_headers()["User-Agent"])
                                pg = await ctx.new_page()
                                await pg.goto(url, wait_until="networkidle", timeout=15000)
                                content = await pg.content()
                                await browser.close()
                                
                                keyword_matches = sum(1 for kw in career_keywords if kw in content.lower())
                                if "/careers" in url_lower or "careers." in url_lower or "jobs." in url_lower:
                                    is_valid = keyword_matches >= 1
                                else:
                                    is_valid = keyword_matches >= 2
                        except Exception as e:
                            logger.warning(f"Playwright fallback failed for {url}: {e}")

                    # 7. Extract Job Title (Attempt to find the actual title on the page)
                    title = "Job Posting"
                    title_elem = soup.find(['h1', 'h2'])
                    if title_elem:
                        # Clean Up Title
                        extracted_title = title_elem.get_text(strip=True)
                        if len(extracted_title) > 5 and len(extracted_title) < 100:
                            title = extracted_title

                    return {
                        "is_reachable": True, 
                        "is_available": is_valid, 
                        "reason": "Legitimate career page" if is_valid else "Generic page or insufficient career content",
                        "final_url": final_url,
                        "title": title
                    }
        except Exception as e:
            return {"is_reachable": False, "is_available": False, "reason": str(e), "final_url": ""}

    @staticmethod
    async def extract_job_details(url: str) -> Dict:
        """
        Scrapes a job page to extract description, experience, and other details.
        """
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, timeout=10, headers=ScraperService.get_headers()) as response:
                    if response.status != 200:
                        return {"description": "N/A", "experience": "N/A"}
                    
                    html = await response.text()
                    soup = BeautifulSoup(html, 'html.parser')
                    
                    # Remove noise
                    for tag in soup(["script", "style", "nav", "header", "footer"]):
                        tag.decompose()
                    
                    # Look for main content
                    content = soup.find('div', class_=re.compile(r'job|description|content|details', re.I))
                    if not content:
                        content = soup.find('section', class_=re.compile(r'job|description|content', re.I))
                    if not content:
                        content = soup.body

                    full_text = content.get_text(separator=' ', strip=True) if content else ""
                    
                    # Extract location
                    loc_pattern = re.compile(r'(?:Location|Remote|Based in|Work from):?\s*([^|\n\r\t]+)', re.I)
                    loc_match = loc_pattern.search(full_text)
                    location = loc_match.group(1).strip() if loc_match else "Global/Remote"
                    if len(location) > 50: location = location[:47] + "..."

                    # Extract job type
                    type_pattern = re.compile(r'(Full-time|Part-time|Contract|Internship|Freelance)', re.I)
                    type_match = type_pattern.search(full_text)
                    job_type = type_match.group(1) if type_match else "Not Specified"

                    # Extract experience
                    exp_pattern = re.compile(r'(\d+[\d\-\+]*\s*(years?|yrs?)\s*(?:of\s*)?(?:experience)?)', re.I)
                    exp_matches = exp_pattern.findall(full_text)
                    experience = exp_matches[0][0] if exp_matches else "See description"
                    
                    # Heuristics for a clean description summary
                    desc_body = content.get_text(separator='\n', strip=True) if content else ""
                    description = desc_body[:1500] + "..." if len(desc_body) > 1500 else desc_body
                    
                    # Extract Job Title
                    title = "Job Posting"
                    title_elem = soup.find(['h1', 'h2'])
                    if title_elem:
                        extracted_title = title_elem.get_text(strip=True)
                        if len(extracted_title) > 5 and len(extracted_title) < 100:
                            title = extracted_title

                    return {
                        "description": description,
                        "experience": experience,
                        "location": location,
                        "job_type": job_type,
                        "title": title
                    }
        except Exception as e:
            logger.error(f"Error extracting job details from {url}: {e}")
            return {"description": "Error extracting details", "experience": "N/A"}

    @staticmethod
    async def discover_jobs(query: str) -> List[str]:
        """
        Uses DuckDuckGo HTML to discover job links from career sites (Lever, Greenhouse, Workable, etc.)
        This avoids headless browser blocking and is significantly faster.
        """
        links = set()
        search_query = f'"{query}" site:lever.co OR site:greenhouse.io OR site:workable.com OR site:smartrecruiters.com OR site:breezy.hr OR site:jobs.ashbyhq.com'
        
        try:
            async with aiohttp.ClientSession(headers=ScraperService.get_headers()) as session:
                data = {'q': search_query}
                async with session.post('https://html.duckduckgo.com/html/', data=data, timeout=15) as resp:
                    if resp.status == 200:
                        text = await resp.text()
                        soup = BeautifulSoup(text, 'html.parser')
                        for a in soup.find_all('a', class_='result__url'):
                            href = a.get('href')
                            if not href: continue
                            
                            href_lower = href.lower()
                            if ('lever.co' in href_lower or 
                                'greenhouse.io' in href_lower or 
                                'workable.com' in href_lower or 
                                'smartrecruiters.com' in href_lower or 
                                'breezy.hr' in href_lower or
                                'ashbyhq.com' in href_lower):
                                links.add(href.split('?')[0].rstrip('/'))
                    else:
                        logger.warning(f"DuckDuckGo HTML returned status {resp.status}")
        except Exception as e:
            logger.error(f"Error discovering jobs via DDG HTML: {e}")
            
        # Fallback to Bing RSS or another method could go here if HTML DDG fails, 
        # but DDG HTML is generally very stable.
        
        # Filter out generic or support pages
        valid_links = []
        for l in links:
            if "support." in l or "help." in l or "blog." in l or "api." in l:
                continue
            if len(l.split('/')) >= 4:
                valid_links.append(l)
                
        logger.info(f"Discovered {len(valid_links)} potential job links")
        return valid_links[:8]

    @staticmethod
    def _normalize_location_match(search_loc: str, target_loc: str, allow_remote: bool = False) -> bool:
        """Intelligently matches search location against ATS location strings."""
        if not search_loc: return True
        s = search_loc.lower().strip()
        t = target_loc.lower().strip()

        # Remote always matches if the caller explicitly opts in
        if allow_remote and "remote" in t:
            return True
        
        # Exact or substring match
        if s in t: return True
        
        # Alias Mapping
        aliases = {
            "usa": ["united states", "u.s.", "america", "new york", "san francisco", "california", "texas", "seattle", "chicago", "boston", "austin"],
            "us": ["united states", "usa", "u.s.", "america"],
            "india": ["bengaluru", "bangalore", "mumbai", "delhi", "gurgaon", "gurugram", "pune", "hyderabad", "chennai", "noida", "kolkata"],
            "uk": ["united kingdom", "london", "manchester", "birmingham", "britain", "england", "scotland", "glasgow"],
            "germany": ["berlin", "munich", "münchen", "deutschland", "hamburg", "frankfurt", "cologne", "köln", "stuttgart"],
            "canada": ["toronto", "vancouver", "montreal", "calgary", "ottawa"],
            "australia": ["sydney", "melbourne", "brisbane", "perth", "canberra"],
            "singapore": ["sg", "singapur"],
            "france": ["paris", "lyon", "marseille"],
            "netherlands": ["amsterdam", "rotterdam", "the hague", "eindhoven"],
            "brazil": ["são paulo", "sao paulo", "rio de janeiro", "brasília"],
        }

        for key, variants in aliases.items():
            if s == key:
                # If search is a country (e.g. "india"), match any city in that country
                all_terms = [key] + variants
                if any(term in t for term in all_terms):
                    return True
            elif s in variants:
                # If search is a specific city (e.g. "pune"), ONLY match that city,
                # the parent country name, or "remote". Do NOT match other cities.
                if s in t or key in t:
                    return True
        
        return False

    @staticmethod
    async def _fetch_lever_board(session: aiohttp.ClientSession, board: str, query: str, location: str = None) -> List[Dict]:
        """Fetches and filters jobs from a specific Lever ATS board."""
        url = f"https://api.lever.co/v0/postings/{board}"
        results = []
        try:
            async with session.get(url, timeout=5) as resp:
                if resp.status == 200:
                    jobs = await resp.json()
                    company_name = board.replace('-', ' ').title()
                    
                    is_company_search = query.lower() in board.lower()
                    
                    for j in jobs:
                        title = j.get("text", "")
                        loc_data = j.get("categories", {}).get("location", "Remote")
                        
                        role_match = not query or is_company_search or query.lower() in title.lower() or all(word in title.lower() for word in query.lower().split())
                        loc_match = ScraperService._normalize_location_match(location, loc_data, allow_remote=True)
                        
                        if role_match and loc_match:
                            desc_text = j.get("descriptionPlain", "")
                            if not desc_text:
                                desc_text = j.get("description", "")
                                if desc_text:
                                    # Strip HTML if plain is missing
                                    import html
                                    clean_html = html.unescape(desc_text)
                                    soup = BeautifulSoup(clean_html, "html.parser")
                                    desc_text = soup.get_text(separator=" ").strip()
                            
                            description = " ".join(desc_text.split()) if desc_text else "Click Apply Now to view the official posting."
                            if len(description) > 600:
                                description = description[:597] + "..."

                            results.append({
                                "company": company_name,
                                "role": title,
                                "location": loc_data[:45] + "..." if len(loc_data) > 45 else loc_data,
                                "link": j.get("hostedUrl"),
                                "verified": True,
                                "source": "Lever ATS",
                                "posted": "Active",
                                "description": description,
                                "experience": "See listing",
                                "job_type": "Full-time"
                            })
                            if not is_company_search and len(results) >= 8:
                                break
        except Exception as e:
            logger.debug(f"Failed to fetch Lever board {board}: {e}")
        return results

    @staticmethod
    async def _fetch_greenhouse_board(session: aiohttp.ClientSession, board: str, query: str, location: str = None) -> List[Dict]:
        """Fetches and filters jobs from a specific Greenhouse ATS board."""
        url = f"https://boards-api.greenhouse.io/v1/boards/{board}/jobs?content=true"
        results = []
        try:
            async with session.get(url, timeout=5) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    jobs = data.get("jobs", [])
                    company_name = board.replace('-', ' ').title()
                    
                    is_company_search = query.lower() in board.lower()
                    
                    for j in jobs:
                        title = j.get("title", "")
                        loc_data = j.get("location", {}).get("name", "Remote")
                        
                        # Match logic: if they searched for the company, return all jobs. Otherwise, match role.
                        role_match = not query or is_company_search or query.lower() in title.lower() or all(word in title.lower() for word in query.lower().split())

                        # Location logic: match if location is provided using normalization
                        loc_match = ScraperService._normalize_location_match(location, loc_data, allow_remote=True)
                        
                        if role_match and loc_match:
                            raw_content = j.get("content", "")
                            import html
                            description = "Click Apply Now to view the official posting."
                            
                            if raw_content:
                                try:
                                    clean_html = html.unescape(raw_content)
                                    soup_desc = BeautifulSoup(clean_html, "html.parser")
                                    text_content = soup_desc.get_text(separator=" ").strip()
                                    if text_content:
                                        description = " ".join(text_content.split())
                                        if len(description) > 600:
                                            description = description[:597] + "..."
                                except Exception:
                                    pass

                            results.append({
                                "company": company_name,
                                "role": title,
                                "location": loc_data[:45] + "..." if len(loc_data) > 45 else loc_data,
                                "link": j.get("absolute_url"),
                                "verified": True,
                                "source": "Greenhouse ATS",
                                "posted": "Active",
                                "description": description,
                                "experience": "See listing",
                                "job_type": "Full-time"
                            })
                            # Increased limit per board to help reach the 10-15 goal
                            if not is_company_search and len(results) >= 8:
                                break
        except Exception as e:
            logger.debug(f"Failed to fetch {board}: {e}")
        return results

    # ---------------------------------------------------------------------------
    # Location-aware public job feed integrations
    # ---------------------------------------------------------------------------

    @staticmethod
    async def _fetch_muse_jobs(session: aiohttp.ClientSession, query: str, location: str = None) -> List[Dict]:
        """Fetches jobs from The Muse API – fully location-aware."""
        results = []
        try:
            params = {"page": 0, "content": "true", "level": ""}
            if location:
                params["location"] = location
            if query:
                params["category"] = query  # The Muse uses category/search terms

            url = "https://www.themuse.com/api/public/jobs"
            async with session.get(url, params=params, timeout=10) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    for j in data.get("results", []):
                        title = j.get("name", "")
                        company = j.get("company", {}).get("name", "Unknown")
                        locs = j.get("locations", [])
                        loc_str = ", ".join(l.get("name", "") for l in locs) or "Remote"
                        job_url = j.get("refs", {}).get("landing_page", "")
                        
                        # Role keyword match: stricter
                        query_words = query.lower().split()
                        role_match = not query or all(w in title.lower() for w in query_words)
                        if not role_match:
                            continue

                        results.append({
                            "company": company,
                            "role": title,
                            "location": loc_str[:60],
                            "link": job_url,
                            "verified": True,
                            "source": "The Muse",
                            "posted": "Active",
                            "description": BeautifulSoup(j.get("contents", ""), "html.parser").get_text(separator=" ").strip()[:600],
                            "experience": "See listing",
                            "job_type": j.get("type", "Full-time")
                        })
                        if len(results) >= 15:
                            break
                else:
                    logger.warning(f"The Muse API returned status {resp.status}")
        except Exception as e:
            logger.warning(f"The Muse fetch failed: {e}")
        return results

    @staticmethod
    async def _fetch_remotive_jobs(session: aiohttp.ClientSession, query: str, location: str = None) -> List[Dict]:
        """Fetches remote-friendly jobs from Remotive API (free, no key)."""
        results = []
        try:
            params = {"limit": 20}
            if query:
                params["search"] = query

            url = "https://remotive.com/api/remote-jobs"
            async with session.get(url, params=params, timeout=10) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    for j in data.get("jobs", []):
                        title = j.get("title", "")
                        loc_str = j.get("candidate_required_location", "Worldwide")

                        # Location filter: if user specified a location, match it or accept "worldwide"
                        if location:
                            loc_lower = loc_str.lower()
                            loc_pass = (
                                "worldwide" in loc_lower
                                or "anywhere" in loc_lower
                                or ScraperService._normalize_location_match(location, loc_str)
                            )
                            if not loc_pass:
                                continue

                        results.append({
                            "company": j.get("company_name", "Unknown"),
                            "role": title,
                            "location": loc_str[:60],
                            "link": j.get("url", ""),
                            "verified": True,
                            "source": "Remotive",
                            "posted": j.get("publication_date", "Active")[:10],
                            "description": BeautifulSoup(j.get("description", ""), "html.parser").get_text(separator=" ").strip()[:600] if j.get("description") else "Click Apply Now.",
                            "experience": "See listing",
                            "job_type": j.get("job_type", "Full-time")
                        })
                        if len(results) >= 15:
                            break
                else:
                    logger.warning(f"Remotive API returned status {resp.status}")
        except Exception as e:
            logger.warning(f"Remotive fetch failed: {e}")
        return results

    @staticmethod
    async def _fetch_arbeitnow_jobs(session: aiohttp.ClientSession, query: str, location: str = None) -> List[Dict]:
        """Fetches jobs from Arbeit Now (good European/global coverage, free API)."""
        results = []
        try:
            url = "https://www.arbeitnow.com/api/job-board-api"
            async with session.get(url, timeout=10) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    for j in data.get("data", []):
                        title = j.get("title", "")
                        loc_str = j.get("location", "Remote")
                        tags = " ".join(j.get("tags", []))

                        # Role keyword match: stricter (all words in query must exist in title or tags)
                        query_words = query.lower().split()
                        role_match = not query or all(w in title.lower() or w in tags.lower() for w in query_words)
                        if not role_match:
                            continue

                        # Location filter
                        if location:
                            loc_pass = (
                                "remote" in loc_str.lower()
                                or ScraperService._normalize_location_match(location, loc_str)
                            )
                            if not loc_pass:
                                continue

                        results.append({
                            "company": j.get("company_name", "Unknown"),
                            "role": title,
                            "location": loc_str[:60],
                            "link": j.get("url", ""),
                            "verified": True,
                            "source": "Arbeit Now",
                            "posted": j.get("created_at", "Active"),
                            "description": BeautifulSoup(j.get("description", ""), "html.parser").get_text(separator=" ").strip()[:600],
                            "experience": "See listing",
                            "job_type": "Full-time"
                        })
                        if len(results) >= 10:
                            break
                else:
                    logger.warning(f"Arbeit Now API returned {resp.status}")
        except Exception as e:
            logger.warning(f"Arbeit Now fetch failed: {e}")
        return results

    @staticmethod
    async def fetch_job_listings(query: str, location: str = None) -> List[Dict]:
        """
        Multi-source job aggregator:
          1. The Muse API       – global, location-aware
          2. Remotive API       – remote-friendly global jobs
          3. Arbeit Now API     – European + global jobs
          4. Greenhouse ATS     – corporate boards (global & regional companies)
          5. Lever ATS          – corporate boards (global & regional companies)
        """
        query_clean = query.lower().strip()
        logger.info(f"Fetching jobs for: '{query}' in '{location or 'anywhere'}'")

        # -----------------------------------------------------------------------
        # ATS Boards – now globally diverse
        # -----------------------------------------------------------------------
        # Global / US companies
        GH_BOARDS_GLOBAL = [
            'stripe', 'discord', 'airbnb', 'dropbox', 'figma', 'reddit',
            'lyft', 'twilio', 'coinbase', 'plaid', 'doordash', 'gusto',
            'databricks', 'roblox', 'pinterest', 'instacart', 'github',
            'zoom', 'robinhood', 'datadog', 'okta', 'asana', 'atlassian',
            'gitlab', 'postman', 'shopify', 'snapchat', 'notion', 'hubspot',
            'box', 'klarna', 'bolt', 'monzo', 'revolut', 'chime', 'affirm',
            'afterpay', 'brex', 'checkout', 'circle', 'confluent', 'elastic'
        ]
        # India-focused / strong India presence
        GH_BOARDS_INDIA = [
            'razorpay', 'cred', 'olamoney', 'meesho', 'groww', 'zepto',
            'browserstack', 'freshworks', 'zoho', 'chargebee', 'postman',
            'nilenso', 'setu', 'smallcase', 'moengage', 'unacademy', 'upgrad',
            'swiggy', 'zomato', 'ola', 'bigbasket', 'curefit', 'dream11',
            'phonepe', 'urbancompany', 'nykaa', 'paytm', 'byjus', 'oyo'
        ]
        # Europe-focused
        GH_BOARDS_EU = [
            'personio', 'n26', 'sumup', 'commercetools', 'celonis',
            'contentful', 'adjust', 'delivery-hero', 'gorillas', 'taxfix',
            'babbel', 'ecosia', 'omio', 'flixbus', 'blablacar', 'deezer',
            'ledger', 'backmarket', 'mirakl', 'qonto', 'alan'
        ]
        # UK-focused
        GH_BOARDS_UK = [
            'monzo', 'checkout', 'depop', 'wise', 'cazoo', 'onfido',
            'bulb', 'edited', 'peak', 'yapily', 'starlingbank', 'revolut',
            'deliveroo', 'darktrace', 'graphcore', 'oaknorth'
        ]

        LEVER_BOARDS = [
            'netflix', 'palantir', 'digitalocean', 'fullstory', 'framer',
            'benchling', 'anduril', 'motive', 'elastic', 'mongodb',
            'snowflake', 'confluent', 'hashicorp', 'personio', 'loom',
            'canva', 'airtable', 'deel', 'clari', 'ironclad', 'medallia',
            'pendo', 'snyk', 'unity', 'webflow', 'zapier'
        ]

        # Pick ATS boards based on location hint for efficiency
        loc_lower = (location or "").lower()
        if any(kw in loc_lower for kw in ["india", "bangalore", "bengaluru", "mumbai", "delhi", "pune", "hyderabad"]):
            GH_BOARDS = GH_BOARDS_GLOBAL[:10] + GH_BOARDS_INDIA
        elif any(kw in loc_lower for kw in ["uk", "london", "manchester", "britain", "england"]):
            GH_BOARDS = GH_BOARDS_GLOBAL[:10] + GH_BOARDS_UK
        elif any(kw in loc_lower for kw in ["germany", "berlin", "france", "paris", "europe", "netherlands", "amsterdam"]):
            GH_BOARDS = GH_BOARDS_GLOBAL[:10] + GH_BOARDS_EU
        else:
            GH_BOARDS = GH_BOARDS_GLOBAL

        # Shuffle boards to provide variety on repeated queries
        random.shuffle(GH_BOARDS)
        random.shuffle(LEVER_BOARDS)

        all_results = []

        async with aiohttp.ClientSession(headers=ScraperService.get_headers()) as session:
            # Run all sources concurrently
            muse_task = ScraperService._fetch_muse_jobs(session, query_clean, location)
            remotive_task = ScraperService._fetch_remotive_jobs(session, query_clean, location)
            arbeitnow_task = ScraperService._fetch_arbeitnow_jobs(session, query_clean, location)
            gh_tasks = [ScraperService._fetch_greenhouse_board(session, board, query_clean, location) for board in GH_BOARDS]
            lever_tasks = [ScraperService._fetch_lever_board(session, board, query_clean, location) for board in LEVER_BOARDS]

            all_tasks = [muse_task, remotive_task, arbeitnow_task] + gh_tasks + lever_tasks
            all_task_names = ["The Muse", "Remotive", "Arbeit Now"] + GH_BOARDS + LEVER_BOARDS

            task_results = await asyncio.gather(*all_tasks, return_exceptions=True)

            for idx, res in enumerate(task_results):
                if isinstance(res, list):
                    all_results.extend(res)
                else:
                    logger.debug(f"Source '{all_task_names[idx]}' failed: {res}")

        if not all_results:
            logger.info(f"No job matches found for '{query}' in '{location}'.")
        else:
            # De-duplicate by link
            seen_links = set()
            unique_results = []
            for j in all_results:
                link = j.get("link", "")
                if link and link not in seen_links:
                    seen_links.add(link)
                    unique_results.append(j)
            all_results = unique_results

            # Sort: exact role matches first, then by source priority
            source_priority = {"The Muse": 0, "Remotive": 1, "Arbeit Now": 2, "Greenhouse ATS": 3, "Lever ATS": 4}
            all_results.sort(key=lambda x: (
                0 if query_clean in x["role"].lower() else 1,
                source_priority.get(x.get("source", ""), 5)
            ))

        logger.info(f"Returning {min(len(all_results), 25)} results for '{query}' in '{location or 'anywhere'}'")
        return all_results[:25]

    @staticmethod
    def get_official_career_page(company: str, role: str = "") -> str:
        # Remove any non-alphanumeric characters (like spaces, dots, commas) to prevent '..com'
        clean_name = re.sub(r'[^a-zA-Z0-9]', '', company.lower())
        
        query = urllib.parse.quote(role) if role else ""
        
        # Hardcode known major career portals and their specific search URL structures
        presets = {
            "google": f"https://www.google.com/about/careers/applications/jobs/results/?q={query}" if query else "https://careers.google.com",
            "microsoft": f"https://jobs.careers.microsoft.com/global/en/search?q={query}" if query else "https://careers.microsoft.com",
            "apple": f"https://jobs.apple.com/en-us/search?search={query}" if query else "https://www.apple.com/careers/us/",
            "netflix": f"https://jobs.netflix.com/search?q={query}" if query else "https://jobs.netflix.com",
            "meta": f"https://www.metacareers.com/jobs/?q={query}" if query else "https://www.metacareers.com"
        }
        
        if clean_name in presets:
            return presets[clean_name]
            
        return f"https://{clean_name}.com/careers"
