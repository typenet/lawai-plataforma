import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function Login() {
  const { isAuthenticated, isLoading } = useAuth();
  const [_, navigate] = useLocation();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl text-neutral-dark">Carregando...</h2>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow flex items-center justify-center py-12">
        <div className="w-full max-w-md px-4">
          <Card className="w-full">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center text-navy">Bem-vindo à JurisIA</CardTitle>
              <CardDescription className="text-center">
                Entre na plataforma para acessar todas as funcionalidades
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex flex-col space-y-2 text-center">
                <h3 className="text-lg font-medium text-neutral-dark">Entre com sua conta</h3>
                <p className="text-sm text-neutral-medium">
                  Usamos Replit para autenticação segura
                </p>
              </div>
              <Button 
                onClick={handleLogin} 
                className="w-full bg-navy hover:bg-navy-light"
              >
                Entrar com Replit
              </Button>
            </CardContent>
            <CardFooter className="flex flex-col">
              <p className="mt-2 text-xs text-center text-neutral-medium">
                Ao fazer login, você concorda com nossos {" "}
                <a href="/termos" className="text-navy hover:underline">
                  Termos de Serviço
                </a>{" "}
                e{" "}
                <a href="/privacidade" className="text-navy hover:underline">
                  Política de Privacidade
                </a>
              </p>
            </CardFooter>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
