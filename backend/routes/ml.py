from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from database.db import get_db
from models.models import PlacementData, Dataset, User
from auth.auth import get_current_user
from ml.pipeline import pipeline

router = APIRouter()


class PredictionRequest(BaseModel):
    cgpa: float = 0
    backlogs: int = 0
    internships: int = 0
    projects: int = 0
    certification_count: int = 0
    aptitude_score: float = 0
    communication_score: float = 0
    department: str = "CSE"
    gender: str = "Male"


@router.post("/train")
async def train_models(
    dataset_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if dataset_id is None:
        ds = db.query(Dataset).order_by(Dataset.uploaded_at.desc()).first()
        if not ds:
            raise HTTPException(status_code=404, detail="No dataset found")
        dataset_id = ds.id

    records = db.query(PlacementData).filter(
        PlacementData.dataset_id == dataset_id
    ).all()

    if len(records) < 20:
        raise HTTPException(
            status_code=400,
            detail="Need at least 20 records to train models",
        )

    df = pipeline.prepare_data(records)
    if df is None:
        raise HTTPException(status_code=400, detail="Not enough valid data")

    pipeline.train_placement_model(df)
    pipeline.train_salary_model(df)

    return {
        "message": "Models trained successfully",
        "model_info": pipeline.get_model_info(),
    }


@router.post("/predict/placement")
async def predict_placement(
    request: PredictionRequest,
    current_user: User = Depends(get_current_user),
):
    result = pipeline.predict_placement(request.model_dump())
    return result


@router.post("/predict/salary")
async def predict_salary(
    request: PredictionRequest,
    current_user: User = Depends(get_current_user),
):
    result = pipeline.predict_salary(request.model_dump())
    return result


@router.get("/model-info")
async def get_model_info(
    current_user: User = Depends(get_current_user),
):
    return pipeline.get_model_info()
