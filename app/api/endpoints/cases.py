from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any

from app.db.session import get_db
from app.models.user import User
from app.models.case import Case
from app.models.client import Client
from app.schemas.case import CaseCreate, CaseUpdate, Case as CaseSchema, CaseList
from app.utils.security import get_current_user
from app.utils.logger import logger
from app.api.endpoints.cases_service import CaseService

router = APIRouter()

@router.get("", response_model=CaseList)
async def get_cases(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 50,
    client_id: Optional[int] = None
):
    """
    Obtém a lista de casos do usuário atual, com filtro opcional por cliente
    """
    query = db.query(Case).filter(Case.user_id == current_user.id)
    
    if client_id:
        query = query.filter(Case.client_id == client_id)
        
    cases = query.offset(skip).limit(limit).all()
    return {"cases": cases}

@router.get("/{case_id}", response_model=CaseSchema)
async def get_case(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obtém um caso específico por ID
    """
    case = db.query(Case).filter(Case.id == case_id).first()
    
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Caso não encontrado"
        )
    
    # Verificar se o caso pertence ao usuário atual
    if case.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para acessar este caso"
        )
    
    return case

@router.post("", response_model=CaseSchema)
async def create_case(
    case_create: CaseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Cria um novo caso
    """
    # Verificar se o cliente existe e pertence ao usuário atual
    client = db.query(Client).filter(Client.id == case_create.client_id).first()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente não encontrado"
        )
    
    if client.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para criar caso para este cliente"
        )
    
    # Definir o user_id como o ID do usuário atual
    case_data = case_create.dict()
    case_data["user_id"] = current_user.id
    
    case = Case(**case_data)
    
    try:
        db.add(case)
        db.commit()
        db.refresh(case)
        return case
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao criar caso: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao salvar o caso"
        )

@router.put("/{case_id}", response_model=CaseSchema)
async def update_case(
    case_id: int,
    case_update: CaseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Atualiza um caso existente
    """
    case = db.query(Case).filter(Case.id == case_id).first()
    
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Caso não encontrado"
        )
    
    # Verificar se o caso pertence ao usuário atual
    if case.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para editar este caso"
        )
    
    # Verificar se está alterando o cliente, e se o novo cliente pertence ao usuário
    if case_update.client_id and case_update.client_id != case.client_id:
        client = db.query(Client).filter(Client.id == case_update.client_id).first()
        if not client or client.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Sem permissão para associar a este cliente"
            )
    
    # Atualizar campos que foram fornecidos
    update_data = case_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(case, key, value)
    
    try:
        db.commit()
        db.refresh(case)
        return case
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao atualizar caso: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao atualizar o caso"
        )

@router.delete("/{case_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_case(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Exclui um caso
    """
    case = db.query(Case).filter(Case.id == case_id).first()
    
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Caso não encontrado"
        )
    
    # Verificar se o caso pertence ao usuário atual
    if case.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para excluir este caso"
        )
    
    try:
        # Aqui poderia verificar e excluir registros relacionados, como prazos
        db.delete(case)
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao excluir caso: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao excluir o caso"
        )

@router.get("/options", response_model=List[Dict[str, Any]])
async def get_case_options(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obtém opções de processos para uso em seletores e dropdowns
    """
    try:
        options = CaseService.get_case_options(db, current_user.id)
        return options
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Erro ao buscar opções de processos: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao carregar os processos"
        )