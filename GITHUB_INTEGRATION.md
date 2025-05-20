# Instruções para Integração com GitHub

Para integrar este projeto ao GitHub, siga estas etapas:

## 1. Crie um novo repositório no GitHub

1. Acesse [GitHub](https://github.com) e faça login na sua conta
2. Clique no botão "+" no canto superior direito e selecione "New repository"
3. Dê um nome ao seu repositório, como "lawai-plataforma" ou "jurisia-app"
4. Adicione uma descrição (opcional): "Plataforma de IA jurídica para advogados e profissionais do direito"
5. Escolha a visibilidade (público ou privado)
6. Clique em "Create repository"

## 2. Clone o código do Replit

Existem duas maneiras de fazer isso:

### Opção 1: Exportar o código do Replit
1. Na interface do Replit, clique nos três pontos (...) no canto superior direito
2. Selecione "Download as zip"
3. Extraia o arquivo zip no seu computador

### Opção 2: Clone diretamente do Replit (se disponível)
1. Encontre a URL Git do seu repl (se disponível)
2. Execute `git clone <URL_DO_REPLIT>` no seu terminal

## 3. Inicialize o repositório Git e envie para o GitHub

Execute estes comandos no terminal, dentro da pasta do projeto:

```bash
# Inicialize o repositório Git
git init

# Adicione todos os arquivos
git add .

# Configure seu nome e email (se ainda não configurou)
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@exemplo.com"

# Faça o commit inicial
git commit -m "Versão inicial do LawAI"

# Adicione o repositório remoto
git remote add origin https://github.com/seu-usuario/nome-do-repositorio.git

# Envie o código para o GitHub
git push -u origin main
```

## 4. Estrutura do Projeto para Documentação

Nosso projeto LawAI (antigo JurisIA) inclui:

- **Backend**: Express.js com TypeScript, conectado ao banco de dados PostgreSQL
- **Frontend**: React com TypeScript e Tailwind CSS para a interface do usuário
- **IA**: Integração com modelos de IA para análise jurídica e geração de documentos
- **Funcionalidades**: 
  - Dashboard de análise
  - Gestão de clientes
  - Gerenciamento de processos
  - Controle de prazos
  - Assistente de IA com geração de documentos
  - Exportação de documentos em PDF

## 5. Deploy

O projeto pode ser facilmente implantado em plataformas como:

- Vercel
- Netlify
- Railway
- Render
- Heroku

Lembre-se de configurar as variáveis de ambiente necessárias:

- `DATABASE_URL` - URL de conexão com o banco de dados PostgreSQL
- `SESSION_SECRET` - Chave secreta para sessões
- `DEEPSEEK_API_KEY` - Chave API para o serviço DeepSeek (opcional)

## 6. Modelo de Banco de Dados

O projeto utiliza PostgreSQL com Drizzle ORM para armazenar:

- Usuários e perfis
- Clientes
- Processos
- Prazos
- Documentos gerados
- Histórico de pesquisas

Para criar o banco de dados:
```bash
npm run db:push
```