import logging
import sys
from typing import Any

# Configurar o logger
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

# Criar o logger
logger = logging.getLogger("lawai")

# Definir nível de log com base no ambiente
logger.setLevel(logging.INFO)  # Pode ser ajustado com base em variáveis de ambiente