# backend/modules/pdfs/routes.py
"""
StudySprint 4.0 - PDF API Routes
FastAPI routes for PDF management operations
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query, Response, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Optional, List
from uuid import UUID
import io

from common.database import get_db
from .services import PDFService, PDFContentService
from .schemas import (
    PDFCreate, PDFUpdate, PDFResponse, PDFList, PDFSearchRequest,
    PDFUploadResponse, PDFType
)

router = APIRouter()

# Dependencies
def get_pdf_service(db: Session = Depends(get_db)) -> PDFService:
    return PDFService(db)

def get_content_service(db: Session = Depends(get_db)) -> PDFContentService:
    return PDFContentService(db)

@router.post("/upload", response_model=PDFUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_pdf(
    file: UploadFile = File(...),
    title: str = Form(...),
    description: Optional[str] = Form(None),
    topic_id: Optional[UUID] = Form(None),
    pdf_type: PDFType = Form(PDFType.STUDY),
    difficulty_level: int = Form(1),
    parent_pdf_id: Optional[UUID] = Form(None),
    pdf_service: PDFService = Depends(get_pdf_service)
):
    """Upload a new PDF file"""
    try:
        pdf_data = PDFCreate(
            title=title,
            description=description,
            topic_id=topic_id,
            pdf_type=pdf_type,
            difficulty_level=difficulty_level,
            parent_pdf_id=parent_pdf_id
        )
        
        result = await pdf_service.upload_pdf(file, pdf_data)
        
        return PDFUploadResponse(
            pdf_id=result.id,
            message="PDF uploaded successfully",
            upload_status="completed",
            processing_status="completed"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Upload failed: {str(e)}"
        )

@router.get("/", response_model=PDFList)
async def list_pdfs(
    query: Optional[str] = Query(None, description="Search term"),
    topic_id: Optional[UUID] = Query(None, description="Filter by topic ID"),
    pdf_type: Optional[PDFType] = Query(None, description="Filter by PDF type"),
    difficulty_level: Optional[int] = Query(None, ge=1, le=5, description="Filter by difficulty level"),
    is_completed: Optional[bool] = Query(None, description="Filter by completion status"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    pdf_service: PDFService = Depends(get_pdf_service)
):
    """List PDFs with filtering, sorting, and pagination"""
    search_request = PDFSearchRequest(
        query=query,
        topic_id=topic_id,
        pdf_type=pdf_type,
        difficulty_level=difficulty_level,
        is_completed=is_completed,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_order=sort_order
    )
    
    return pdf_service.list_pdfs(search_request)

@router.get("/{pdf_id}", response_model=PDFResponse)
async def get_pdf(
    pdf_id: UUID,
    pdf_service: PDFService = Depends(get_pdf_service)
):
    """Get a specific PDF by ID"""
    pdf = pdf_service.get_pdf(pdf_id)
    if not pdf:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="PDF not found"
        )
    return pdf

@router.put("/{pdf_id}", response_model=PDFResponse)
async def update_pdf(
    pdf_id: UUID,
    pdf_update: PDFUpdate,
    pdf_service: PDFService = Depends(get_pdf_service)
):
    """Update PDF metadata"""
    pdf = pdf_service.update_pdf(pdf_id, pdf_update)
    if not pdf:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="PDF not found"
        )
    return pdf

@router.delete("/{pdf_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_pdf(
    pdf_id: UUID,
    pdf_service: PDFService = Depends(get_pdf_service)
):
    """Delete a PDF and its associated files"""
    success = pdf_service.delete_pdf(pdf_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="PDF not found"
        )

@router.get("/{pdf_id}/content")
async def get_pdf_content(
    pdf_id: UUID,
    content_service: PDFContentService = Depends(get_content_service)
):
    """Serve PDF file content"""
    content = content_service.get_pdf_content(pdf_id)
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="PDF file not found"
        )
    
    return StreamingResponse(
        io.BytesIO(content),
        media_type="application/pdf",
        headers={"Content-Disposition": "inline"}
    )

@router.get("/search/content")
async def search_pdf_content(
    query: str = Query(..., description="Search term"),
    topic_id: Optional[UUID] = Query(None, description="Optional topic filter"),
    pdf_service: PDFService = Depends(get_pdf_service)
):
    """Search across PDF content"""
    if len(query.strip()) < 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Search query must be at least 3 characters"
        )
    
    results = pdf_service.search_content(query, topic_id)
    return {
        "query": query,
        "results": results,
        "total_matches": len(results)
    }