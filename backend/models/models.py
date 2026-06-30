from sqlalchemy import Column, String, Float, Boolean, Integer, DateTime, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from geoalchemy2 import Geometry
from .database import Base
import enum

class SeverityEnum(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"

class StatusEnum(str, enum.Enum):
    reported = "reported"
    ai_triaged = "ai_triaged"
    verification = "verification"
    assigned = "assigned"
    in_progress = "in_progress"
    resolved = "resolved"
    closed = "closed"
    reopened = "reopened"

class User(Base):
    __tablename__ = "users"
    
    user_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100))
    phone = Column(String(20), unique=True)
    email = Column(String(200), unique=True)
    role = Column(String(50), default="citizen") # citizen, moderator, officer, admin
    xp_points = Column(Integer, default=0)
    trust_score = Column(Float, default=1.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    issues = relationship("Issue", back_populates="reporter")

class Issue(Base):
    __tablename__ = "issues"
    
    issue_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    reporter_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"))
    title = Column(String(200))
    description = Column(String)
    issue_type = Column(String(50))
    severity = Column(Enum(SeverityEnum))
    status = Column(Enum(StatusEnum), default=StatusEnum.reported)
    
    # Location
    latitude = Column(Float)
    longitude = Column(Float)
    geometry = Column(Geometry('POINT', srid=4326))
    
    # AI Fields
    ai_confidence = Column(Float)
    ai_summary = Column(String)
    ai_department_recommendation = Column(String(100))
    public_safety_risk = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    reporter = relationship("User", back_populates="issues")
