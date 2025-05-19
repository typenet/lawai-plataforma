import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import StatsCard from "@/components/dashboard/stats-card";
import DashboardTabs from "@/components/dashboard/dashboard-tabs";
import { Search, FileText, Clock, Star } from "lucide-react";
import { DashboardStats } from "@/lib/types";

export default function Dashboard() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [location, setLocation] = useState<string>("");
  const [_, navigate] = useLocation();
  const { toast } = useToast();

  const { data: statsData, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    // Wait for auth to load, then redirect if not authenticated
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Acesso negado",
        description: "Você precisa estar logado para acessar esta página.",
        variant: "destructive",
      });
      window.location.href = "/api/login?returnTo=/dashboard";
    }
  }, [isAuthenticated, authLoading, toast]);

  if (authLoading || !isAuthenticated) {
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
      
      <main className="flex-grow">
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-semibold text-navy">Dashboard</h1>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Stats Cards */}
            <div className="py-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                  icon={<Search className="h-5 w-5" />}
                  title="Pesquisas Realizadas"
                  value={statsLoading ? "..." : statsData?.searchCount || 0}
                  linkText="Ver histórico"
                  linkHref="/historico-pesquisas"
                />
                
                <StatsCard
                  icon={<FileText className="h-5 w-5" />}
                  title="Documentos Analisados"
                  value={statsLoading ? "..." : statsData?.documentsCount || 0}
                  linkText="Ver documentos"
                  linkHref="/documentos"
                />
                
                <StatsCard
                  icon={<Clock className="h-5 w-5" />}
                  title="Uso do Plano"
                  value={statsLoading ? "..." : `${statsData?.planUsagePercent || 0}%`}
                  linkText="Detalhes do plano"
                  linkHref="/plano"
                />
                
                <StatsCard
                  icon={<Star className="h-5 w-5" />}
                  title="Plano Atual"
                  value={statsLoading ? "..." : statsData?.currentPlanName || "Nenhum"}
                  linkText="Fazer upgrade"
                  linkHref="/planos"
                  iconBgColor="bg-gold"
                />
              </div>
            </div>
            
            {/* Tabs with content */}
            <DashboardTabs />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
