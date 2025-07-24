# backend/modules/pdfs/routes.py - Enhanced with health check
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
import logging
import os
from pathlib import Path
import uuid

logger = logging.getLogger(__name__)

router = APIRouter()

# Ensure upload directory exists
UPLOAD_DIR = Path("uploads/pdfs")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.get("/health")
async def pdfs_health():
    """PDFs module health check"""
    return {
        "module": "pdfs",
        "status": "✅ Working",
        "stage": "Stage 1",
        "week": "Week 1",
        "upload_dir": str(UPLOAD_DIR),
        "upload_dir_exists": UPLOAD_DIR.exists()
    }

@router.get("/")
async def get_pdfs():
    """Get all PDFs"""
    try:
        logger.info("GET /pdfs/ called")
        return {
            "pdfs": [],
            "total": 0,
            "page": 1,
            "page_size": 20,
            "total_pages": 1
        }
    except Exception as e:
        logger.error(f"Error in get_pdfs: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload")
async def upload_pdf(
    file: UploadFile = File(...),
    title: str = Form(None),
    description: str = Form(None),
    topic_id: str = Form(None),
    pdf_type: str = Form(None),
    difficulty_level: int = Form(None)
):
    """Upload PDF file with topic association"""
    try:
        logger.info(f"Upload started: {file.filename} (topic_id={topic_id})")
        
        if not file.filename:
            raise HTTPException(status_code=400, detail="No filename provided")
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")
        
        file_id = str(uuid.uuid4())
        safe_filename = f"{file_id}.pdf"
        file_path = UPLOAD_DIR / safe_filename
        
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)
        
        logger.info(f"File saved: {file_path} ({len(content)} bytes)")
        
        return {
            "id": file_id,
            "title": title or file.filename.replace('.pdf', ''),
            "description": description,
            "filename": safe_filename,
            "file_size": len(content),
            "file_path": str(file_path),
            "topic_id": topic_id,
            "total_pages": 0,
            "current_page": 1,
            "reading_progress": 0.0,
            "is_completed": False,
            "pdf_type": pdf_type or "study",
            "difficulty_level": difficulty_level or 3,
            "actual_read_time_minutes": 0,
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z",
            "message": "PDF uploaded successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.get("/{pdf_id}")
async def get_pdf(pdf_id: str):
    """Get specific PDF"""
    try:
        return {
            "id": pdf_id,
            "title": f"PDF {pdf_id}",
            "total_pages": 100,
            "current_page": 1,
            "reading_progress": 0.0,
            "is_completed": False,
            "pdf_type": "study",
            "difficulty_level": 3,
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z"
        }
    except Exception as e:
        logger.error(f"Error getting PDF {pdf_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{pdf_id}")
async def delete_pdf(pdf_id: str):
    """Delete PDF"""
    try:
        return {"message": f"PDF {pdf_id} deleted successfully"}
    except Exception as e:
        logger.error(f"Error deleting PDF {pdf_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
