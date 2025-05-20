import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, FileText, Clock, Upload, BarChart, Home, PlusCircle, History, 
  Users, Settings, HelpCircle, LogOut, File, Calendar, MessageSquare, Bell, LayoutGrid, CalendarClock } from "lucide-react";
import { DashboardStats } from "@/lib/types";
import { useABTest } from "@/hooks/useABTest";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState("dashboard");
  const { variant } = useABTest({
    testId: "dashboard_layout",
    defaultVariant: "B"
  });

  const { data: statsData, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    enabled: isAuthenticated,
  });

  useEffect(() => {
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#9F85FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl text-gray-700">Carregando...</h2>
        </div>
      </div>
    );
  }

  // Componente de link de menu lateral
  const SidebarLink = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`flex items-center w-full py-3 px-4 rounded-md text-left transition-colors ${
        active 
          ? "bg-[#EAE5FF] text-[#9F85FF]" 
          : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      <div className={`mr-3 ${active ? "text-[#9F85FF]" : "text-gray-500"}`}>
        {icon}
      </div>
      <span className="font-medium">{label}</span>
    </button>
  );

  // Componente de card de estatística
  const StatCard = ({ 
    icon, 
    value, 
    label, 
    iconColor, 
    iconBg,
    percentage
  }: { 
    icon: React.ReactNode, 
    value: string | number, 
    label: string, 
    iconColor: string,
    iconBg: string,
    percentage?: string 
  }) => (
    <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg mr-4 ${iconBg}`}>
          {icon}
        </div>
        <div>
          <div className="flex items-baseline">
            <div className="text-2xl font-bold">{value}</div>
            {percentage && (
              <div className="ml-2 text-xs text-green-500">{percentage}</div>
            )}
          </div>
          <div className="text-sm text-gray-500">{label}</div>
        </div>
      </div>
    </div>
  );

  // Componente de documento recente
  const DocumentItem = ({ 
    icon, 
    title, 
    date, 
    description,
    documentType
  }: { 
    icon: React.ReactNode, 
    title: string, 
    date: string,
    description: string,
    documentType: string
  }) => (
    <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
      <div className="flex items-start mb-3">
        <div className="p-2 mr-2 text-[#9F85FF]">
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start mb-1">
            <div className="text-xs text-gray-500 flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {date}
            </div>
          </div>
          <div className="text-sm font-semibold text-gray-800 mb-1">{documentType}</div>
          <div className="text-base font-semibold text-gray-900">{title}</div>
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{description}</p>
        </div>
      </div>
      <div className="flex justify-between">
        <button className="text-sm text-gray-500 hover:text-gray-700">Visualizar</button>
        <button className="text-sm text-[#9F85FF] hover:text-[#8A6EF3]">Ver análise</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FC] flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm z-10 flex flex-col border-r border-gray-200">
        {/* Logo */}
        <div className="flex items-center p-4 border-b border-gray-200">
          <div className="flex items-center bg-[#9F85FF] rounded-md p-1.5 mr-2">
            <svg className="h-6 w-auto text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.8L20 9v6l-8 4-8-4V9l8-4.2z" />
              <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-[#9F85FF]">LawAI</span>
          
          <button className="ml-auto text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          <SidebarLink
            icon={<Home className="h-5 w-5" />}
            label="Dashboard"
            active={activeSection === "dashboard"}
            onClick={() => setActiveSection("dashboard")}
          />
          <SidebarLink
            icon={<PlusCircle className="h-5 w-5" />}
            label="Novo documento"
            active={activeSection === "newDocument"}
            onClick={() => window.location.href = "/novo-documento"}
          />
          <SidebarLink
            icon={<FileText className="h-5 w-5" />}
            label="Documentos"
            active={activeSection === "documents"}
            onClick={() => window.location.href = "/documentos"}
          />
          <SidebarLink
            icon={<History className="h-5 w-5" />}
            label="Histórico"
            active={activeSection === "history"}
            onClick={() => window.location.href = "/historico"}
          />
          <SidebarLink
            icon={<BarChart className="h-5 w-5" />}
            label="Analytics"
            active={activeSection === "analytics"}
            onClick={() => window.location.href = "/analytics"}
          />
          <SidebarLink
            icon={<Users className="h-5 w-5" />}
            label="Clientes"
            active={activeSection === "clients"}
            onClick={() => window.location.href = "/clientes"}
          />
          <SidebarLink
            icon={<CalendarClock className="h-5 w-5" />}
            label="Prazos Processuais"
            active={activeSection === "deadlines"}
            onClick={() => window.location.href = "/prazos"}
          />
          <SidebarLink
            icon={<HelpCircle className="h-5 w-5" />}
            label="Ajuda"
            active={activeSection === "help"}
            onClick={() => setActiveSection("help")}
          />
          <SidebarLink
            icon={<Settings className="h-5 w-5" />}
            label="Configurações"
            active={activeSection === "settings"}
            onClick={() => setActiveSection("settings")}
          />
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={() => window.location.href = "/api/logout"}
            className="flex items-center w-full py-2 px-4 rounded-md text-left text-gray-600 hover:bg-gray-100"
          >
            <LogOut className="h-5 w-5 mr-3 text-gray-500" />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 py-4 px-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-800">LawAI Insight</h1>
            </div>
            <div className="flex space-x-4 items-center">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <Input 
                  placeholder="Pesquisar documentos..." 
                  className="pl-10 pr-4 py-2 w-64 bg-gray-50"
                />
              </div>
              <button className="p-2 text-gray-500 hover:text-gray-700">
                <MessageSquare className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700 relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-[#9F85FF] text-white flex items-center justify-center">
                  <span className="font-medium text-sm">MA</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Visão Geral</h2>
            <Button 
              className="bg-[#9F85FF] hover:bg-[#8A6EF3] text-white px-4 flex items-center"
              onClick={() => navigate("/novo-documento")}
            >
              <Clock className="mr-2 h-4 w-4" />
              <span>Nova análise</span>
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={<FileText className="h-6 w-6 text-indigo-500" />}
              value="24"
              label="Total de Documentos"
              iconColor="text-indigo-500"
              iconBg="bg-indigo-100"
            />
            <StatCard
              icon={<LayoutGrid className="h-6 w-6 text-purple-500" />}
              value="18"
              label="Documentos Analisados"
              iconColor="text-purple-500"
              iconBg="bg-purple-100"
              percentage="75% do total"
            />
            <StatCard
              icon={<Upload className="h-6 w-6 text-emerald-500" />}
              value="6"
              label="Uploads Esta Semana"
              iconColor="text-emerald-500"
              iconBg="bg-emerald-100"
              percentage="+20%"
            />
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
              <div className="flex items-center">
                <div className="p-3 rounded-lg mr-4 bg-amber-100">
                  <Clock className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <div className="flex items-baseline">
                    <div className="text-2xl font-bold">2:15</div>
                  </div>
                  <div className="text-sm text-gray-500">Tempo Médio de Análise</div>
                </div>
              </div>
            </div>
          </div>

          {/* Documents and Quick Access */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Documents - 2/3 width */}
            <div className="lg:col-span-2">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Documentos Recentes</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DocumentItem
                  icon={<FileText className="h-5 w-5" />}
                  title="Contrato de Prestação de Serviços de Advocacia"
                  date="12/05/2025"
                  description="Este contrato estabelece as condições para prestação de serviços advocatícios."
                  documentType="Contrato"
                />
                <DocumentItem
                  icon={<FileText className="h-5 w-5" />}
                  title="Petição Inicial - Processo nº 0123456-78.2025.8.26.0100"
                  date="10/05/2025"
                  description="Trata-se de petição inicial referente ao processo de reparação de danos."
                  documentType="Petição"
                />
              </div>
            </div>

            {/* Quick Access - 1/3 width */}
            <div className="lg:col-span-1">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Acesso Rápido</h3>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <h4 className="font-medium text-gray-700">Modelos Sugeridos</h4>
                </div>
                <ul className="divide-y divide-gray-200">
                  <li className="flex items-center p-3 hover:bg-gray-50">
                    <File className="h-5 w-5 mr-3 text-[#9F85FF]" />
                    <span className="text-gray-700">Contrato de Honorários</span>
                  </li>
                  <li className="flex items-center p-3 hover:bg-gray-50">
                    <File className="h-5 w-5 mr-3 text-[#9F85FF]" />
                    <span className="text-gray-700">Procuração Ad Judicia</span>
                  </li>
                  <li className="flex items-center p-3 hover:bg-gray-50">
                    <File className="h-5 w-5 mr-3 text-[#9F85FF]" />
                    <span className="text-gray-700">Petição de Juntada de Documentos</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
