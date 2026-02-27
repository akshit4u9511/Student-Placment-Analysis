from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from database.db import get_db
from models.models import PlacementData, Dataset, User
from auth.auth import get_current_user
import httpx
import json

router = APIRouter()


OLLAMA_BASE_URL = "http://localhost:11434"


class ChatRequest(BaseModel):
    message: str
    dataset_id: Optional[int] = None
    model: str = "llama3"


class ChatResponse(BaseModel):
    response: str
    model: str


def build_dataset_summary(records: list) -> str:
    if not records:
        return "No data available."

    total = len(records)
    placed = sum(1 for r in records if r.placed)
    salaries = [r.salary for r in records if r.placed and r.salary and r.salary > 0]

    depts = {}
    for r in records:
        d = r.department
        if d not in depts:
            depts[d] = {"total": 0, "placed": 0}
        depts[d]["total"] += 1
        if r.placed:
            depts[d]["placed"] += 1

    dept_summary = ", ".join(
        f"{d}: {v['placed']}/{v['total']} placed"
        for d, v in sorted(depts.items())
    )

    summary = f"""Dataset Summary:
- Total Students: {total}
- Placed: {placed} ({round(placed/total*100, 1)}%)
- Average Salary: {round(sum(salaries)/len(salaries), 2) if salaries else 0} LPA
- Highest Salary: {max(salaries) if salaries else 0} LPA
- Lowest Salary: {min(salaries) if salaries else 0} LPA
- Department Breakdown: {dept_summary}
"""
    return summary


@router.post("/chat", response_model=ChatResponse)
async def chat_with_llm(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Get dataset summary
    dataset_summary = ""
    try:
        ds_id = request.dataset_id
        if ds_id is None:
            ds = db.query(Dataset).order_by(Dataset.uploaded_at.desc()).first()
            if ds:
                ds_id = ds.id

        if ds_id:
            records = db.query(PlacementData).filter(
                PlacementData.dataset_id == ds_id
            ).all()
            dataset_summary = build_dataset_summary(records)
    except Exception:
        dataset_summary = "No dataset loaded."

    system_prompt = f"""You are an AI placement analytics assistant. You help analyze student placement data and provide insights.
You have access to the following dataset information:

{dataset_summary}

Provide helpful, data-driven insights. Be concise and actionable. Format your response in clear paragraphs.
If asked about predictions or trends, use the data provided to give informed answers.
Always be encouraging and constructive in your recommendations."""

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": request.model,
                    "prompt": request.message,
                    "system": system_prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.7,
                        "num_predict": 500,
                    },
                },
            )

            if response.status_code != 200:
                raise HTTPException(
                    status_code=503,
                    detail="Ollama service not available. Make sure Ollama is running locally.",
                )

            result = response.json()
            return ChatResponse(
                response=result.get("response", "No response generated"),
                model=request.model,
            )

    except httpx.ConnectError:
        # Fallback: generate a basic response without LLM
        return ChatResponse(
            response=generate_fallback_response(request.message, dataset_summary),
            model="fallback",
        )
    except Exception as e:
        return ChatResponse(
            response=f"AI Assistant is currently unavailable. Please ensure Ollama is running (ollama serve). Error: {str(e)}",
            model="error",
        )


@router.get("/models")
async def list_models():
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
            if response.status_code == 200:
                data = response.json()
                models = [m["name"] for m in data.get("models", [])]
                return {"models": models, "available": True}
    except Exception:
        pass
    return {"models": [], "available": False}


def generate_fallback_response(message: str, summary: str) -> str:
    msg_lower = message.lower()
    if any(w in msg_lower for w in ["overview", "summary", "overall"]):
        return f"Here's a summary of the placement data:\n\n{summary}\n\nFor more detailed AI-powered insights, please start Ollama locally with 'ollama serve' and pull a model with 'ollama pull llama3'."
    elif any(w in msg_lower for w in ["improve", "suggest", "recommend"]):
        return """Based on typical placement analytics patterns, here are key recommendations:

1. **Focus on CGPA**: Students with CGPA > 7.5 have significantly higher placement rates.
2. **Build Projects**: Having 2+ projects greatly improves placement chances.
3. **Get Internships**: Internship experience is a strong predictor of placement success.
4. **Develop Skills**: Focus on in-demand skills like Python, Machine Learning, Data Science.
5. **Certifications**: Professional certifications add credibility to your profile.

For personalized AI insights, please start Ollama with 'ollama serve'."""
    elif any(w in msg_lower for w in ["predict", "trend", "future"]):
        return """Based on historical placement patterns:

1. **Placement rates** have been trending upward across most departments.
2. **Average salaries** are increasing, especially in tech-related departments.
3. **Skills in demand**: AI/ML, Cloud Computing, and Full-Stack Development.
4. **Companies** are increasingly looking for students with project experience and internships.

For detailed AI-powered predictions, please start Ollama with 'ollama serve'."""
    else:
        return f"I can help analyze your placement data. {summary}\n\nFor detailed AI-powered analysis, please start Ollama locally with 'ollama serve' and pull a model with 'ollama pull llama3'."
