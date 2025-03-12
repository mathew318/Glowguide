from sqlalchemy import Column, Integer, String, Text
from database import Base

class SkinAnalysis(Base):
    __tablename__ = "skin_analysis"

    id = Column(Integer, primary_key=True, index=True)
    skin_type = Column(String, index=True)
    concerns = Column(Text)
    recommended_products = Column(Text)
