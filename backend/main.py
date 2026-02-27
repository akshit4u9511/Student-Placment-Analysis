from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.db import engine, Base
from routes import auth, data, analytics, ml, llm
import models.models  # noqa: F401 - registers models

app = FastAPI(
    title="Smart Placement Analytics API",
    description="Open-Source Placement Analytics Dashboard Backend",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(data.router, prefix="/api/data", tags=["Data Management"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(ml.router, prefix="/api/ml", tags=["Machine Learning"])
app.include_router(llm.router, prefix="/api/llm", tags=["LLM Integration"])


@app.on_event("startup")
async def startup():
    Base.metadata.create_all(bind=engine)


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}
