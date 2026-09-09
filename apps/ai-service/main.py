import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from schemas import TriageRequest, TriageResponse, OcrRequest, OcrResponse
from triage import evaluate_triage
from ocr import extract_document_data

app = FastAPI(
    title="JeevanSetu Clinical AI & OCR Microservice",
    description="Rural healthcare triage, red-flag escalation, and prescription digitizer service.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "service": "JeevanSetu AI & OCR Service",
        "status": "HEALTHY",
        "safety_mode": "HUMAN_IN_THE_LOOP_ENFORCED",
        "autonomous_prescribing": False
    }

@app.get("/health")
def health_check():
    return {"status": "ok", "version": "1.0.0"}

@app.post("/triage", response_model=TriageResponse)
def run_triage(request: TriageRequest):
    if not request.symptoms or len(request.symptoms.strip()) == 0:
        raise HTTPException(status_code=400, detail="Symptoms text cannot be empty.")
    return evaluate_triage(request)

@app.post("/ocr/extract", response_model=OcrResponse)
def run_ocr(request: OcrRequest):
    return extract_document_data(request)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
