import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.session import Base, get_db
from app.main import app

# Criar um banco de dados em memória para os testes
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db_session():
    # Criar as tabelas no banco de dados de teste
    Base.metadata.create_all(bind=engine)
    
    # Criar uma sessão de teste
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        
    # Limpar as tabelas após o teste
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db_session):
    # Substituir a dependência get_db para usar a sessão de teste
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    
    # Criar um cliente de teste
    with TestClient(app) as c:
        yield c
    
    # Limpar as substituições
    app.dependency_overrides = {}