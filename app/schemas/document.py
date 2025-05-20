from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# Esquema base para documento
class DocumentBase(BaseModel):
    title: str
    content: Optional[str] = None
    file_type: str
    file_info: Optional[str] = None
    status: Optional[str] = "draft"
    client_name: Optional[str] = None
    document_type: Optional[str] = None
    analysis: Optional[str] = None

# Esquema para criação de documento
class DocumentCreate(DocumentBase):
    user_id: str

# Esquema para atualização de documento
class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    file_type: Optional[str] = None
    file_info: Optional[str] = None
    status: Optional[str] = None
    client_name: Optional[str] = None
    document_type: Optional[str] = None
    analysis: Optional[str] = None

# Esquema para resposta de documento
class Document(DocumentBase):
    id: str
    created_at: datetime
    user_id: str
    created_ago: Optional[str] = None  # Para exibir "há X minutos/horas"

    class Config:
        orm_mode = True
        from_attributes = True

# Esquema para lista de documentos
class DocumentList(BaseModel):
    documents: list[Document]