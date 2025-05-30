from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta

from app.db.session import get_db
from app.models.user import User
from app.models.deadline import Deadline
from app.models.case import Case
from app.schemas.deadline import DeadlineCreate, DeadlineUpdate, Deadline as DeadlineSchema, DeadlineList
from app.utils.security import get_current_user
from app.utils.logger import logger
from app.api.endpoints.deadlines_service import DeadlineService

router = APIRouter()

@router.get("", response_model=DeadlineList)
async def get_deadlines(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 50,
    case_id: Optional[int] = None,
    pending_only: bool = False,
    days_ahead: Optional[int] = None
):
    """
    Obtém a lista de prazos do usuário atual, com filtros opcionais
    """
    query = db.query(Deadline).filter(Deadline.user_id == current_user.id)
    
    if case_id:
        query = query.filter(Deadline.case_id == case_id)
    
    if pending_only:
        query = query.filter(Deadline.is_completed == False)
    
    if days_ahead:
        future_date = datetime.utcnow() + timedelta(days=days_ahead)
        query = query.filter(Deadline.due_date <= future_date)
        query = query.filter(Deadline.due_date >= datetime.utcnow())
    
    # Ordenar por data de vencimento
    query = query.order_by(Deadline.due_date)
    
    deadlines = query.offset(skip).limit(limit).all()
    return {"deadlines": deadlines}

@router.get("/{deadline_id}", response_model=DeadlineSchema)
async def get_deadline(
    deadline_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obtém um prazo específico por ID
    """
    deadline = db.query(Deadline).filter(Deadline.id == deadline_id).first()
    
    if not deadline:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prazo não encontrado"
        )
    
    # Verificar se o prazo pertence ao usuário atual
    if deadline.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para acessar este prazo"
        )
    
    return deadline

@router.post("", response_model=DeadlineSchema)
async def create_deadline(
    deadline_create: DeadlineCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Cria um novo prazo
    """
    try:
        # Validar os dados recebidos
        if not deadline_create.title or not deadline_create.title.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="O título do prazo é obrigatório"
            )
            
        # Converter o id do caso para inteiro, se fornecido
        case_id = None
        if deadline_create.case_id:
            try:
                case_id = int(deadline_create.case_id)
            except (ValueError, TypeError):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="ID de processo inválido"
                )
        
        # Usar o serviço para criar o prazo com validações
        deadline = DeadlineService.create_deadline(
            db=db,
            user_id=str(current_user.id),
            title=deadline_create.title,
            description=deadline_create.description,
            due_date=deadline_create.due_date,
            case_id=case_id,
            priority=deadline_create.priority or "medium"
        )
        
        logger.info(f"Prazo criado com sucesso: {deadline.id}")
        return deadline
    except HTTPException as e:
        # Repassar exceções HTTP
        logger.warning(f"Erro de validação ao criar prazo: {e.detail}")
        raise e
    except Exception as e:
        # Logar e transformar outras exceções
        logger.error(f"Erro inesperado ao criar prazo: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao salvar o prazo: {str(e)}"
        )

@router.put("/{deadline_id}", response_model=DeadlineSchema)
async def update_deadline(
    deadline_id: int,
    deadline_update: DeadlineUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Atualiza um prazo existente
    """
    deadline = db.query(Deadline).filter(Deadline.id == deadline_id).first()
    
    if not deadline:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prazo não encontrado"
        )
    
    # Verificar se o prazo pertence ao usuário atual
    if deadline.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para editar este prazo"
        )
    
    # Verificar se está alterando o caso, e se o novo caso pertence ao usuário
    if deadline_update.case_id and deadline_update.case_id != deadline.case_id:
        case = db.query(Case).filter(Case.id == deadline_update.case_id).first()
        if not case or case.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Sem permissão para associar a este caso"
            )
    
    # Atualizar campos que foram fornecidos
    update_data = deadline_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(deadline, key, value)
    
    try:
        db.commit()
        db.refresh(deadline)
        return deadline
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao atualizar prazo: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao atualizar o prazo"
        )

@router.put("/{deadline_id}/complete", response_model=DeadlineSchema)
async def complete_deadline(
    deadline_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Marca um prazo como concluído
    """
    deadline = db.query(Deadline).filter(Deadline.id == deadline_id).first()
    
    if not deadline:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prazo não encontrado"
        )
    
    # Verificar se o prazo pertence ao usuário atual
    if deadline.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para editar este prazo"
        )
    
    deadline.is_completed = True
    
    try:
        db.commit()
        db.refresh(deadline)
        return deadline
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao marcar prazo como concluído: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao atualizar o prazo"
        )

@router.delete("/{deadline_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_deadline(
    deadline_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Exclui um prazo
    """
    deadline = db.query(Deadline).filter(Deadline.id == deadline_id).first()
    
    if not deadline:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prazo não encontrado"
        )
    
    # Verificar se o prazo pertence ao usuário atual
    if deadline.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para excluir este prazo"
        )
    
    try:
        db.delete(deadline)
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao excluir prazo: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao excluir o prazo"
        )