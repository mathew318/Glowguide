from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal, init_db
from models import SkinAnalysis
from schemas import SkinAnalysisRequest, SkinAnalysisResponse

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/analyze/", response_model=SkinAnalysisResponse)
def analyze_skin(data: SkinAnalysisRequest, db: Session = Depends(get_db)):
    # Simple logic for recommendation (replace with ML model if needed)
    recommendations = {
        "dry": ["Hydrating Cleanser", "Moisturizing Cream"],
        "oily": ["Oil-Free Cleanser", "Mattifying Moisturizer"],
        "combination": ["Balanced Hydration Serum", "Gentle Cleanser"],
        "sensitive": ["Fragrance-Free Moisturizer", "Soothing Cream"]
    }

    products = recommendations.get(data.skin_type, ["General Skincare"])

    # Save to database
    new_entry = SkinAnalysis(
        skin_type=data.skin_type,
        concerns=",".join(data.concerns),
        recommended_products=",".join(products)
    )
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)

    return SkinAnalysisResponse(
        skin_type=data.skin_type,
        concerns=data.concerns,
        recommended_products=products
    )
