"""Download the user-provided reference media; keep remote fallback metadata."""
import concurrent.futures
import json
from pathlib import Path
import urllib.request

root = Path(__file__).resolve().parent.parent
urls = json.loads((root / 'scripts/reference-assets.json').read_text())

def download(url):
    filename = url.rsplit('/', 1)[-1]
    target = root / 'public/assets' / filename
    try:
        request = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(request, timeout=35) as response:
            data = response.read()
        if not (data.startswith(b'GIF8') or data.startswith(b'\x89PNG')):
            raise ValueError('Response is not an image')
        target.write_bytes(data)
        print(f'LOCAL {filename} {len(data)} bytes', flush=True)
        return {'url': url, 'file': 'assets/' + filename, 'local': True}
    except Exception as error:
        print(f'REMOTE {filename}: {error}', flush=True)
        return {'url': url, 'file': '', 'local': False}

with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
    result = list(pool.map(download, urls))
(root / 'src/reference-assets.json').write_text(json.dumps(result, indent=2) + '\n')
print(f'Downloaded {sum(item["local"] for item in result)}/{len(result)} images')
