from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, Enum
)
from sqlalchemy.orm import relationship
from database.db import Base
from datetime import datetime
import enum


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    ANALYST = "analyst"
    STUDENT = "student"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100))
    role = Column(String(20), default=UserRole.STUDENT)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class PlacementData(Base):
    __tablename__ = "placement_data"

    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id"), nullable=False)
    student_name = Column(String(100))
    gender = Column(String(10))
    age = Column(Integer)
    department = Column(String(100))
    batch_year = Column(Integer)
    cgpa = Column(Float)
    backlogs = Column(Integer, default=0)
    internships = Column(Integer, default=0)
    projects = Column(Integer, default=0)
    skills = Column(Text)  # comma-separated
    certification_count = Column(Integer, default=0)
    aptitude_score = Column(Float)
    communication_score = Column(Float)
    placed = Column(Boolean, default=False)
    company_name = Column(String(200))
    salary = Column(Float)  # in LPA
    placement_type = Column(String(50))  # On-campus, Off-campus
    created_at = Column(DateTime, default=datetime.utcnow)

    dataset = relationship("Dataset", back_populates="records")


class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    version = Column(Integer, default=1)
    uploaded_by = Column(Integer, ForeignKey("users.id"))
    record_count = Column(Integer, default=0)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    description = Column(Text)

    records = relationship("PlacementData", back_populates="dataset")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String(100), nullable=False)
    details = Column(Text)
    ip_address = Column(String(45))
    timestamp = Column(DateTime, default=datetime.utcnow)
