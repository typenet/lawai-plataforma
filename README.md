# LawAI - Plataforma de Inteligência Jurídica

LawAI é uma plataforma SaaS jurídica com inteligência artificial, projetada para advogados e profissionais do direito otimizarem seu trabalho, economizarem tempo e melhorarem a qualidade de seus serviços.

![LawAI Logo](attached_assets/image_1747699505196.png)

## Recursos Principais

- **Análise de Documentos**: Processamento e análise automática de documentos jurídicos com insights de IA
- **Pesquisa Jurídica Inteligente**: Pesquisa avançada em bases de dados jurídicas
- **Gestão de Clientes**: Cadastro e gerenciamento completo de clientes
- **Controle de Processos**: Acompanhamento de processos e prazos
- **Geração de Documentos**: Criação assistida de documentos jurídicos
- **Dashboard Analítico**: Visualização de métricas e estatísticas de uso

## Tecnologias

- **Frontend**: React, TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Node.js, Express
- **Banco de Dados**: PostgreSQL (via Neon)
- **ORM**: Drizzle
- **Inteligência Artificial**: Integração com DeepSeek e modelos de IA proprietários

## Requisitos

- Node.js 20.x ou superior
- PostgreSQL
- Chaves de API para os serviços de IA (DeepSeek)

## Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/typenet/lawai-plataforma.git
   cd lawai-plataforma
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure o arquivo `.env` com suas credenciais (veja `.env.example`)

4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## Estrutura do Projeto

- `client/` - Código frontend
  - `src/components/` - Componentes React reutilizáveis
  - `src/pages/` - Páginas da aplicação
  - `src/hooks/` - React hooks personalizados
  - `src/lib/` - Utilitários e configurações

- `server/` - Código backend
  - `routes/` - Rotas da API
  - `ai-service.ts` - Serviços de IA
  - `storage.ts` - Interface para o banco de dados

- `shared/` - Código compartilhado entre frontend e backend
  - `schema.ts` - Definição do esquema de banco de dados

## Configuração de Ambiente

Um arquivo `.env` deve ser criado na raiz do projeto com as seguintes variáveis:

```
DATABASE_URL=postgres://...
DEEPSEEK_API_KEY=sua_chave_aqui
SESSION_SECRET=um_segredo_longo_e_aleatorio
```

## Licença

Todos os direitos reservados.

## Contato

Para suporte ou informações adicionais, entre em contato conosco pelo e-mail [contato@typenet.com.br](mailto:contato@typenet.com.br).