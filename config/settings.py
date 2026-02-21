"""
AutoAlign Configuration Settings
"""
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# Base directory
BASE_DIR = Path(__file__).parent.parent

# Google AI Configuration
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")
GOOGLE_CLOUD_PROJECT = os.getenv("GOOGLE_CLOUD_PROJECT", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemma-3-27b-it")
GEMINI_TEMPERATURE = float(os.getenv("GEMINI_TEMPERATURE", "0.2"))

# Vector Store Configuration
VECTOR_STORE_PATH = os.getenv("VECTOR_STORE_PATH", str(BASE_DIR / "data" / "vector_store"))
CHROMA_COLLECTION_NAME = os.getenv("CHROMA_COLLECTION_NAME", "autoalign_policies")

# AutoAlign Workflow Settings
MAX_DEBATE_ITERATIONS = int(os.getenv("MAX_DEBATE_ITERATIONS", "5"))
COMPLIANCE_THRESHOLD = float(os.getenv("COMPLIANCE_THRESHOLD", "0.85"))

# Document Paths
POLICY_DOCS_DIR = os.getenv("POLICY_DOCS_DIR", str(BASE_DIR / "docs"))

# Chunk sizes for document processing
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200

# Retrieval settings
TOP_K_RESULTS = 5
