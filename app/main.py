from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.responses import FileResponse

import os
from dotenv import load_dotenv

from app.api.api import api_router
from app.core.config import settings
from app.db.session import create_tables

# Carregar variáveis de ambiente
load_dotenv()

app = FastAPI(
    title="LawAI API",
    description="API de backend para a plataforma LawAI de inteligência jurídica",
    version="1.0.0",
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, especifique os domínios permitidos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir as rotas da API
app.include_router(api_router, prefix="/api")

# Servir arquivos estáticos (frontend React)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Rota para o frontend (SPA)
@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    if os.path.exists(os.path.join("static", full_path)):
        return FileResponse(os.path.join("static", full_path))
    return FileResponse("static/index.html")

@app.on_event("startup")
async def startup_event():
    # Criar as tabelas no banco de dados
    create_tables()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=5000, reload=True)