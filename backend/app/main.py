from fastapi import FastAPI

app = FastAPI(title="My Advanced Project")

@app.get("/")
def root():
    return {"message": "Server is running!"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}