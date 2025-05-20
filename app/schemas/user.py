from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

# Esquema base para usuário
class UserBase(BaseModel):
    email: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    profile_image_url: Optional[str] = None

# Esquema para criação de usuário
class UserCreate(UserBase):
    id: str

# Esquema para atualização de usuário
class UserUpdate(UserBase):
    pass

# Esquema para resposta de usuário
class User(UserBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True
        from_attributes = True