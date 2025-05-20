from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Esquema base para prazo
class DeadlineBase(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: datetime
    priority: Optional[str] = "medium"  # low, medium, high
    is_completed: Optional[bool] = False
    case_id: Optional[int] = None

# Esquema para criação de prazo
class DeadlineCreate(DeadlineBase):
    user_id: str

# Esquema para atualização de prazo
class DeadlineUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: Optional[str] = None
    is_completed: Optional[bool] = None
    case_id: Optional[int] = None

# Esquema para resposta de prazo
class Deadline(DeadlineBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    user_id: str

    class Config:
        orm_mode = True
        from_attributes = True

# Esquema para lista de prazos
class DeadlineList(BaseModel):
    deadlines: list[Deadline]