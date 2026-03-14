import urllib.request
import xml.etree.ElementTree as ET

def main():
    url = "https://weworkremotely.com/remote-jobs.rss"
    req = urllib.request.Request(url, headers={'User-Agent': 'JobGuardAI'})
    try:
        response = urllib.request.urlopen(req)
        xml_data = response.read()
        root = ET.fromstring(xml_data)
        items = root.findall('.//item')
        print(f"Found {len(items)} jobs")
        if items:
            link = items[0].find('link').text
            print(f"Sample URL: {link}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
