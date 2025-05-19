import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import StatsCard from "@/components/dashboard/stats-card";
import DashboardTabs from "@/components/dashboard/dashboard-tabs";
import { Search, FileText, Clock, Star, Zap, Archive, BarChart } from "lucide-react";
import { DashboardStats } from "@/lib/types";
import { useABTest } from "@/hooks/useABTest";

export default function Dashboard() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [location, setLocation] = useState<string>("");
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const { variant, isVariantA, isVariantB } = useABTest({
    testId: "dashboard_layout",
    defaultVariant: "A"
  });

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
        {isVariantA ? (
          // Variante A - Layout Original
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
        ) : (
          // Variante B - Layout Alternativo com menu lateral
          <div className="flex">
            {/* Sidebar Menu - Versão B */}
            <div className="hidden md:flex w-64 bg-navy text-white flex-col min-h-screen">
              <div className="p-6 border-b border-navy-light">
                <h2 className="text-xl font-semibold">JurisIA</h2>
                <p className="text-sm text-white/60 mt-1">Dashboard Jurídico</p>
              </div>
              <nav className="flex-1 p-4">
                <div className="space-y-1">
                  <a href="#" className="flex items-center px-4 py-3 bg-navy-light rounded-md text-white group">
                    <Search className="h-5 w-5 mr-3 text-white/60 group-hover:text-white" />
                    <span>Pesquisas</span>
                  </a>
                  <a href="#" className="flex items-center px-4 py-3 rounded-md text-white/80 hover:bg-navy-light group">
                    <FileText className="h-5 w-5 mr-3 text-white/60 group-hover:text-white" />
                    <span>Documentos</span>
                  </a>
                  <a href="#" className="flex items-center px-4 py-3 rounded-md text-white/80 hover:bg-navy-light group">
                    <Zap className="h-5 w-5 mr-3 text-white/60 group-hover:text-white" />
                    <span>Assistente IA</span>
                  </a>
                  <a href="#" className="flex items-center px-4 py-3 rounded-md text-white/80 hover:bg-navy-light group">
                    <Archive className="h-5 w-5 mr-3 text-white/60 group-hover:text-white" />
                    <span>Biblioteca</span>
                  </a>
                  <a href="#" className="flex items-center px-4 py-3 rounded-md text-white/80 hover:bg-navy-light group">
                    <BarChart className="h-5 w-5 mr-3 text-white/60 group-hover:text-white" />
                    <span>Estatísticas</span>
                  </a>
                </div>
              </nav>
              <div className="p-4 border-t border-navy-light">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <img 
                      className="h-10 w-10 rounded-full"
                      src="https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff"
                      alt="Usuário"
                    />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">Minha Conta</p>
                    <a href="/api/logout" className="text-xs text-white/60 hover:text-white">Sair</a>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Main Content - Versão B */}
            <div className="flex-1">
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <h1 className="text-2xl font-bold text-navy">Olá, {statsData?.firstName || "Advogado"}</h1>
                  <button className="bg-navy hover:bg-navy-light text-white font-medium py-2 px-4 rounded-lg">
                    Nova Pesquisa
                  </button>
                </div>
                
                {/* Stats Summary - Versão compacta */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center">
                      <div className="mr-4 bg-blue-50 p-3 rounded-full">
                        <Search className="h-7 w-7 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{statsLoading ? "..." : statsData?.searchCount || 0}</h3>
                        <p className="text-sm text-gray-500">Pesquisas</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center">
                      <div className="mr-4 bg-indigo-50 p-3 rounded-full">
                        <FileText className="h-7 w-7 text-indigo-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{statsLoading ? "..." : statsData?.documentsCount || 0}</h3>
                        <p className="text-sm text-gray-500">Documentos</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center">
                      <div className="mr-4 bg-green-50 p-3 rounded-full">
                        <Clock className="h-7 w-7 text-green-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{statsLoading ? "..." : `${statsData?.planUsagePercent || 0}%`}</h3>
                        <p className="text-sm text-gray-500">Uso do Plano</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center">
                      <div className="mr-4 bg-yellow-50 p-3 rounded-full">
                        <Star className="h-7 w-7 text-yellow-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{statsLoading ? "..." : statsData?.currentPlanName || "Básico"}</h3>
                        <p className="text-sm text-gray-500">Plano Atual</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Tabs with content */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h2 className="text-xl font-semibold mb-4">Atividades Recentes</h2>
                  <DashboardTabs />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      {isVariantA && <Footer />}
    </div>
  );
}
