const express = require('express');
const session = require('express-session');
const { createServer } = require('http');
const { join } = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Configuração da sessão
app.use(session({
  secret: 'app-juridico-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Middleware para parsear JSON e dados de formulário
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Usuário de desenvolvimento para testes
const mockUser = {
  id: "999999",
  email: "advogado@exemplo.com",
  firstName: "Advogado",
  lastName: "Exemplo",
  profileImageUrl: "https://ui-avatars.com/api/?name=Advogado&background=9F85FF&color=fff",
  subscription: {
    id: "sub_1",
    planId: "professional",
    status: "active",
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  }
};

// Dados simulados para o dashboard
const mockDashboardStats = {
  searchCount: 24,
  documentsCount: 15,
  planUsagePercent: 65,
  clientsCount: 8,
  casesCount: 12,
  pendingDeadlinesCount: 5,
  currentPlanId: "professional",
  currentPlanName: "Profissional"
};

// Simulação de clientes para testes
const mockClients = [
  {
    id: 1,
    name: "João da Silva",
    documentType: "CPF",
    documentNumber: "123.456.789-00",
    email: "joao@exemplo.com",
    phone: "(11) 98765-4321",
    address: "Av. Paulista, 1000",
    city: "São Paulo",
    state: "SP",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    name: "Maria Oliveira",
    documentType: "CPF",
    documentNumber: "987.654.321-00",
    email: "maria@exemplo.com",
    phone: "(11) 91234-5678",
    address: "Rua Augusta, 500",
    city: "São Paulo",
    state: "SP",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Rotas da API para autenticação e dados
app.get('/api/auth/user', (req, res) => {
  res.json(mockUser);
});

app.get('/api/dashboard/stats', (req, res) => {
  res.json(mockDashboardStats);
});

app.get('/api/clients', (req, res) => {
  res.json({ clients: mockClients });
});

app.post('/api/clients', (req, res) => {
  const newClient = {
    id: mockClients.length + 1,
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  mockClients.push(newClient);
  res.status(201).json(newClient);
});

app.get('/api/cases', (req, res) => {
  res.json({ cases: [] });
});

app.get('/api/deadlines', (req, res) => {
  res.json({ deadlines: [] });
});

// Proxy para Vite em desenvolvimento
app.use('/', createProxyMiddleware({
  target: 'http://localhost:5173',
  changeOrigin: true,
  ws: true,
}));

// Iniciar o servidor
const server = createServer(app);
const PORT = 3000;

server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});