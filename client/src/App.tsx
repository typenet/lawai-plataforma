import { Switch, Route, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";
import NewDocument from "@/pages/new-document";
import Documents from "@/pages/documents";
import HistoryPage from "@/pages/history";
import AnalyticsPage from "@/pages/analytics";
import AITestPage from "@/pages/ai-test";
import ClientsPage from "@/pages/clients";
import DeadlinesPage from "@/pages/deadlines";
import SimplifiedFloatingButton from "@/components/ai-assistant/simplified-floating-button";

// Contexto de autenticação simples para desenvolvimento
import { createContext } from "react";

// Dados do usuário simulado para desenvolvimento
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

// Criar contexto de autenticação
export const AuthContext = createContext({
  user: mockUser,
  isAuthenticated: true,
  isLoading: false
});

// Componente para proteger rotas
function ProtectedRoute({ component: Component }: { component: React.ComponentType<any> }) {
  // Sempre autenticado para desenvolvimento
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/novo-documento" component={() => <ProtectedRoute component={NewDocument} />} />
      <Route path="/documentos" component={() => <ProtectedRoute component={Documents} />} />
      <Route path="/historico" component={() => <ProtectedRoute component={HistoryPage} />} />
      <Route path="/analytics" component={() => <ProtectedRoute component={AnalyticsPage} />} />
      <Route path="/clientes" component={() => <ProtectedRoute component={ClientsPage} />} />
      <Route path="/prazos" component={() => <ProtectedRoute component={DeadlinesPage} />} />
      <Route path="/api-test" component={() => <ProtectedRoute component={AITestPage} />} />
      <Route path="/login" component={Login} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const authContextValue = {
    user: mockUser,
    isAuthenticated: true,
    isLoading: false
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={authContextValue}>
        <TooltipProvider>
          <Toaster />
          <Router />
          <SimplifiedFloatingButton />
        </TooltipProvider>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}

export default App;
