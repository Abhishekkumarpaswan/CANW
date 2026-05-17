import os
from pathlib import Path
import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parents[1]
load_dotenv(PROJECT_ROOT / ".env")
load_dotenv()

app = FastAPI(title="CANW AI Server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GROK_API_KEY = os.getenv("GROK_API_KEY")
GROK_API_URL = "https://api.x.ai/v1/chat/completions"
AI_SERVER_PORT = int(os.getenv("AI_SERVER_PORT", os.getenv("PORT", "8000")))

class TextRequest(BaseModel):
    content: str
    title: str = ""

class SummaryResponse(BaseModel):
    summary: str
    actionItems: list
    suggestedTitle: str
    tokensUsed: int

async def call_grok_api(prompt: str) -> dict:
    """Call Grok API with the given prompt"""
    if not GROK_API_KEY:
        raise HTTPException(status_code=500, detail="GROK_API_KEY not configured")
    
    headers = {
        "Authorization": f"Bearer {GROK_API_KEY}",
        "Content-Type": "application/json",
    }
    
    payload = {
        "model": "grok-beta",
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7,
        "max_tokens": 1024,
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(GROK_API_URL, json=payload, headers=headers, timeout=30.0)
            response.raise_for_status()
            result = response.json()
            return result
    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"Grok API error: {str(e)}")

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "OK", "message": "AI Server is running"}

@app.post("/api/ai/summarize", response_model=SummaryResponse)
async def summarize_note(request: TextRequest):
    """
    Generate summary, action items, and suggested title for note content
    """
    if not request.content.strip():
        raise HTTPException(status_code=400, detail="Content cannot be empty")

    summary_prompt = f"""Please analyze the following note and provide a concise summary (2-3 sentences):

Title: {request.title}
Content:
{request.content}

Provide only the summary, nothing else."""

    action_items_prompt = f"""From the following note content, extract 3-5 key action items as a JSON array:

Title: {request.title}
Content:
{request.content}

Return ONLY a JSON array of strings like: ["action 1", "action 2", "action 3"]"""

    suggested_title_prompt = f"""Based on this note content, suggest a better title (max 50 characters):

Current Title: {request.title}
Content:
{request.content}

Provide only the suggested title, nothing else."""

    try:
        summary_result = await call_grok_api(summary_prompt)
        summary = summary_result["choices"][0]["message"]["content"].strip()

        action_items_result = await call_grok_api(action_items_prompt)
        action_items_text = action_items_result["choices"][0]["message"]["content"].strip()

        try:
            import json
            action_items = json.loads(action_items_text)
            if not isinstance(action_items, list):
                action_items = [action_items_text]
        except:
            action_items = [action_items_text]

        title_result = await call_grok_api(suggested_title_prompt)
        suggested_title = title_result["choices"][0]["message"]["content"].strip()

        total_content = summary + action_items_text + suggested_title
        tokens_used = len(total_content) // 4

        return SummaryResponse(
            summary=summary,
            actionItems=action_items if isinstance(action_items, list) else [action_items],
            suggestedTitle=suggested_title,
            tokensUsed=tokens_used
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=AI_SERVER_PORT)
