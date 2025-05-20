import pytest
from fastapi import status
import json
from unittest.mock import patch, AsyncMock

from app.models.user import User
from app.services.ai_service import deepseek_service

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

# Teste para análise de documento com mocking da API DeepSeek
@pytest.mark.asyncio
@patch.object(deepseek_service, 'analyze_document')
async def test_analyze_document(mock_analyze_document, client, auth_headers):
    """Teste para o endpoint POST /api/ai/analyze-document"""
    
    # Configurar a função mock para retornar um resultado específico
    mock_result = {
        "success": True,
        "analysis": "# Análise do Documento\n\n## Resumo geral\nEste é um contrato de prestação de serviços jurídicos.\n\n## Pontos principais\n- O contrato estabelece um relacionamento de consultoria jurídica\n- O prazo de vigência é de 12 meses\n- Valor mensal de R$ 5.000,00\n\n## Potenciais problemas\n- Ausência de cláusula específica sobre confidencialidade\n- Falta de detalhamento sobre o escopo dos serviços\n\n## Recomendações\n- Inserir cláusula de confidencialidade\n- Detalhar melhor o escopo dos serviços"
    }
    mock_analyze_document.return_value = mock_result
    
    # Dados para o teste
    document_data = {
        "document_text": "CONTRATO DE PRESTAÇÃO DE SERVIÇOS JURÍDICOS\n\nPelo presente instrumento...",
        "document_type": "Contrato"
    }
    
    # Fazer a requisição
    response = client.post(
        "/api/ai/analyze-document",
        headers=auth_headers,
        json=document_data
    )
    
    # Verificar o resultado
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == mock_result
    
    # Verificar se a função mock foi chamada com os parâmetros corretos
    mock_analyze_document.assert_called_once_with(
        document_data["document_text"],
        document_data["document_type"]
    )

# Teste para pesquisa jurídica com mocking da API DeepSeek
@pytest.mark.asyncio
@patch.object(deepseek_service, 'legal_search')
async def test_legal_search(mock_legal_search, client, auth_headers):
    """Teste para o endpoint POST /api/ai/legal-search"""
    
    # Configurar a função mock para retornar um resultado específico
    mock_result = {
        "success": True,
        "result": "# Resultados da pesquisa sobre LGPD\n\n## Resposta direta\nA Lei Geral de Proteção de Dados (LGPD) é a legislação brasileira que regula as atividades de tratamento de dados pessoais.\n\n## Fundamentos jurídicos\nA LGPD estabelece regras sobre coleta, armazenamento, tratamento e compartilhamento de dados pessoais, impondo mais proteção e penalidades para o não cumprimento.\n\n## Legislação aplicável\n- Lei nº 13.709/2018 (LGPD)\n- Decreto nº 10.474/2020 (Estrutura da ANPD)\n\n## Jurisprudência relevante\n- REsp 1758799/MG (STJ) - Responsabilidade por vazamento de dados\n\n## Recomendações práticas\n- Elaborar política de privacidade\n- Mapear dados pessoais tratados\n- Nomear Encarregado de Proteção de Dados (DPO)"
    }
    mock_legal_search.return_value = mock_result
    
    # Dados para o teste
    search_data = {
        "query": "O que é a LGPD e quais suas principais implicações?",
        "context": "Escritório de advocacia buscando compliance"
    }
    
    # Fazer a requisição
    response = client.post(
        "/api/ai/legal-search",
        headers=auth_headers,
        json=search_data
    )
    
    # Verificar o resultado
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == mock_result
    
    # Verificar se a função mock foi chamada com os parâmetros corretos
    mock_legal_search.assert_called_once_with(
        search_data["query"],
        search_data["context"]
    )

