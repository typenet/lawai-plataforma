from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
from datetime import datetime

from app.db.session import get_db
from app.models.user import User
from app.models.document import Document
from app.schemas.document import DocumentCreate, DocumentUpdate, Document as DocumentSchema, DocumentList
from app.utils.security import get_current_user
from app.utils.logger import logger

router = APIRouter()

@router.get("", response_model=DocumentList)
async def get_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = 50
):
    """
    Obtém a lista de documentos do usuário atual
    """
    documents = db.query(Document).filter(Document.user_id == current_user.id).limit(limit).all()
    
    # Calcular o tempo relativo para cada documento (ex: "há 5 minutos")
    for doc in documents:
        doc.created_ago = format_relative_time(doc.created_at)
    
    return {"documents": documents}

@router.get("/{document_id}", response_model=DocumentSchema)
async def get_document(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obtém um documento específico por ID
    """
    document = db.query(Document).filter(Document.id == document_id).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Documento não encontrado"
        )
    
    # Verificar se o documento pertence ao usuário atual
    if document.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para acessar este documento"
        )
    
    document.created_ago = format_relative_time(document.created_at)
    
    return document

@router.post("", response_model=DocumentSchema)
async def create_document(
    title: str = Form(...),
    content: Optional[str] = Form(None),
    file_type: str = Form(...),
    status: str = Form("draft"),
    document_type: Optional[str] = Form(None),
    client_name: Optional[str] = Form(None),
    analysis: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Cria um novo documento
    """
    # Gerar ID único para o documento
    document_id = str(uuid.uuid4())
    
    # Processar o arquivo, se fornecido
    file_info = None
    if file:
        file_content = await file.read()
        # Em uma implementação real, salvaria o arquivo em storage e guardaria a referência
        file_info = {
            "filename": file.filename,
            "size": len(file_content),
            "content_type": file.content_type
        }
        
        # Se não houver conteúdo de texto, poderia usar OCR ou outro método para extrair
        if not content and file.content_type.startswith("text/"):
            content = file_content.decode("utf-8")
    
    # Criar objeto documento
    document_data = {
        "id": document_id,
        "title": title,
        "content": content,
        "file_type": file_type,
        "file_info": str(file_info) if file_info else None,
        "status": status,
        "document_type": document_type,
        "client_name": client_name,
        "analysis": analysis,
        "user_id": current_user.id
    }
    
    document = Document(**document_data)
    
    try:
        db.add(document)
        db.commit()
        db.refresh(document)
        document.created_ago = format_relative_time(document.created_at)
        return document
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao criar documento: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao salvar o documento"
        )

@router.put("/{document_id}", response_model=DocumentSchema)
async def update_document(
    document_id: str,
    document_update: DocumentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Atualiza um documento existente
    """
    document = db.query(Document).filter(Document.id == document_id).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Documento não encontrado"
        )
    
    # Verificar se o documento pertence ao usuário atual
    if document.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para editar este documento"
        )
    
    # Atualizar campos que foram fornecidos
    update_data = document_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(document, key, value)
    
    try:
        db.commit()
        db.refresh(document)
        document.created_ago = format_relative_time(document.created_at)
        return document
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao atualizar documento: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao atualizar o documento"
        )

@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Exclui um documento
    """
    document = db.query(Document).filter(Document.id == document_id).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Documento não encontrado"
        )
    
    # Verificar se o documento pertence ao usuário atual
    if document.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para excluir este documento"
        )
    
    try:
        db.delete(document)
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao excluir documento: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao excluir o documento"
        )

def format_relative_time(date: datetime) -> str:
    """
    Formata a data em um formato relativo (ex: "há 5 minutos")
    """
    now = datetime.utcnow()
    diff = now - date
    
    seconds = diff.total_seconds()
    
    if seconds < 60:
        return "agora mesmo"
    elif seconds < 3600:
        minutes = int(seconds / 60)
        return f"há {minutes} {'minuto' if minutes == 1 else 'minutos'}"
    elif seconds < 86400:
        hours = int(seconds / 3600)
        return f"há {hours} {'hora' if hours == 1 else 'horas'}"
    elif seconds < 604800:
        days = int(seconds / 86400)
        return f"há {days} {'dia' if days == 1 else 'dias'}"
    elif seconds < 2592000:
        weeks = int(seconds / 604800)
        return f"há {weeks} {'semana' if weeks == 1 else 'semanas'}"
    elif seconds < 31536000:
        months = int(seconds / 2592000)
        return f"há {months} {'mês' if months == 1 else 'meses'}"
    else:
        years = int(seconds / 31536000)
        return f"há {years} {'ano' if years == 1 else 'anos'}"