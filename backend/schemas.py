from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID

class IssueBase(BaseModel):
    title: str
    description: Optional[str] = None
    issue_type: str
    severity: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    image_url: Optional[str] = None
    upvotes: int = 0

class DuplicateCheckRequest(BaseModel):
    latitude: float
    longitude: float
    issue_type: str

class IssueCreate(IssueBase):
    user_email: str

class IssueUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[str] = None
    status: Optional[str] = None

class Issue(IssueBase):
    issue_id: UUID
    reporter_id: Optional[UUID] = None
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class UserSync(BaseModel):
    email: str
    name: Optional[str] = None

class UserRoleUpdate(BaseModel):
    role: str

class User(BaseModel):
    user_id: UUID
    name: Optional[str] = None
    email: str
    role: str
    issues: List[Issue] = []

    class Config:
        from_attributes = True
