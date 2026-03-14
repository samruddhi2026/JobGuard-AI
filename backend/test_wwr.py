import urllib.request
from bs4 import BeautifulSoup
import urllib.parse

def main():
    query = "Data Analyst"
    url = f"https://weworkremotely.com/remote-jobs/search?term={urllib.parse.quote(query)}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        html = urllib.request.urlopen(req).read()
        soup = BeautifulSoup(html, 'html.parser')
        jobs = soup.find_all('li', class_='feature')
        print(f"Found {len(jobs)} jobs")
        for j in jobs[:2]:
            company = j.find('span', class_='company').text.strip() if j.find('span', class_='company') else "N/A"
            title = j.find('span', class_='title').text.strip() if j.find('span', class_='title') else "N/A"
            print(f"- {company}: {title}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
