from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float
from sqlalchemy.sql import func

from app.db.session import Base

class Case(Base):
    """Modelo para processos/casos jurídicos"""
    __tablename__ = "cases"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    number = Column(String, nullable=True, index=True)  # Número do processo
    type = Column(String, nullable=True)
    court = Column(String, nullable=True)
    status = Column(String, default="ativo")
    value = Column(Float, nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    client_id = Column(Integer, ForeignKey("clients.id"))
    user_id = Column(String, ForeignKey("users.id"))