from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Esquema base para cliente
class ClientBase(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    document: Optional[str] = None  # CPF/CNPJ
    address: Optional[str] = None
    notes: Optional[str] = None

# Esquema para criação de cliente
class ClientCreate(ClientBase):
    user_id: str

# Esquema para atualização de cliente
class ClientUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    document: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None

# Esquema para resposta de cliente
class Client(ClientBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    user_id: str

    class Config:
        orm_mode = True
        from_attributes = True

# Esquema para lista de clientes
class ClientList(BaseModel):
    clients: list[Client]