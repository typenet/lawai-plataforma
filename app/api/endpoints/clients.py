from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.models.user import User
from app.models.client import Client
from app.schemas.client import ClientCreate, ClientUpdate, Client as ClientSchema, ClientList
from app.utils.security import get_current_user
from app.utils.logger import logger

router = APIRouter()

@router.get("", response_model=ClientList)
async def get_clients(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 50
):
    """
    Obtém a lista de clientes do usuário atual
    """
    clients = db.query(Client).filter(Client.user_id == current_user.id).offset(skip).limit(limit).all()
    return {"clients": clients}

@router.get("/{client_id}", response_model=ClientSchema)
async def get_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obtém um cliente específico por ID
    """
    client = db.query(Client).filter(Client.id == client_id).first()
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente não encontrado"
        )
    
    # Verificar se o cliente pertence ao usuário atual
    if client.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para acessar este cliente"
        )
    
    return client

@router.post("", response_model=ClientSchema)
async def create_client(
    client_create: ClientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Cria um novo cliente
    """
    # Definir o user_id como o ID do usuário atual
    client_data = client_create.dict()
    client_data["user_id"] = current_user.id
    
    client = Client(**client_data)
    
    try:
        db.add(client)
        db.commit()
        db.refresh(client)
        return client
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao criar cliente: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao salvar o cliente"
        )

@router.put("/{client_id}", response_model=ClientSchema)
async def update_client(
    client_id: int,
    client_update: ClientUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Atualiza um cliente existente
    """
    client = db.query(Client).filter(Client.id == client_id).first()
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente não encontrado"
        )
    
    # Verificar se o cliente pertence ao usuário atual
    if client.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para editar este cliente"
        )
    
    # Atualizar campos que foram fornecidos
    update_data = client_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(client, key, value)
    
    try:
        db.commit()
        db.refresh(client)
        return client
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao atualizar cliente: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao atualizar o cliente"
        )

@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Exclui um cliente
    """
    client = db.query(Client).filter(Client.id == client_id).first()
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente não encontrado"
        )
    
    # Verificar se o cliente pertence ao usuário atual
    if client.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para excluir este cliente"
        )
    
    try:
        db.delete(client)
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao excluir cliente: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao excluir o cliente"
        )