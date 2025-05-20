from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Esquema base para caso
class CaseBase(BaseModel):
    title: str
    number: Optional[str] = None
    type: Optional[str] = None
    court: Optional[str] = None
    status: Optional[str] = "ativo"
    value: Optional[float] = None
    description: Optional[str] = None
    client_id: int

# Esquema para criação de caso
class CaseCreate(CaseBase):
    user_id: str

# Esquema para atualização de caso
class CaseUpdate(BaseModel):
    title: Optional[str] = None
    number: Optional[str] = None
    type: Optional[str] = None
    court: Optional[str] = None
    status: Optional[str] = None
    value: Optional[float] = None
    description: Optional[str] = None
    client_id: Optional[int] = None

# Esquema para resposta de caso
class Case(CaseBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    user_id: str

    class Config:
        orm_mode = True
        from_attributes = True

# Esquema para lista de casos
class CaseList(BaseModel):
    cases: list[Case]