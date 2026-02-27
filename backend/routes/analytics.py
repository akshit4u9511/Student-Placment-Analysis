from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from database.db import get_db
from models.models import PlacementData, Dataset, User
from auth.auth import get_current_user
from typing import Optional
from collections import Counter

router = APIRouter()


def get_latest_dataset_id(db: Session) -> int:
    ds = db.query(Dataset).order_by(Dataset.uploaded_at.desc()).first()
    if not ds:
        raise HTTPException(status_code=404, detail="No dataset uploaded yet")
    return ds.id


@router.get("/overview")
async def get_overview(
    dataset_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ds_id = dataset_id or get_latest_dataset_id(db)
    records = db.query(PlacementData).filter(PlacementData.dataset_id == ds_id).all()

    if not records:
        return {
            "total_students": 0, "total_placed": 0, "placement_percentage": 0,
            "highest_package": 0, "average_package": 0, "median_package": 0,
        }

    total = len(records)
    placed = [r for r in records if r.placed]
    salaries = [r.salary for r in placed if r.salary and r.salary > 0]

    return {
        "total_students": total,
        "total_placed": len(placed),
        "placement_percentage": round(len(placed) / total * 100, 1) if total else 0,
        "highest_package": max(salaries) if salaries else 0,
        "average_package": round(sum(salaries) / len(salaries), 2) if salaries else 0,
        "median_package": round(sorted(salaries)[len(salaries) // 2], 2) if salaries else 0,
    }


@router.get("/department")
async def get_department_analytics(
    dataset_id: Optional[int] = None,
    batch_year: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ds_id = dataset_id or get_latest_dataset_id(db)
    query = db.query(PlacementData).filter(PlacementData.dataset_id == ds_id)
    if batch_year:
        query = query.filter(PlacementData.batch_year == batch_year)
    records = query.all()

    dept_data = {}
    for r in records:
        dept = r.department
        if dept not in dept_data:
            dept_data[dept] = {"total": 0, "placed": 0, "salaries": []}
        dept_data[dept]["total"] += 1
        if r.placed:
            dept_data[dept]["placed"] += 1
            if r.salary and r.salary > 0:
                dept_data[dept]["salaries"].append(r.salary)

    result = []
    for dept, data in dept_data.items():
        avg_salary = (
            round(sum(data["salaries"]) / len(data["salaries"]), 2)
            if data["salaries"] else 0
        )
        result.append({
            "department": dept,
            "total": data["total"],
            "placed": data["placed"],
            "placement_percentage": round(data["placed"] / data["total"] * 100, 1) if data["total"] else 0,
            "average_salary": avg_salary,
        })

    return sorted(result, key=lambda x: x["placement_percentage"], reverse=True)


@router.get("/salary")
async def get_salary_analysis(
    dataset_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ds_id = dataset_id or get_latest_dataset_id(db)
    records = db.query(PlacementData).filter(
        PlacementData.dataset_id == ds_id,
        PlacementData.placed == True,
        PlacementData.salary > 0,
    ).all()

    # Distribution bins
    salaries = [r.salary for r in records]
    if not salaries:
        return {"distribution": [], "trend": [], "by_department": []}

    min_s, max_s = min(salaries), max(salaries)
    bin_size = max((max_s - min_s) / 10, 0.5)
    bins = {}
    for s in salaries:
        bin_key = round(int(s / bin_size) * bin_size, 1)
        bins[bin_key] = bins.get(bin_key, 0) + 1

    distribution = [{"range": f"{k}-{k + bin_size:.1f}", "count": v, "salary": k}
                     for k, v in sorted(bins.items())]

    # Yearly trend
    year_data = {}
    for r in records:
        yr = r.batch_year
        if yr not in year_data:
            year_data[yr] = []
        year_data[yr].append(r.salary)

    trend = [
        {
            "year": yr,
            "average_salary": round(sum(sals) / len(sals), 2),
            "placed_count": len(sals),
        }
        for yr, sals in sorted(year_data.items())
    ]

    # By department (box plot data)
    dept_salaries = {}
    for r in records:
        d = r.department
        if d not in dept_salaries:
            dept_salaries[d] = []
        dept_salaries[d].append(r.salary)

    by_department = []
    for dept, sals in dept_salaries.items():
        sals.sort()
        n = len(sals)
        by_department.append({
            "department": dept,
            "min": sals[0],
            "q1": sals[n // 4] if n >= 4 else sals[0],
            "median": sals[n // 2],
            "q3": sals[3 * n // 4] if n >= 4 else sals[-1],
            "max": sals[-1],
            "average": round(sum(sals) / n, 2),
        })

    return {
        "distribution": distribution,
        "trend": trend,
        "by_department": by_department,
    }


@router.get("/companies")
async def get_company_insights(
    dataset_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ds_id = dataset_id or get_latest_dataset_id(db)
    records = db.query(PlacementData).filter(
        PlacementData.dataset_id == ds_id,
        PlacementData.placed == True,
    ).all()

    company_data = {}
    for r in records:
        c = r.company_name or "Unknown"
        if c not in company_data:
            company_data[c] = {"offers": 0, "salaries": []}
        company_data[c]["offers"] += 1
        if r.salary and r.salary > 0:
            company_data[c]["salaries"].append(r.salary)

    result = []
    for company, data in company_data.items():
        avg_salary = (
            round(sum(data["salaries"]) / len(data["salaries"]), 2)
            if data["salaries"] else 0
        )
        result.append({
            "company": company,
            "offers": data["offers"],
            "average_salary": avg_salary,
            "max_salary": max(data["salaries"]) if data["salaries"] else 0,
        })

    return sorted(result, key=lambda x: x["offers"], reverse=True)


@router.get("/skills")
async def get_skills_analysis(
    dataset_id: Optional[int] = None,
    department: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ds_id = dataset_id or get_latest_dataset_id(db)
    query = db.query(PlacementData).filter(PlacementData.dataset_id == ds_id)
    if department:
        query = query.filter(PlacementData.department == department)
    records = query.all()

    skill_counts = Counter()
    skill_salaries = {}

    for r in records:
        if not r.skills:
            continue
        skills = [s.strip() for s in r.skills.split(",") if s.strip()]
        for skill in skills:
            skill_counts[skill] += 1
            if skill not in skill_salaries:
                skill_salaries[skill] = []
            if r.salary and r.salary > 0:
                skill_salaries[skill].append(r.salary)

    top_skills = [
        {
            "skill": skill,
            "count": count,
            "average_salary": round(
                sum(skill_salaries.get(skill, [0])) / max(len(skill_salaries.get(skill, [1])), 1), 2
            ),
        }
        for skill, count in skill_counts.most_common(20)
    ]

    # Heatmap data: skill vs salary correlation
    heatmap = []
    for skill, sals in skill_salaries.items():
        if len(sals) >= 2:
            heatmap.append({
                "skill": skill,
                "count": len(sals),
                "avg_salary": round(sum(sals) / len(sals), 2),
                "correlation": round(sum(sals) / len(sals) / max(max(sals), 1), 2),
            })

    return {
        "top_skills": top_skills,
        "heatmap": sorted(heatmap, key=lambda x: x["avg_salary"], reverse=True)[:15],
    }


@router.get("/batch-years")
async def get_batch_years(
    dataset_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ds_id = dataset_id or get_latest_dataset_id(db)
    years = (
        db.query(PlacementData.batch_year)
        .filter(PlacementData.dataset_id == ds_id)
        .distinct()
        .all()
    )
    return sorted([y[0] for y in years])


@router.get("/departments")
async def get_departments(
    dataset_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ds_id = dataset_id or get_latest_dataset_id(db)
    depts = (
        db.query(PlacementData.department)
        .filter(PlacementData.dataset_id == ds_id)
        .distinct()
        .all()
    )
    return sorted([d[0] for d in depts])
