import React from 'react';
import { LinkHealthDashboard } from '@/components/link-health-checker/link-health-dashboard';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { ChevronLeft } from 'lucide-react';

export default function LinkHealthPage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loader">Carregando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold mb-4">Acesso Restrito</h1>
        <p className="mb-4">Você precisa estar autenticado para acessar esta página.</p>
        <Button asChild>
          <a href="/api/login">Entrar</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Button asChild variant="outline">
          <Link to="/dashboard">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Voltar ao Dashboard
          </Link>
        </Button>
      </div>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Verificador de Saúde de Links</h1>
        <p className="text-muted-foreground mt-2">
          Monitore a saúde dos links internos e externos do sistema para garantir que tudo esteja funcionando corretamente.
        </p>
      </div>
      
      <LinkHealthDashboard />
    </div>
  );
}