# Teste para geração de documento com mocking da API DeepSeek
@pytest.mark.asyncio
@patch.object(deepseek_service, 'generate_document')
async def test_generate_document(mock_generate_document, client, auth_headers):
    """Teste para o endpoint POST /api/ai/generate-document"""
    
    # Configurar a função mock para retornar um resultado específico
    mock_result = {
        "success": True,
        "document": "PROCURAÇÃO AD JUDICIA ET EXTRA\n\nOUTORGANTE: João da Silva, brasileiro, casado, advogado, portador da cédula de identidade RG nº 12345678-9, inscrito no CPF/MF sob o nº 123.456.789-10, residente e domiciliado na Rua das Flores, 123, São Paulo/SP.\n\nOUTORGADO: Maria Oliveira, brasileira, solteira, advogada, inscrita na OAB/SP sob o nº 98765, com escritório profissional na Avenida Paulista, 1000, São Paulo/SP.\n\nPODERES: Por este instrumento particular de procuração, o outorgante nomeia e constitui sua bastante procuradora a outorgada acima qualificada, a quem confere amplos poderes para o foro em geral, com a cláusula \"ad judicia et extra\", em qualquer Juízo, Instância ou Tribunal, podendo propor contra quem de direito as ações competentes e defendê-lo nas contrárias, seguindo umas e outras, até final decisão, usando os recursos legais e acompanhando-os, conferindo-lhe, ainda, poderes especiais para confessar, desistir, transigir, firmar compromissos ou acordos, receber e dar quitação, agindo em conjunto ou separadamente, podendo ainda substabelecer esta com ou sem reservas de poderes, dando tudo por bom, firme e valioso, especialmente para representação em processo de inventário.\n\nSão Paulo, 20 de maio de 2025.\n\n_______________________________________\nJoão da Silva"
    }
    mock_generate_document.return_value = mock_result
    
    # Dados para o teste
    document_data = {
        "document_type": "Procuração",
        "parameters": {
            "outorgante": "João da Silva",
            "outorgante_nacionalidade": "brasileiro",
            "outorgante_estado_civil": "casado",
            "outorgante_profissao": "advogado",
            "outorgante_rg": "12345678-9",
            "outorgante_cpf": "123.456.789-10",
            "outorgante_endereco": "Rua das Flores, 123, São Paulo/SP",
            "outorgado": "Maria Oliveira",
            "outorgado_nacionalidade": "brasileira",
            "outorgado_estado_civil": "solteira",
            "outorgado_profissao": "advogada",
            "outorgado_oab": "98765",
            "outorgado_endereco": "Avenida Paulista, 1000, São Paulo/SP",
            "finalidade": "representação em processo de inventário"
        }
    }
    
    # Fazer a requisição
    response = client.post(
        "/api/ai/generate-document",
        headers=auth_headers,
        json=document_data
    )
    
    # Verificar o resultado
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == mock_result
    
    # Verificar se a função mock foi chamada com os parâmetros corretos
    mock_generate_document.assert_called_once_with(
        document_data["document_type"],
        document_data["parameters"]
    )

# Teste para o endpoint que responde perguntas jurídicas específicas (LGPD)
def test_answer_legal_questions_lgpd(client, auth_headers):
    """Teste para o endpoint POST /api/ai/answer-legal-questions (LGPD)"""
    
    # Dados para o teste
    question_data = {
        "question": "Quais são as principais disposições da LGPD?"
    }
    
    # Fazer a requisição
    response = client.post(
        "/api/ai/answer-legal-questions",
        headers=auth_headers,
        json=question_data
    )
    
    # Verificar o resultado
    assert response.status_code == status.HTTP_200_OK
    result = response.json()
    assert result["success"] is True
    # Verificar se a resposta contém informações sobre a LGPD
    assert "LGPD" in result["result"]
    assert "Lei Geral de Proteção de Dados" in result["result"]

# Teste para o endpoint que responde perguntas jurídicas específicas (CDC)
def test_answer_legal_questions_cdc(client, auth_headers):
    """Teste para o endpoint POST /api/ai/answer-legal-questions (CDC)"""
    
    # Dados para o teste
    question_data = {
        "question": "Explique sobre o Código de Defesa do Consumidor"
    }
    
    # Fazer a requisição
    response = client.post(
        "/api/ai/answer-legal-questions",
        headers=auth_headers,
        json=question_data
    )
    
    # Verificar o resultado
    assert response.status_code == status.HTTP_200_OK
    result = response.json()
    assert result["success"] is True
    # Verificar se a resposta contém informações sobre o CDC
    assert "CDC" in result["result"] or "Código de Defesa do Consumidor" in result["result"]

# Teste para verificar a conexão com os serviços de IA
@pytest.mark.asyncio
@patch.object(deepseek_service, 'test_connection')
async def test_test_connection(mock_test_connection, client, auth_headers):
    """Teste para o endpoint GET /api/ai/test-connection"""
    
    # Configurar a função mock para retornar um resultado específico
    mock_result = {
        "deepseek_connected": True,
        "any_service_connected": True
    }
    mock_test_connection.return_value = mock_result
    
    # Fazer a requisição
    response = client.get(
        "/api/ai/test-connection",
        headers=auth_headers
    )
    
    # Verificar o resultado
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == mock_result