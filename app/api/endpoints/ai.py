from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
from datetime import datetime
import uuid

from app.db.session import get_db
from app.models.user import User
from app.utils.security import get_current_user
from app.services.ai_service import analyze_document, legal_search, generate_document, test_connection
from app.utils.logger import logger

router = APIRouter()

@router.post("/analyze-document")
async def api_analyze_document(
    data: Dict[str, Any] = Body(...),
    current_user: User = Depends(get_current_user)
):
    """
    Analisa um documento jurídico usando IA
    """
    document_text = data.get("document_text")
    document_type = data.get("document_type", "documento jurídico")
    
    if not document_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Texto do documento é obrigatório"
        )
    
    result = await analyze_document(document_text, document_type)
    return result

@router.post("/legal-search")
async def api_legal_search(
    data: Dict[str, Any] = Body(...),
    current_user: User = Depends(get_current_user)
):
    """
    Realiza uma pesquisa jurídica usando IA
    """
    query = data.get("query")
    context = data.get("context")
    
    if not query:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Query de pesquisa é obrigatória"
        )
    
    result = await legal_search(query, context)
    return result

@router.post("/generate-document")
async def api_generate_document(
    data: Dict[str, Any] = Body(...),
    current_user: User = Depends(get_current_user)
):
    """
    Gera um documento jurídico usando IA
    """
    document_type = data.get("document_type")
    parameters = data.get("parameters", {})
    
    if not document_type:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tipo de documento é obrigatório"
        )
    
    result = await generate_document(document_type, parameters)
    return result

@router.get("/test-connection")
async def api_test_connection(
    current_user: User = Depends(get_current_user)
):
    """
    Testa a conexão com os serviços de IA
    """
    result = await test_connection()
    return result

@router.post("/answer-legal-questions")
async def answer_legal_questions(
    data: Dict[str, Any] = Body(...),
    current_user: User = Depends(get_current_user)
):
    """
    Responde a perguntas jurídicas específicas usando respostas predefinidas
    ou IA quando necessário
    """
    question = data.get("question", "").lower()
    
    # Verificar se a pergunta é sobre um tópico conhecido
    if "lgpd" in question or "proteção de dados" in question:
        return responder_sobre_lgpd()
    elif "cdc" in question or "código de defesa do consumidor" in question:
        return responder_sobre_cdc()
    else:
        # Para perguntas não conhecidas, usar a pesquisa jurídica
        return await legal_search(question)

def responder_sobre_lgpd():
    """Fornece informações sobre a LGPD"""
    return {
        "success": True,
        "result": """
# Lei Geral de Proteção de Dados (LGPD) - Lei 13.709/2018

A Lei Geral de Proteção de Dados Pessoais (LGPD) estabelece regras sobre coleta, armazenamento, tratamento e compartilhamento de dados pessoais, impondo mais proteção e penalidades para o não cumprimento.

## Principais aspectos:

### 1. Aplicação
- Aplica-se a qualquer operação de tratamento de dados realizada por pessoa física ou jurídica, em meios físicos ou digitais.
- Aplica-se a dados tratados no território nacional ou que tenham por objetivo oferecer produtos/serviços no Brasil.

### 2. Princípios fundamentais
- Finalidade: propósitos específicos para o tratamento
- Adequação: compatibilidade com as finalidades
- Necessidade: limitação ao mínimo necessário
- Transparência: informações claras sobre o tratamento
- Segurança: medidas técnicas e administrativas de proteção

### 3. Bases legais para tratamento
- Consentimento do titular
- Cumprimento de obrigação legal
- Execução de contrato
- Legítimo interesse do controlador
- Proteção ao crédito
- Exercício regular de direitos
- Proteção da vida ou integridade física
- Tutela da saúde
- Interesses legítimos do controlador
- Estudos por órgão de pesquisa
- Execução de políticas públicas

### 4. Direitos dos titulares
- Acesso aos dados
- Correção de dados incompletos, inexatos ou desatualizados
- Revogação do consentimento
- Eliminação dos dados
- Portabilidade de dados
- Informação sobre compartilhamento
- Informação sobre não consentimento

### 5. Sanções por descumprimento
- Advertência
- Multa de até 2% do faturamento (limitada a R$ 50 milhões)
- Bloqueio ou eliminação dos dados pessoais
- Suspensão parcial ou total do funcionamento do banco de dados

Para conformidade com a LGPD, empresas devem implementar:
- Mapeamento de dados pessoais
- Revisão de políticas de privacidade
- Implementação de medidas de segurança
- Atendimento aos direitos dos titulares
- Manutenção de registros de operações de tratamento
- Relatórios de impacto à proteção de dados
- Indicação de um Encarregado pelo Tratamento de Dados Pessoais (DPO)
        """
    }

def responder_sobre_cdc():
    """Fornece informações sobre o CDC"""
    return {
        "success": True,
        "result": """
# Código de Defesa do Consumidor (CDC) - Lei 8.078/1990

O Código de Defesa do Consumidor é a legislação brasileira que estabelece normas de proteção e defesa do consumidor, de ordem pública e interesse social.

## Principais aspectos:

### 1. Conceitos Fundamentais
- **Consumidor**: Toda pessoa física ou jurídica que adquire ou utiliza produto ou serviço como destinatário final.
- **Fornecedor**: Toda pessoa física ou jurídica, pública ou privada, que desenvolve atividades de produção, montagem, criação, construção, transformação, importação, exportação, distribuição ou comercialização de produtos ou prestação de serviços.
- **Produto**: Qualquer bem, móvel ou imóvel, material ou imaterial.
- **Serviço**: Qualquer atividade fornecida no mercado de consumo, mediante remuneração.

### 2. Direitos Básicos do Consumidor
- Proteção da vida, saúde e segurança
- Educação para o consumo adequado
- Informação adequada e clara sobre produtos e serviços
- Proteção contra publicidade enganosa e abusiva
- Modificação de cláusulas contratuais abusivas
- Prevenção e reparação de danos patrimoniais e morais
- Acesso aos órgãos judiciários e administrativos para proteção
- Facilitação da defesa dos seus direitos
- Adequada e eficaz prestação dos serviços públicos

### 3. Responsabilidade por Vício do Produto ou Serviço
- Responsabilidade solidária dos fornecedores
- Prazo para reclamação: 30 dias (produtos/serviços não duráveis) ou 90 dias (produtos/serviços duráveis)
- Alternativas ao consumidor: substituição do produto, restituição da quantia paga ou abatimento proporcional do preço

### 4. Responsabilidade por Fato do Produto ou Serviço (Acidente de Consumo)
- Responsabilidade objetiva do fabricante, produtor, construtor e importador
- Responsabilidade subsidiária do comerciante
- Responsabilidade solidária em caso de não identificação do fabricante
- Excludentes de responsabilidade: não colocação do produto no mercado, inexistência de defeito, culpa exclusiva do consumidor ou de terceiro

### 5. Práticas Comerciais
- Proibição de práticas abusivas
- Coibição de publicidade enganosa ou abusiva
- Garantia mínima legal

### 6. Proteção Contratual
- Interpretação mais favorável ao consumidor
- Direito de arrependimento em compras fora do estabelecimento comercial (7 dias)
- Nulidade de cláusulas abusivas

### 7. Sanções Administrativas
- Multa
- Apreensão do produto
- Cassação de licença
- Interdição do estabelecimento
- Suspensão temporária de atividade
- Contrapropaganda

Órgãos de defesa do consumidor:
- PROCON
- Defensoria Pública
- Ministério Público
- Entidades civis de defesa do consumidor
        """
    }