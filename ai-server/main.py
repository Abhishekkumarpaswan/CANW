import os
import json
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from groq import AsyncGroq

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

GROQ_API_KEY = (
    os.getenv("GROQ_API_KEY")
    or os.getenv("GROK_API_KEY")
    or os.getenv("GROK_APIP_KEY")
)
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
AI_SERVER_PORT = int(os.getenv("AI_SERVER_PORT", os.getenv("PORT", "8000")))

class TextRequest(BaseModel):
    content: str
    title: str = ""

class SummaryResponse(BaseModel):
    summary: str
    actionItems: list
    suggestedTitle: str
    tokensUsed: int

async def call_groq_api(prompt: str) -> tuple[str, int]:
    if not GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured")

    try:
        client = AsyncGroq(api_key=GROQ_API_KEY)
        response = await client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_completion_tokens=1024,
        )
        content = response.choices[0].message.content or ""
        tokens_used = getattr(response.usage, "total_tokens", 0) or 0
        return content.strip(), tokens_used
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Groq API error: {str(e)}")

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
        summary, summary_tokens = await call_groq_api(summary_prompt)

        action_items_text, action_items_tokens = await call_groq_api(
            action_items_prompt
        )

        try:
            action_items = json.loads(action_items_text)
            if not isinstance(action_items, list):
                action_items = [action_items_text]
        except:
            action_items = [action_items_text]

        suggested_title, title_tokens = await call_groq_api(suggested_title_prompt)

        tokens_used = summary_tokens + action_items_tokens + title_tokens

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
