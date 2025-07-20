# backend/modules/pdfs/services.py
"""
StudySprint 4.0 - PDF Services
Final fixed version without async issues
"""

import os
import hashlib
import shutil
from pathlib import Path
from typing import Optional, List, Dict, Any
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from fastapi import UploadFile, HTTPException, status
import logging

from common.database import PDF, Topic
from .schemas import PDFCreate, PDFUpdate, PDFSearchRequest, PDFResponse, PDFList
import uuid

logger = logging.getLogger(__name__)

class PDFService:
    """Service class for PDF operations"""
    
    def __init__(self, db: Session):
        self.db = db
        self.upload_dir = Path("uploads/pdfs")
        self.thumbnail_dir = Path("uploads/thumbnails")
        self.temp_dir = Path("uploads/temp")
        
        # Create directories if they don't exist
        for directory in [self.upload_dir, self.thumbnail_dir, self.temp_dir]:
            directory.mkdir(parents=True, exist_ok=True)
    
    async def upload_pdf(self, file: UploadFile, pdf_data: PDFCreate) -> PDFResponse:
        """Upload and process a PDF file"""
        
        # Validate file
        self._validate_pdf_file(file)
        
        try:
            # Generate unique filename
            file_extension = Path(file.filename).suffix
            unique_filename = f"{uuid.uuid4()}{file_extension}"
            file_path = self.upload_dir / unique_filename
            
            # Save file to disk
            await self._save_file(file, file_path)
            
            # Basic metadata extraction (simplified for now)
            file_size = file_path.stat().st_size
            content_hash = self._calculate_file_hash(file_path)
            
            # Create PDF record
            pdf = PDF(
                title=pdf_data.title,
                description=pdf_data.description,
                file_name=file.filename,
                file_path=str(file_path),
                topic_id=pdf_data.topic_id,
                pdf_type=pdf_data.pdf_type,
                difficulty_level=pdf_data.difficulty_level,
                parent_pdf_id=pdf_data.parent_pdf_id,
                file_size=file_size,
                total_pages=1,  # Placeholder - will be extracted later
                content_hash=content_hash,
                upload_status="completed",
                processing_status="completed",
                file_metadata={  # Changed from 'metadata' to 'file_metadata'
                    "original_filename": file.filename,
                    "mime_type": file.content_type
                }
            )
            
            self.db.add(pdf)
            self.db.commit()
            self.db.refresh(pdf)
            
            # Update topic statistics (removed await)
            self._update_topic_stats(pdf.topic_id)
            
            logger.info(f"PDF uploaded successfully: {pdf.id}")
            return PDFResponse.from_orm(pdf)
            
        except Exception as e:
            logger.error(f"Error uploading PDF: {str(e)}")
            # Clean up file if it was saved
            if 'file_path' in locals() and file_path and file_path.exists():
                file_path.unlink()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error processing PDF: {str(e)}"
            )
    
    def get_pdf(self, pdf_id: UUID) -> Optional[PDFResponse]:
        """Get a single PDF by ID"""
        pdf = self.db.query(PDF).filter(PDF.id == pdf_id).first()
        if not pdf:
            return None
        return PDFResponse.from_orm(pdf)
    
    def list_pdfs(self, search_request: PDFSearchRequest) -> PDFList:
        """List PDFs with filtering and pagination"""
        query = self.db.query(PDF)
        
        # Apply filters
        if search_request.query:
            search_term = f"%{search_request.query}%"
            query = query.filter(
                or_(
                    PDF.title.ilike(search_term),
                    PDF.description.ilike(search_term),
                    PDF.author.ilike(search_term),
                    PDF.subject.ilike(search_term)
                )
            )
        
        if search_request.topic_id:
            query = query.filter(PDF.topic_id == search_request.topic_id)
        
        if search_request.pdf_type:
            query = query.filter(PDF.pdf_type == search_request.pdf_type)
        
        if search_request.difficulty_level:
            query = query.filter(PDF.difficulty_level == search_request.difficulty_level)
        
        if search_request.is_completed is not None:
            query = query.filter(PDF.is_completed == search_request.is_completed)
        
        # Apply sorting
        sort_column = getattr(PDF, search_request.sort_by, PDF.created_at)
        if search_request.sort_order == "desc":
            query = query.order_by(sort_column.desc())
        else:
            query = query.order_by(sort_column.asc())
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        offset = (search_request.page - 1) * search_request.page_size
        pdfs = query.offset(offset).limit(search_request.page_size).all()
        
        # Calculate total pages
        total_pages = (total + search_request.page_size - 1) // search_request.page_size
        
        return PDFList(
            pdfs=[PDFResponse.from_orm(pdf) for pdf in pdfs],
            total=total,
            page=search_request.page,
            page_size=search_request.page_size,
            total_pages=total_pages
        )
    
    def update_pdf(self, pdf_id: UUID, pdf_update: PDFUpdate) -> Optional[PDFResponse]:
        """Update PDF metadata"""
        pdf = self.db.query(PDF).filter(PDF.id == pdf_id).first()
        if not pdf:
            return None
        
        # Update fields
        update_data = pdf_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(pdf, field, value)
        
        # Update reading progress if current_page changed
        if "current_page" in update_data:
            pdf.update_reading_progress(update_data["current_page"])
        
        self.db.commit()
        self.db.refresh(pdf)
        
        return PDFResponse.from_orm(pdf)
    
    def delete_pdf(self, pdf_id: UUID) -> bool:
        """Delete a PDF and its files"""
        pdf = self.db.query(PDF).filter(PDF.id == pdf_id).first()
        if not pdf:
            return False
        
        try:
            # Delete physical files
            file_path = Path(pdf.file_path)
            if file_path.exists():
                file_path.unlink()
            
            # Delete database record
            self.db.delete(pdf)
            self.db.commit()
            
            # Update topic statistics (removed await)
            if pdf.topic_id:
                self._update_topic_stats(pdf.topic_id)
            
            logger.info(f"PDF deleted successfully: {pdf_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting PDF {pdf_id}: {str(e)}")
            self.db.rollback()
            return False
    
    def search_content(self, query: str, topic_id: Optional[UUID] = None) -> List[Dict[str, Any]]:
        """Search PDF content using title and description"""
        db_query = self.db.query(PDF).filter(
            or_(
                PDF.title.ilike(f"%{query}%"),
                PDF.description.ilike(f"%{query}%")
            )
        )
        
        if topic_id:
            db_query = db_query.filter(PDF.topic_id == topic_id)
        
        results = []
        for pdf in db_query.all():
            results.append({
                "pdf_id": str(pdf.id),
                "title": pdf.title,
                "description": pdf.description,
                "matches": [{"context": pdf.title, "highlighted_text": query}]
            })
        
        return results
    
    # Private helper methods
    
    def _validate_pdf_file(self, file: UploadFile):
        """Validate uploaded PDF file"""
        if not file.content_type == "application/pdf":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File must be a PDF"
            )
        
        # Check file size (500MB limit)
        max_size = 500 * 1024 * 1024
        if hasattr(file, 'size') and file.size > max_size:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="File size too large. Maximum 500MB allowed."
            )
    
    async def _save_file(self, file: UploadFile, file_path: Path):
        """Save uploaded file to disk"""
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    
    def _calculate_file_hash(self, file_path: Path) -> str:
        """Calculate SHA256 hash of file"""
        hash_sha256 = hashlib.sha256()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_sha256.update(chunk)
        return hash_sha256.hexdigest()
    
    def _update_topic_stats(self, topic_id: Optional[UUID]):
        """Update topic statistics after PDF changes (removed async)"""
        if not topic_id:
            return
        
        topic = self.db.query(Topic).filter(Topic.id == topic_id).first()
        if topic:
            # Count PDFs in topic
            pdf_count = self.db.query(PDF).filter(PDF.topic_id == topic_id).count()
            completed_count = self.db.query(PDF).filter(
                and_(PDF.topic_id == topic_id, PDF.is_completed == True)
            ).count()
            
            # Update topic stats
            topic.total_pdfs = pdf_count
            if pdf_count > 0:
                topic.study_progress = (completed_count / pdf_count) * 100
            
            self.db.commit()


class PDFContentService:
    """Service for PDF content operations"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_pdf_content(self, pdf_id: UUID) -> Optional[bytes]:
        """Get PDF file content for serving"""
        pdf = self.db.query(PDF).filter(PDF.id == pdf_id).first()
        if not pdf:
            return None
        
        try:
            with open(pdf.file_path, "rb") as f:
                return f.read()
        except FileNotFoundError:
            logger.error(f"PDF file not found: {pdf.file_path}")
            return None
    
    def get_thumbnail(self, pdf_id: UUID) -> Optional[bytes]:
        """Get PDF thumbnail (placeholder for now)"""
        # For now, return None - thumbnail generation will be implemented later
        return None