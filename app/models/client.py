from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.db.session import Base

class Client(Base):
    """Modelo para clientes do advogado"""
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    document = Column(String, nullable=True)  # CPF/CNPJ
    address = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    user_id = Column(String, ForeignKey("users.id"))