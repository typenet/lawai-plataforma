import os
import httpx
from typing import Optional, Dict, Any
import json

from app.core.config import settings
from app.utils.logger import logger

class DeepSeekService:
    """Serviço para integração com a API DeepSeek"""
    def __init__(self):
        self.api_key = settings.DEEPSEEK_API_KEY
        self.api_url = "https://api.deepseek.com/v1/chat/completions"
        self.headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
    
    async def analyze_document(self, document_text: str, document_type: str) -> Dict[str, Any]:
        """Analisa um documento jurídico usando a API DeepSeek"""
        try:
            prompt = f"""Você é um assistente jurídico especializado em análise de documentos. 
            Por favor, analise o seguinte {document_type} e forneça insights jurídicos relevantes,
            potenciais problemas e recomendações:

            {document_text}
            
            Forneça sua análise em formato estruturado, com seções para:
            1. Resumo geral
            2. Pontos principais
            3. Potenciais problemas ou omissões
            4. Recomendações
            """
            
            payload = {
                "model": "deepseek-chat",
                "messages": [
                    {"role": "system", "content": "Você é um assistente jurídico especializado em análise de documentos legais."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.3,
                "max_tokens": 1500
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.api_url,
                    headers=self.headers,
                    json=payload,
                    timeout=60.0
                )
                
                if response.status_code == 200:
                    result = response.json()
                    content = result["choices"][0]["message"]["content"]
                    return {
                        "success": True,
                        "analysis": content
                    }
                else:
                    logger.error(f"Erro na API DeepSeek: {response.status_code} - {response.text}")
                    return {
                        "success": False,
                        "error": f"Erro na API: {response.status_code}",
                        "analysis": "Não foi possível analisar o documento. Por favor, tente novamente mais tarde."
                    }
        except Exception as e:
            logger.error(f"Erro ao analisar documento: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "analysis": "Ocorreu um erro durante a análise do documento."
            }
    
    async def legal_search(self, query: str, context: Optional[str] = None) -> Dict[str, Any]:
        """Realiza uma pesquisa jurídica usando a API DeepSeek"""
        try:
            prompt = f"""Você é um assistente jurídico especializado em pesquisa legal no Brasil. 
            Por favor, forneça informações relevantes sobre a seguinte consulta:

            {query}
            
            {f'Contexto adicional: {context}' if context else ''}
            
            Forneça sua resposta em formato estruturado, com:
            1. Resposta direta à consulta
            2. Fundamentos jurídicos relevantes
            3. Legislação aplicável
            4. Jurisprudência relevante (quando aplicável)
            5. Recomendações práticas
            """
            
            payload = {
                "model": "deepseek-chat",
                "messages": [
                    {"role": "system", "content": "Você é um assistente jurídico especializado em direito brasileiro."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.4,
                "max_tokens": 2000
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.api_url,
                    headers=self.headers,
                    json=payload,
                    timeout=60.0
                )
                
                if response.status_code == 200:
                    result = response.json()
                    content = result["choices"][0]["message"]["content"]
                    return {
                        "success": True,
                        "result": content
                    }
                else:
                    logger.error(f"Erro na API DeepSeek: {response.status_code} - {response.text}")
                    return {
                        "success": False,
                        "error": f"Erro na API: {response.status_code}",
                        "result": "Não foi possível realizar a pesquisa. Por favor, tente novamente mais tarde."
                    }
        except Exception as e:
            logger.error(f"Erro ao realizar pesquisa jurídica: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "result": "Ocorreu um erro durante a pesquisa jurídica."
            }
    
    async def generate_document(self, document_type: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Gera um documento jurídico com base em parâmetros"""
        try:
            params_text = "\n".join([f"{k}: {v}" for k, v in parameters.items()])
            
            prompt = f"""Você é um assistente jurídico especializado em elaboração de documentos.
            Por favor, gere um {document_type} com base nos seguintes parâmetros:

            {params_text}
            
            O documento deve seguir todas as formalidades e requisitos legais para um {document_type} válido
            no sistema jurídico brasileiro.
            """
            
            payload = {
                "model": "deepseek-chat",
                "messages": [
                    {"role": "system", "content": "Você é um assistente jurídico especializado em elaboração de documentos legais."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.2,
                "max_tokens": 3000
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.api_url,
                    headers=self.headers,
                    json=payload,
                    timeout=60.0
                )
                
                if response.status_code == 200:
                    result = response.json()
                    content = result["choices"][0]["message"]["content"]
                    return {
                        "success": True,
                        "document": content
                    }
                else:
                    logger.error(f"Erro na API DeepSeek: {response.status_code} - {response.text}")
                    return {
                        "success": False,
                        "error": f"Erro na API: {response.status_code}",
                        "document": "Não foi possível gerar o documento. Por favor, tente novamente mais tarde."
                    }
        except Exception as e:
            logger.error(f"Erro ao gerar documento: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "document": "Ocorreu um erro durante a geração do documento."
            }
    
    async def test_connection(self) -> bool:
        """Verifica a conexão com a API DeepSeek"""
        try:
            payload = {
                "model": "deepseek-chat",
                "messages": [
                    {"role": "system", "content": "Você é um assistente jurídico."},
                    {"role": "user", "content": "Olá, teste de conexão."}
                ],
                "max_tokens": 5
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.api_url,
                    headers=self.headers,
                    json=payload,
                    timeout=10.0
                )
                
                return response.status_code == 200
        except Exception as e:
            logger.error(f"Erro ao testar conexão com DeepSeek: {str(e)}")
            return False

# Instância do serviço
deepseek_service = DeepSeekService()

# Funções para facilitar o uso dos serviços
async def analyze_document(document_text: str, document_type: str) -> Dict[str, Any]:
    """Analisa um documento jurídico usando o serviço de IA disponível"""
    return await deepseek_service.analyze_document(document_text, document_type)

async def legal_search(query: str, context: Optional[str] = None) -> Dict[str, Any]:
    """Realiza uma pesquisa jurídica usando o serviço de IA disponível"""
    return await deepseek_service.legal_search(query, context)

async def generate_document(document_type: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
    """Gera um documento jurídico com base em parâmetros"""
    return await deepseek_service.generate_document(document_type, parameters)

async def test_connection() -> Dict[str, bool]:
    """Testa a conexão com os serviços de IA"""
    deepseek_connected = await deepseek_service.test_connection()
    
    return {
        "deepseek_connected": deepseek_connected,
        "any_service_connected": deepseek_connected
    }