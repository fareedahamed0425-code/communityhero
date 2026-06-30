from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models.database import get_db
from models.models import User, Issue
import schemas
from typing import List
from uuid import UUID

router = APIRouter()

@router.post("/users/sync", response_model=schemas.User)
def sync_user(user: schemas.UserSync, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user:
        db_user = User(email=user.email, name=user.name)
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
    return db_user

@router.get("/users", response_model=List[schemas.User])
def get_users(db: Session = Depends(get_db)):
    return db.query(User).all()

@router.put("/users/{user_id}/role", response_model=schemas.User)
def update_user_role(user_id: UUID, role_update: schemas.UserRoleUpdate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.user_id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db_user.role = role_update.role
    db.commit()
    db.refresh(db_user)
    return db_user

@router.delete("/users/{user_id}")
def delete_user(user_id: UUID, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.user_id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(db_user)
    db.commit()
    return {"message": "User deleted successfully"}

@router.post("/issues", response_model=schemas.Issue)
def create_issue(issue: schemas.IssueCreate, db: Session = Depends(get_db)):
    # Find user
    db_user = db.query(User).filter(User.email == issue.user_email).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found. Please sync user first.")
    
    db_issue = Issue(
        reporter_id=db_user.user_id,
        title=issue.title,
        description=issue.description,
        issue_type=issue.issue_type,
        severity=issue.severity,
        latitude=issue.latitude,
        longitude=issue.longitude,
        image_url=issue.image_url,
    )
    db.add(db_issue)
    db.commit()
    db.refresh(db_issue)
    return db_issue

@router.get("/issues", response_model=List[schemas.Issue])
def get_issues(db: Session = Depends(get_db)):
    return db.query(Issue).all()

@router.put("/issues/{issue_id}", response_model=schemas.Issue)
def update_issue(issue_id: UUID, issue_update: schemas.IssueUpdate, db: Session = Depends(get_db)):
    db_issue = db.query(Issue).filter(Issue.issue_id == issue_id).first()
    if not db_issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    
    update_data = issue_update.model_dump(exclude_unset=True) # Pydantic V2
    for key, value in update_data.items():
        setattr(db_issue, key, value)
    
    db.commit()
    db.refresh(db_issue)
    return db_issue

@router.delete("/issues/{issue_id}")
def delete_issue(issue_id: UUID, db: Session = Depends(get_db)):
    db_issue = db.query(Issue).filter(Issue.issue_id == issue_id).first()
    if not db_issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    
    db.delete(db_issue)
    db.commit()
    return {"message": "Issue deleted successfully"}
