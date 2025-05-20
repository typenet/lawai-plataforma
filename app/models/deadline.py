from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func

from app.db.session import Base

class Deadline(Base):
    """Modelo para prazos processuais"""
    __tablename__ = "deadlines"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text, nullable=True)
    due_date = Column(DateTime, index=True)
    priority = Column(String, default="medium")  # low, medium, high
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=True)
    user_id = Column(String, ForeignKey("users.id"))