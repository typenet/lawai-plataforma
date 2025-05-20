from fastapi import APIRouter

from app.api.endpoints import auth, users, documents, clients, cases, deadlines, ai

api_router = APIRouter()

# Incluir todas as rotas dos endpoints
api_router.include_router(auth.router, prefix="/auth", tags=["autenticação"])
api_router.include_router(users.router, prefix="/users", tags=["usuários"])
api_router.include_router(documents.router, prefix="/documents", tags=["documentos"])
api_router.include_router(clients.router, prefix="/clients", tags=["clientes"])
api_router.include_router(cases.router, prefix="/cases", tags=["processos"])
api_router.include_router(deadlines.router, prefix="/deadlines", tags=["prazos"])
api_router.include_router(ai.router, prefix="/ai", tags=["inteligência artificial"])