from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from database.db import get_db
from models.models import PlacementData, Dataset, User
from auth.auth import get_current_user, require_role
import pandas as pd
import io
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter()

REQUIRED_COLUMNS = [
    "student_name", "gender", "department", "batch_year", "cgpa",
    "placed", "salary"
]


class DatasetResponse(BaseModel):
    id: int
    name: str
    version: int
    record_count: int
    uploaded_at: str

    class Config:
        from_attributes = True


@router.post("/upload")
async def upload_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted")

    contents = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading CSV: {str(e)}")

    # Normalize column names handling duplicates
    df.columns = df.columns.astype(str).str.strip().str.lower().str.replace(" ", "_")
    df = df.loc[:, ~df.columns.duplicated()]

    # Column aliases mapping
    aliases_map = {
        "student_name": ["name", "student", "candidate", "candidate_name"],
        "department": ["branch", "stream", "dept", "course"],
        "batch_year": ["batch", "year", "pass_out_year", "graduation_year"],
        "cgpa": ["gpa", "grade", "marks", "score"],
        "placed": ["status", "placement_status", "is_placed", "hired"],
        "salary": ["package", "lpa", "ctc", "salary_in_lpa"],
        "company_name": ["company", "employer", "hired_by", "organization", "placed_company"],
        "skills": ["skill", "technical_skills", "core_skills", "technologies"],
        "gender": ["sex"],
        "certification_count": ["certifications", "certificate", "certs"],
    }

    for expected, aliases in aliases_map.items():
        if expected not in df.columns:
            for alias in aliases:
                if alias in df.columns:
                    df[expected] = df[alias]
                    break

    # Add missing optional columns as empty/default to ensure they exist
    optional_defaults = {
        "salary": 0, "cgpa": 0, "backlogs": 0, "internships": 0,
        "projects": 0, "certification_count": 0, "aptitude_score": 0,
        "communication_score": 0, "skills": "", "company_name": "",
        "student_name": "Unknown", "gender": "Unknown",
        "batch_year": 2024, "placement_type": "On-campus",
        "age": 22
    }
    
    for col, default_val in optional_defaults.items():
        if col not in df.columns:
            df[col] = default_val

    # Check required columns
    missing = [c for c in ["department", "placed"] if c not in df.columns]
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Missing required columns: {missing}. Found: {list(df.columns)}",
        )

    # Clean data: Replace NaN/null with defaults
    df = df.drop_duplicates()
    df = df.fillna(optional_defaults)

    # Version dataset
    existing = db.query(Dataset).filter(Dataset.name == file.filename).first()
    version = (existing.version + 1) if existing else 1

    dataset = Dataset(
        name=file.filename,
        version=version,
        uploaded_by=current_user.id,
        record_count=len(df),
        description=f"Uploaded by {current_user.username}",
    )
    db.add(dataset)
    db.commit()
    db.refresh(dataset)

    # Insert records
    records = []
    for _, row in df.iterrows():
        record = PlacementData(
            dataset_id=dataset.id,
            student_name=str(row.get("student_name", "Unknown")),
            gender=str(row.get("gender", "Unknown")),
            age=int(row.get("age", 22)),
            department=str(row.get("department", "")),
            batch_year=int(row.get("batch_year", 2024)),
            cgpa=float(row.get("cgpa", 0)),
            backlogs=int(row.get("backlogs", 0)),
            internships=int(row.get("internships", 0)),
            projects=int(row.get("projects", 0)),
            skills=str(row.get("skills", "")),
            certification_count=int(row.get("certification_count", 0)),
            aptitude_score=float(row.get("aptitude_score", 0)),
            communication_score=float(row.get("communication_score", 0)),
            placed=bool(row.get("placed", False)),
            company_name=str(row.get("company_name", "")),
            salary=float(row.get("salary", 0)),
            placement_type=str(row.get("placement_type", "On-campus")),
        )
        records.append(record)

    db.bulk_save_objects(records)
    db.commit()

    return {
        "message": "Upload successful",
        "dataset_id": dataset.id,
        "version": version,
        "records_inserted": len(records),
    }


@router.get("/datasets")
async def list_datasets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    datasets = db.query(Dataset).order_by(Dataset.uploaded_at.desc()).all()
    return [
        {
            "id": ds.id,
            "name": ds.name,
            "version": ds.version,
            "record_count": ds.record_count,
            "uploaded_at": str(ds.uploaded_at),
        }
        for ds in datasets
    ]


@router.get("/records/{dataset_id}")
async def get_records(
    dataset_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    records = (
        db.query(PlacementData)
        .filter(PlacementData.dataset_id == dataset_id)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return records


@router.delete("/datasets/{dataset_id}")
async def delete_dataset(
    dataset_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    if current_user.role != "admin" and dataset.uploaded_by != current_user.id:
        raise HTTPException(status_code=403, detail="Insufficient permissions to delete this dataset")

    db.query(PlacementData).filter(PlacementData.dataset_id == dataset_id).delete()
    db.delete(dataset)
    db.commit()
    return {"message": "Dataset deleted"}
