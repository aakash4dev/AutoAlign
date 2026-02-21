import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.environ.get("GOOGLE_API_KEY")
genai.configure(api_key=api_key)

try:
    for m in genai.list_models():
        if "embed" in m.name.lower():
            print(f"{m.name} - {m.supported_generation_methods}")
except Exception as e:
    print(f"Error: {e}")
