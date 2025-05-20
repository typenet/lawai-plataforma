from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.case import Case
from app.models.client import Client
from app.utils.logger import logger

class CaseService:
    """
    Serviço para gerenciar casos/processos jurídicos
    """
    
    @staticmethod
    def get_case_options(db: Session, user_id: str) -> List[Dict[str, Any]]:
        """
        Obtém opções de processos para uso em seletores e dropdowns
        """
        try:
            # Buscar todos os casos do usuário
            cases = db.query(Case).filter(Case.user_id == user_id).all()
            
            # Formatar os resultados para uso em dropdowns
            options = []
            for case in cases:
                # Buscar o cliente associado
                client = None
                if case.client_id:
                    client = db.query(Client).filter(Client.id == case.client_id).first()
                
                # Formatar a opção
                option = {
                    "id": case.id,
                    "label": f"{case.title} ({case.number or 'Sem número'})",
                    "value": str(case.id),
                    "clientName": client.name if client else "Cliente não especificado",
                    "status": case.status
                }
                
                options.append(option)
                
            return options
        except Exception as e:
            logger.error(f"Erro ao buscar opções de processos: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao carregar os processos"
            )
    
    @staticmethod
    def get_cases_stats(db: Session, user_id: str) -> Dict[str, Any]:
        """
        Obtém estatísticas sobre os processos do usuário
        """
        # Total de processos
        total_cases = db.query(Case).filter(Case.user_id == user_id).count()
        
        # Processos por status
        status_counts = {}
        statuses = ["ativo", "arquivado", "concluído", "suspenso"]
        
        for current_status in statuses:
            count = db.query(Case).filter(
                Case.user_id == user_id,
                Case.status == current_status
            ).count()
            status_counts[current_status] = count
        
        # Retornar estatísticas
        return {
            "total": total_cases,
            "byStatus": status_counts
        }