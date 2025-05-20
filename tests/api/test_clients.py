import pytest
from fastapi import status

from app.models.user import User
from app.models.client import Client

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

# Fixture para criar alguns clientes de teste
@pytest.fixture
def test_clients(db_session, test_user):
    clients = []
    
    # Criar alguns clientes de teste
    for i in range(3):
        client = Client(
            name=f"Cliente Teste {i+1}",
            email=f"cliente{i+1}@example.com",
            phone=f"(11) 9999-{i+1}{i+1}{i+1}{i+1}",
            document=f"123.456.789-{i+1}",
            address=f"Rua Teste, {i+1}00, São Paulo/SP",
            notes=f"Observações do cliente {i+1}",
            user_id=test_user.id
        )
        db_session.add(client)
        clients.append(client)
    
    db_session.commit()
    
    # Atualizar os clientes com os IDs gerados
    for client in clients:
        db_session.refresh(client)
    
    return clients

# Testes para endpoint de listagem de clientes
def test_get_clients(client, auth_headers, test_clients):
    """Teste para o endpoint GET /api/clients"""
    
    response = client.get("/api/clients", headers=auth_headers)
    
    assert response.status_code == status.HTTP_200_OK
    
    data = response.json()
    assert "clients" in data
    assert len(data["clients"]) == 3
    
    # Verificar se os clientes retornados têm as propriedades esperadas
    for cli in data["clients"]:
        assert "id" in cli
        assert "name" in cli
        assert "email" in cli
        assert "phone" in cli
        assert "document" in cli
        assert "user_id" in cli

# Teste para endpoint de obter um cliente específico
def test_get_client(client, auth_headers, test_clients):
    """Teste para o endpoint GET /api/clients/{client_id}"""
    
    client_id = test_clients[0].id
    
    response = client.get(f"/api/clients/{client_id}", headers=auth_headers)
    
    assert response.status_code == status.HTTP_200_OK
    
    data = response.json()
    assert data["id"] == client_id
    assert data["name"] == test_clients[0].name
    assert data["email"] == test_clients[0].email
    assert data["phone"] == test_clients[0].phone

# Teste para endpoint de criar um cliente
def test_create_client(client, auth_headers):
    """Teste para o endpoint POST /api/clients"""
    
    client_data = {
        "name": "Novo Cliente de Teste",
        "email": "novo.cliente@example.com",
        "phone": "(11) 98765-4321",
        "document": "987.654.321-00",
        "address": "Avenida Teste, 500, São Paulo/SP",
        "notes": "Observações do novo cliente"
    }
    
    response = client.post(
        "/api/clients",
        headers=auth_headers,
        json=client_data
    )
    
    assert response.status_code == status.HTTP_200_OK
    
    data = response.json()
    assert data["name"] == client_data["name"]
    assert data["email"] == client_data["email"]
    assert data["phone"] == client_data["phone"]
    assert data["document"] == client_data["document"]
    assert data["address"] == client_data["address"]
    assert data["notes"] == client_data["notes"]
    assert "id" in data
    assert "created_at" in data

# Teste para endpoint de atualizar um cliente
def test_update_client(client, auth_headers, test_clients):
    """Teste para o endpoint PUT /api/clients/{client_id}"""
    
    client_id = test_clients[0].id
    
    update_data = {
        "name": "Cliente Atualizado",
        "email": "atualizado@example.com",
        "phone": "(11) 12345-6789",
        "notes": "Observações atualizadas"
    }
    
    response = client.put(
        f"/api/clients/{client_id}",
        headers=auth_headers,
        json=update_data
    )
    
    assert response.status_code == status.HTTP_200_OK
    
    data = response.json()
    assert data["id"] == client_id
    assert data["name"] == update_data["name"]
    assert data["email"] == update_data["email"]
    assert data["phone"] == update_data["phone"]
    assert data["notes"] == update_data["notes"]
    # Campos que não foram atualizados devem manter os valores originais
    assert data["document"] == test_clients[0].document
    assert data["address"] == test_clients[0].address

# Teste para endpoint de excluir um cliente
def test_delete_client(client, auth_headers, test_clients, db_session):
    """Teste para o endpoint DELETE /api/clients/{client_id}"""
    
    client_id = test_clients[0].id
    
    response = client.delete(
        f"/api/clients/{client_id}",
        headers=auth_headers
    )
    
    assert response.status_code == status.HTTP_204_NO_CONTENT
    
    # Verificar se o cliente foi realmente excluído do banco de dados
    db_client = db_session.query(Client).filter(Client.id == client_id).first()
    assert db_client is None

# Teste para tentar acessar um cliente de outro usuário
def test_get_other_user_client(client, db_session, auth_headers):
    """Teste de segurança: tentar acessar cliente de outro usuário"""
    
    # Criar outro usuário
    other_user = User(
        id="other-user-id",
        email="other@example.com",
        first_name="Other",
        last_name="User"
    )
    db_session.add(other_user)
    
    # Criar um cliente para o outro usuário
    other_client = Client(
        name="Cliente de Outro Usuário",
        email="other.client@example.com",
        phone="(11) 1111-1111",
        user_id=other_user.id
    )
    db_session.add(other_client)
    db_session.commit()
    db_session.refresh(other_client)
    
    # Tentar acessar o cliente do outro usuário
    response = client.get(
        f"/api/clients/{other_client.id}",
        headers=auth_headers
    )
    
    # Deve retornar 403 Forbidden ou 404 Not Found
    assert response.status_code in [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND]