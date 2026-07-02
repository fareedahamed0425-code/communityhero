import math
from sqlalchemy.orm import Session
from models.models import Issue, StatusEnum

def haversine(lat1, lon1, lat2, lon2):
    R = 6371000 # radius of earth in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    a = math.sin(delta_phi / 2.0) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * \
        math.sin(delta_lambda / 2.0) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

class DuplicateEngine:
    def __init__(self):
        pass
        
    async def find_duplicates(self, db: Session, latitude: float, longitude: float, issue_type: str, radius_meters: int = 50) -> list:
        if latitude is None or longitude is None:
            return []
            
        # Fetch nearby issues in Python since SQLite doesn't have PostGIS ST_DWithin
        # This is a naive implementation for local development
        all_issues = db.query(Issue).filter(
            Issue.issue_type == issue_type,
            Issue.status.in_([StatusEnum.reported, StatusEnum.ai_triaged, StatusEnum.verification, StatusEnum.assigned, StatusEnum.in_progress])
        ).all()
        
        nearby = []
        for issue in all_issues:
            if issue.latitude is not None and issue.longitude is not None:
                dist = haversine(latitude, longitude, issue.latitude, issue.longitude)
                if dist <= radius_meters:
                    nearby.append(issue)
                    
        return nearby
