import os
from pydantic import BaseModel, Field
from typing import Optional

class Settings(BaseModel):
    PROJECT_NAME: str = "LawAI"
    API_V1_STR: str = "/api"
    
    # Variáveis de banco de dados
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")
    
    # Variáveis de segurança
    SECRET_KEY: str = os.getenv("SESSION_SECRET", "")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 dias
    
    # Variáveis de API
    DEEPSEEK_API_KEY: Optional[str] = os.getenv("DEEPSEEK_API_KEY", "")
    ANTHROPIC_API_KEY: Optional[str] = os.getenv("ANTHROPIC_API_KEY", "")
    
    # Frontend URL
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5000")
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()