from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.deadline import Deadline
from app.models.case import Case
from app.models.user import User
from app.utils.logger import logger

class DeadlineService:
    """
    Serviço para gerenciar prazos processuais
    """
    
    @staticmethod
    def create_deadline(
        db: Session,
        user_id: str,
        title: str,
        due_date: datetime,
        description: Optional[str] = None,
        case_id: Optional[int] = None,
        priority: str = "medium",
        notification_days: Optional[int] = None
    ) -> Deadline:
        """
        Cria um novo prazo processual
        """
        # Validar se o prazo está no futuro
        if due_date < datetime.utcnow():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A data limite deve ser no futuro"
            )
        
        # Validar o caso, se fornecido
        if case_id:
            case = db.query(Case).filter(Case.id == case_id).first()
            if not case:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Processo não encontrado"
                )
            
            # Verificar se o caso pertence ao usuário
            if case.user_id != user_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Sem permissão para adicionar prazo a este processo"
                )
        
        # Criar o prazo
        try:
            deadline = Deadline(
                title=title,
                description=description,
                due_date=due_date,
                priority=priority,
                is_completed=False,
                case_id=case_id,
                user_id=user_id
            )
            
            db.add(deadline)
            db.commit()
            db.refresh(deadline)
            
            # Adicionar propriedade de notificação, se fornecida
            if notification_days:
                # Aqui você implementaria a lógica para armazenar a configuração de notificação
                # Isso poderia ser em uma tabela separada ou como parte do objeto de prazo
                pass
            
            return deadline
        except Exception as e:
            db.rollback()
            logger.error(f"Erro ao criar prazo: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao salvar o prazo"
            )
    
    @staticmethod
    def get_upcoming_deadlines(
        db: Session, 
        user_id: str, 
        days_ahead: int = 7,
        include_completed: bool = False
    ) -> List[Dict[str, Any]]:
        """
        Obtém os prazos próximos do usuário
        """
        today = datetime.utcnow()
        end_date = today + timedelta(days=days_ahead)
        
        # Construir a consulta
        query = db.query(Deadline).filter(
            Deadline.user_id == user_id,
            Deadline.due_date >= today,
            Deadline.due_date <= end_date
        )
        
        # Filtrar prazos completados, se necessário
        if not include_completed:
            query = query.filter(Deadline.is_completed == False)
        
        # Ordenar por data de vencimento
        query = query.order_by(Deadline.due_date)
        
        # Executar a consulta
        deadlines = query.all()
        
        # Adicionar informações adicionais para cada prazo
        result = []
        for deadline in deadlines:
            # Calcular dias restantes
            remaining_days = (deadline.due_date - today).days
            
            # Obter informações do caso associado, se houver
            case_info = None
            if deadline.case_id:
                case = db.query(Case).filter(Case.id == deadline.case_id).first()
                if case:
                    case_info = {
                        "id": case.id,
                        "title": case.title,
                        "number": case.number
                    }
            
            # Construir o resultado
            deadline_info = {
                "id": deadline.id,
                "title": deadline.title,
                "description": deadline.description,
                "due_date": deadline.due_date,
                "priority": deadline.priority,
                "is_completed": deadline.is_completed,
                "case": case_info,
                "remaining_days": remaining_days,
                "status": "atrasado" if remaining_days < 0 else (
                    "urgente" if remaining_days <= 1 else (
                        "próximo" if remaining_days <= 3 else "agendado"
                    )
                )
            }
            
            result.append(deadline_info)
        
        return result
    
    @staticmethod
    def complete_deadline(db: Session, deadline_id: int, user_id: str) -> Deadline:
        """
        Marca um prazo como concluído
        """
        deadline = db.query(Deadline).filter(Deadline.id == deadline_id).first()
        
        if not deadline:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Prazo não encontrado"
            )
        
        # Verificar se o prazo pertence ao usuário
        if deadline.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Sem permissão para atualizar este prazo"
            )
        
        try:
            deadline.is_completed = True
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
    
    @staticmethod
    def get_deadlines_statistics(db: Session, user_id: str) -> Dict[str, Any]:
        """
        Obtém estatísticas sobre os prazos do usuário
        """
        # Total de prazos
        total_deadlines = db.query(Deadline).filter(Deadline.user_id == user_id).count()
        
        # Prazos pendentes
        pending_deadlines = db.query(Deadline).filter(
            Deadline.user_id == user_id,
            Deadline.is_completed == False
        ).count()
        
        # Prazos concluídos
        completed_deadlines = db.query(Deadline).filter(
            Deadline.user_id == user_id,
            Deadline.is_completed == True
        ).count()
        
        # Prazos vencidos (pendentes e com data no passado)
        today = datetime.utcnow()
        overdue_deadlines = db.query(Deadline).filter(
            Deadline.user_id == user_id,
            Deadline.is_completed == False,
            Deadline.due_date < today
        ).count()
        
        # Prazos para os próximos 7 dias
        next_week = today + timedelta(days=7)
        upcoming_deadlines = db.query(Deadline).filter(
            Deadline.user_id == user_id,
            Deadline.is_completed == False,
            Deadline.due_date >= today,
            Deadline.due_date <= next_week
        ).count()
        
        # Retornar estatísticas
        return {
            "total": total_deadlines,
            "pending": pending_deadlines,
            "completed": completed_deadlines,
            "overdue": overdue_deadlines,
            "upcoming": upcoming_deadlines,
            "completion_rate": round((completed_deadlines / total_deadlines * 100) if total_deadlines > 0 else 0, 2)
        }