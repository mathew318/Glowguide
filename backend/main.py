from fastapi import FastAPI
from database import init_db
from fastapi.middleware.cors import CORSMiddleware
from routes import skin_analysis



app = FastAPI()

# Enable CORS (for frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Database
init_db()

# Include Routes
app.include_router(skin_analysis.router)

@app.get("/")
def home():
    return {"message": "Backend is running!"}
