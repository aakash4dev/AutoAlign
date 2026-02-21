# AutoAlign

> **Converting Static Documentation into Autonomous Governance**

[![HackFest 2.0](https://img.shields.io/badge/HackFest%202.0-GDG%20Cloud%20New%20Delhi-blue)](https://gdg.community.dev/)
[![Track](https://img.shields.io/badge/Track-Agentic%20AI-green)](.)
[![Team](https://img.shields.io/badge/Team-Ninja%20Turtles-red)](.)

---

## The Problem

Documentation sits in folders gathering dust. Developers make costly mistakes because they can't manually cross-reference every governance rule in a 50-page policy doc for every feature they build. The result: compliance rework, security incidents, and project delays.

**AutoAlign turns static policy documents into a living, autonomous governance system.**

---

## Architecture

```
                    ┌─────────────────────────────────────────┐
                    │         AutoAlign Architecture           │
                    └─────────────────────────────────────────┘

  ┌──────────┐     ┌──────────────────────────────────────────────────────┐
  │  Policy  │────▶│              Knowledge Base (ChromaDB)               │
  │   Docs   │     │   Internal_Recommendation_Doc.md + Data Dictionary   │
  └──────────┘     └────────────────────────┬─────────────────────────────┘
                                            │ RAG Retrieval
                                            ▼
  ┌──────────┐     ┌──────────────────────────────────────────────────────┐
  │   BRD    │────▶│                  LangGraph Workflow                  │
  │ (Input)  │     │                                                      │
  └──────────┘     │   ┌─────────────┐      violations     ┌──────────┐  │
                   │   │  DEFENDER   │ ─────────────────▶ │ DRAFTER  │  │
                   │   │   AGENT     │ ◀─────────────────  │  AGENT   │  │
                   │   │(Policy      │   revised BRD       │(Architect│  │
                   │   │ Guardian)   │                     │ Solution)│  │
                   │   └──────┬──────┘                     └──────────┘  │
                   │          │ compliant / max iterations                │
                   │          ▼                                           │
                   │   ┌─────────────┐                                   │
                   │   │   REPORT    │                                   │
                   │   │    NODE     │                                   │
                   │   └─────────────┘                                   │
                   └──────────────────────────────────────────────────────┘
                                            │
                                            ▼
                              ┌─────────────────────────┐
                              │  Aligned BRD + Report   │
                              │  (Output)               │
                              └─────────────────────────┘
```

### The Debate Loop

1. **Defender Agent** analyzes the BRD against the policy knowledge base via RAG, identifying all violations
2. If violations exist, **Drafter Agent** rewrites the BRD to fix every issue while preserving business intent
3. The revised BRD goes back to the Defender for another pass
4. Loop continues until the BRD is compliant or max iterations are reached
5. Final **Compliance Report** is generated with full audit trail

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| **AI Reasoning** | Google Gemini 1.5 Pro (high context window for large Markdown files) |
| **Vector Storage** | ChromaDB (local) / Vertex AI Vector Search (production) |
| **Data Warehouse** | BigQuery (audit logs, policy metadata) |
| **Orchestration** | LangGraph (multi-agent state machine) |
| **SDK** | Turgon SDK (AutoAlign integration layer) |
| **Embeddings** | Google `embedding-001` |
| **Framework** | LangChain |

---

## Project Structure

```
AutoAlign/
├── main.py                         # CLI entry point
├── requirements.txt
├── .env.example
├── config/
│   ├── __init__.py
│   └── settings.py                 # All configuration
├── src/
│   ├── agents/
│   │   ├── defender.py             # Policy Defender Agent
│   │   └── drafter.py             # Compliance Drafter Agent
│   ├── knowledge_base/
│   │   ├── loader.py              # Document ingestion + vector store
│   │   └── retriever.py           # RAG retrieval
│   ├── workflow/
│   │   ├── state.py               # LangGraph state definitions
│   │   └── graph.py               # Multi-agent workflow graph
│   └── utils/
│       └── logger.py              # Structured logging
├── turgon/                         # Turgon SDK (high-level client)
│   ├── client.py
│   └── models.py
├── docs/                           # Policy documents (knowledge base)
│   ├── Internal_Recommendation_Doc.md
│   └── Data_Dictionary.md
└── examples/
    └── sample_brd.md              # Intentionally non-compliant BRD demo
```

---

## Getting Started

### 1. Clone the Repo

```bash
git clone https://github.com/aakash4dev/AutoAlign.git
cd AutoAlign
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env and add your GOOGLE_API_KEY
```

Get a Google AI Studio API key: https://aistudio.google.com/app/apikey

### 3. Backend Setup

```bash
# Create a virtual environment
python3 -m venv .venv

# Activate it
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the backend API server (runs on http://localhost:8000)
uvicorn api.server:app --reload --port 8000
```

Keep this terminal open. The backend must be running for the frontend to work.

### 4. Frontend Setup

Open a **new terminal** and run:

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on **http://localhost:3000**.

### 5. Using the CLI (Optional)

You can also use AutoAlign directly from the command line without the frontend:

```bash
# Activate the virtual environment (if not already)
source .venv/bin/activate

# Align the sample BRD (which has intentional violations)
python main.py align examples/sample_brd.md

# Save the aligned output
python main.py align examples/sample_brd.md --output aligned_brd.md

# Query the policy knowledge base directly
python main.py query "What are the rules for storing customer IDs in logs?"

# Rebuild the knowledge base (after adding new policy docs)
python main.py rebuild-kb
```

---

## Demo Scenario

The `examples/sample_brd.md` contains a real-world BRD with **intentional violations**:

| Violation | Policy | Severity |
|-----------|--------|----------|
| `customer_id` stored in plaintext logs | Section 4.2 (PII) | CRITICAL |
| `user_email` stored in plaintext | Section 4.2 (PII) | CRITICAL |
| `ip_address` in plaintext | Section 4.1 (PII) | CRITICAL |
| API key hardcoded in source code | Section 5.3 (Secrets) | CRITICAL |
| CORS wildcard `*` in production | Section 2.2 (API Security) | HIGH |
| No authentication on debug endpoint | Section 2.1 (Auth) | HIGH |
| No rate limiting | Section 2.2 (API Security) | HIGH |
| Shared service account with admin access | Section 2.1 (PoLP) | HIGH |
| Service account key committed to Git | Section 5.3 (Secrets) | CRITICAL |
| Indefinite data retention | Section 4.2.3 (Minimization) | MEDIUM |
| `FLOAT` type for currency | Data Dictionary | MEDIUM |

AutoAlign automatically detects and fixes all of these.

---

## Using the Turgon SDK

```python
from turgon import TurgonClient

client = TurgonClient(max_iterations=5)

# Align a BRD string
result = client.align(brd_text)

# Align a BRD file
result = client.align_file("examples/sample_brd.md")

print(result.status)           # ComplianceStatus.COMPLIANT
print(result.compliance_score) # 1.0
print(result.aligned_brd)      # The fixed, compliant BRD
print(result.compliance_report) # Human-readable report
print(result.summary())         # One-liner summary

# Query the knowledge base
answer = client.query_policy("What are PII logging rules?")
print(answer)
```

---

## Future Scope

- **GitHub PR Integration**: Hook AutoAlign into GitHub Actions to auto-check every PR
- **Multi-Domain Support**: Legal, HR, GDPR, DPDP Act, SOC 2 policy sources
- **Vertex AI Vector Search**: Production-scale vector store with real-time updates
- **BigQuery Audit Warehouse**: Full audit trail of every alignment decision
- **Slack/Teams Notifications**: Real-time compliance alerts for developers

---

## Team: Ninja Turtles

| Member | Role |
|--------|------|
| **Aakash Singh Rajput** | Lead AI Developer (Agentic Workflows) |
| **Tushar Kumar** | Cloud Architect (GCP Integration) |
| **Nandini Goyal** | Host and Engagement Lead at OSCG |
| **Shivani Sahu** | Full Stack Developer |

**Event:** HackFest 2.0 — GDG Cloud New Delhi
**Track:** Agentic AI

---

> *AutoAlign makes policy invisible and compliance inevitable.*
