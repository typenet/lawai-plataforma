from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

# Criar engine do SQLAlchemy
engine = create_engine(settings.DATABASE_URL)

# Criar sessão
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para os modelos
Base = declarative_base()

# Função para obter a sessão do banco de dados
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Função para criar tabelas
def create_tables():
    Base.metadata.create_all(bind=engine)