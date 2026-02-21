import urllib.request
import os
import json

api_key = os.environ.get("GOOGLE_API_KEY")

if not api_key:
    # try reading .env
    with open(".env", "r") as f:
        for line in f:
            if line.startswith("GOOGLE_API_KEY="):
                api_key = line.strip().split("=", 1)[1].strip('"\'')
                break

url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
req = urllib.request.Request(url)
try:
    with urllib.request.urlopen(req) as response:
         data = json.loads(response.read().decode())
         for model in data.get('models', []):
             if 'embed' in model.get('supportedGenerationMethods', []):
                 print(model['name'])
except Exception as e:
    print(f"Error: {e}")
