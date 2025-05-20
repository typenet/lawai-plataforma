# Instruções para Clonar para Github

Para enviar este projeto para o seu repositório GitHub (https://github.com/typenet/lawai-plataforma.git), siga estas etapas:

## 1. Clone o repositório vazio

```bash
git clone https://github.com/typenet/lawai-plataforma.git
cd lawai-plataforma
```

## 2. Copie todos os arquivos do projeto

Baixe os arquivos do projeto do Replit e descompacte-os na pasta do repositório clonado.

## 3. Adicione os arquivos ao Git

```bash
git add .
git commit -m "Versão inicial do LawAI"
git push origin main
```

## Estrutura do Projeto

O projeto LawAI tem a seguinte estrutura:

- **client/** - Frontend React com TypeScript
- **server/** - Backend Node.js/Express
- **shared/** - Schemas e tipos compartilhados
- **scripts/** - Scripts de utilitários (como migrations)

## Principais Recursos Implementados

- Sistema de autenticação
- Gerenciamento de documentos jurídicos
- Análise de documentos com IA
- Geração de documentos jurídicos
- Histórico de pesquisas e documentos
- Visualização e análise detalhada de documentos
- Recursos para impressão e exportação de documentos

## Dependências Principais

- React com TypeScript
- Express.js para o backend
- PostgreSQL para o banco de dados (via Neon)
- Drizzle ORM para acesso ao banco de dados
- TailwindCSS e shadcn/ui para a interface