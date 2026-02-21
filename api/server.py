"""
AutoAlign — FastAPI Server

Wraps the TurgonClient to provide HTTP endpoints for the Next.js frontend.

Usage:
    uvicorn api.server:app --reload --port 8000
"""
import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from turgon import TurgonClient
from config import GEMINI_MODEL


class AlignRequest(BaseModel):
    brd_content: str
    max_iterations: int = 5


class QueryRequest(BaseModel):
    question: str


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.client = TurgonClient()
    yield


app = FastAPI(title="AutoAlign API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/align")
async def align_brd(req: AlignRequest):
    """Align a BRD with internal governance policies."""
    if not req.brd_content.strip():
        raise HTTPException(status_code=400, detail="BRD content cannot be empty.")
    try:
        client = TurgonClient(max_iterations=req.max_iterations)
        result = await asyncio.to_thread(client.align, req.brd_content)
        return result.model_dump()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/query")
async def query_policy(req: QueryRequest):
    """Query the policy knowledge base."""
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")
    try:
        client = app.state.client
        answer = await asyncio.to_thread(client.query_policy, req.question)
        return {"answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok", "model": GEMINI_MODEL}
