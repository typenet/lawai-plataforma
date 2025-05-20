#!/bin/bash

# Executar todos os testes com relatório de cobertura
echo "Executando testes com relatório de cobertura..."
python -m pytest

# Verificar se os testes foram bem-sucedidos
if [ $? -eq 0 ]; then
    echo -e "\n\033[0;32mTodos os testes foram executados com sucesso!\033[0m"
    
    # Exibir resumo da cobertura de código
    echo -e "\n\033[1mResumo da cobertura de código:\033[0m"
    echo "Um relatório detalhado HTML foi gerado na pasta 'htmlcov/'"
    echo "Abra o arquivo 'htmlcov/index.html' em um navegador para visualizar"
else
    echo -e "\n\033[0;31mAlguns testes falharam. Verifique os erros acima.\033[0m"
fi