from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routers.health import router as health_router
from backend.routers.counties import router as counties_router
from backend.routers.income import router as income_router
from backend.routers.housing import router as housing_router
from backend.routers.education import router as education_router
from backend.routers.employment import router as employment_router
from backend.routers.poverty import router as poverty_router
from backend.routers.availability import router as availability_router


app = FastAPI(title="SOTR API")

# --- CORS (React dev server) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(health_router)
app.include_router(counties_router)
app.include_router(income_router)
app.include_router(housing_router)
app.include_router(education_router)
app.include_router(employment_router)
app.include_router(poverty_router)
app.include_router(availability_router)
