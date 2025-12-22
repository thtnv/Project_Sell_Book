from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db, init_db

app = FastAPI(title="Book Shop API")

@app.on_event("startup")
def on_startup():
    init_db()
    print("✅ Database tables created successfully!")
    print("🚀 Server is running on http://127.0.0.1:8000")
    print("📚 API Docs: http://127.0.0.1:8000/docs")

@app.get("/")
def root():
    return {"message": "Book Shop API is running!", "status": "success"}

@app.get("/test-db")
def test_db(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "success", "message": "✅ MySQL connected!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))