from pydantic import BaseModel
from typing import List, Optional

class SkinAnalysisRequest(BaseModel):
    skin_type: str
    concerns: List[str]

class SkinAnalysisResponse(BaseModel):
    skin_type: str
    concerns: List[str]
    recommended_products: List[str]
