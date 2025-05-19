import { AIApiTest } from "@/components/ai-assistant/ai-api-test";
import { useAuth } from "@/hooks/useAuth";
import { Redirect } from "wouter";

export default function AITestPage() {
  const { isAuthenticated, isLoading } = useAuth();

  // Redireciona para login se não estiver autenticado
  if (!isLoading && !isAuthenticated) {
    return <Redirect to="/login" />;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Teste de Integração com IA</h1>
      <div className="max-w-4xl mx-auto">
        <AIApiTest />
      </div>
    </div>
  );
}