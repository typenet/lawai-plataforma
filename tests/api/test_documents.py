import pytest
from fastapi import status
import uuid
from datetime import datetime

from app.models.user import User
from app.models.document import Document

# Fixture para criar um usuário de teste
@pytest.fixture
def test_user(db_session):
    user = User(
        id="test-user-id",
        email="test@example.com",
        first_name="Test",
        last_name="User",
        profile_image_url="https://example.com/avatar.png"
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

# Fixture para criar um token de autenticação para testes
@pytest.fixture
def auth_headers(test_user):
    from app.utils.security import create_access_token
    
    access_token = create_access_token(test_user.id)
    return {"Authorization": f"Bearer {access_token}"}

# Fixture para criar alguns documentos de teste
@pytest.fixture
def test_documents(db_session, test_user):
    documents = []
    
    # Criar alguns documentos de teste
    for i in range(3):
        doc = Document(
            id=str(uuid.uuid4()),
            title=f"Documento Teste {i+1}",
            content=f"Conteúdo do documento de teste {i+1}",
            file_type="text/plain",
            status="draft",
            document_type="Contrato" if i % 2 == 0 else "Petição",
            client_name=f"Cliente Teste {i+1}",
            user_id=test_user.id
        )
        db_session.add(doc)
        documents.append(doc)
    
    db_session.commit()
    
    # Atualizar os documentos com os IDs gerados
    for doc in documents:
        db_session.refresh(doc)
    
    return documents

# Testes para endpoint de listagem de documentos
def test_get_documents(client, auth_headers, test_documents):
    """Teste para o endpoint GET /api/documents"""
    
    response = client.get("/api/documents", headers=auth_headers)
    
    assert response.status_code == status.HTTP_200_OK
    
    data = response.json()
    assert "documents" in data
    assert len(data["documents"]) == 3
    
    # Verificar se os documentos retornados têm as propriedades esperadas
    for doc in data["documents"]:
        assert "id" in doc
        assert "title" in doc
        assert "content" in doc
        assert "file_type" in doc
        assert "status" in doc
        assert "user_id" in doc

# Teste para endpoint de obter um documento específico
def test_get_document(client, auth_headers, test_documents):
    """Teste para o endpoint GET /api/documents/{document_id}"""
    
    document_id = test_documents[0].id
    
    response = client.get(f"/api/documents/{document_id}", headers=auth_headers)
    
    assert response.status_code == status.HTTP_200_OK
    
    data = response.json()
    assert data["id"] == document_id
    assert data["title"] == test_documents[0].title
    assert data["content"] == test_documents[0].content

# Teste para endpoint de criar um documento
def test_create_document(client, auth_headers):
    """Teste para o endpoint POST /api/documents"""
    
    document_data = {
        "title": "Novo Documento de Teste",
        "content": "Conteúdo do novo documento de teste",
        "file_type": "text/plain",
        "status": "draft",
        "document_type": "Contrato",
        "client_name": "Cliente Teste"
    }
    
    response = client.post(
        "/api/documents",
        headers=auth_headers,
        files={"file": ("test.txt", b"content", "text/plain")},
        data=document_data
    )
    
    assert response.status_code == status.HTTP_200_OK
    
    data = response.json()
    assert data["title"] == document_data["title"]
    assert data["content"] == document_data["content"]
    assert data["file_type"] == document_data["file_type"]
    assert data["status"] == document_data["status"]
    assert data["document_type"] == document_data["document_type"]
    assert data["client_name"] == document_data["client_name"]
    assert "id" in data
    assert "created_at" in data

# Teste para endpoint de atualizar um documento
def test_update_document(client, auth_headers, test_documents):
    """Teste para o endpoint PUT /api/documents/{document_id}"""
    
    document_id = test_documents[0].id
    
    update_data = {
        "title": "Documento Atualizado",
        "content": "Conteúdo atualizado do documento",
        "status": "final"
    }
    
    response = client.put(
        f"/api/documents/{document_id}",
        headers=auth_headers,
        json=update_data
    )
    
    assert response.status_code == status.HTTP_200_OK
    
    data = response.json()
    assert data["id"] == document_id
    assert data["title"] == update_data["title"]
    assert data["content"] == update_data["content"]
    assert data["status"] == update_data["status"]
    # Campos que não foram atualizados devem manter os valores originais
    assert data["document_type"] == test_documents[0].document_type
    assert data["client_name"] == test_documents[0].client_name

# Teste para endpoint de excluir um documento
def test_delete_document(client, auth_headers, test_documents, db_session):
    """Teste para o endpoint DELETE /api/documents/{document_id}"""
    
    document_id = test_documents[0].id
    
    response = client.delete(
        f"/api/documents/{document_id}",
        headers=auth_headers
    )
    
    assert response.status_code == status.HTTP_204_NO_CONTENT
    
    # Verificar se o documento foi realmente excluído do banco de dados
    document = db_session.query(Document).filter(Document.id == document_id).first()
    assert document is None

# Teste para tentar acessar um documento de outro usuário
def test_get_other_user_document(client, db_session, auth_headers):
    """Teste de segurança: tentar acessar documento de outro usuário"""
    
    # Criar outro usuário
    other_user = User(
        id="other-user-id",
        email="other@example.com",
        first_name="Other",
        last_name="User"
    )
    db_session.add(other_user)
    
    # Criar um documento para o outro usuário
    other_doc = Document(
        id=str(uuid.uuid4()),
        title="Documento de Outro Usuário",
        content="Conteúdo do documento de outro usuário",
        file_type="text/plain",
        status="draft",
        user_id=other_user.id
    )
    db_session.add(other_doc)
    db_session.commit()
    db_session.refresh(other_doc)
    
    # Tentar acessar o documento do outro usuário
    response = client.get(
        f"/api/documents/{other_doc.id}",
        headers=auth_headers
    )
    
    # Deve retornar 403 Forbidden ou 404 Not Found
    assert response.status_code in [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND]