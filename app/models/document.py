from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.db.session import Base

class Document(Base):
    """Modelo para documentos jurídicos"""
    __tablename__ = "documents"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, index=True)
    content = Column(Text, nullable=True)
    file_type = Column(String)
    file_info = Column(String, nullable=True)
    status = Column(String, default="draft")
    client_name = Column(String, nullable=True)
    document_type = Column(String, nullable=True)
    analysis = Column(Text, nullable=True)
    created_at = Column(DateTime, default=func.now())
    user_id = Column(String, ForeignKey("users.id"))