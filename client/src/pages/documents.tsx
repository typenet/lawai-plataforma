import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  FileText, 
  Clock, 
  Home, 
  PlusCircle, 
  History,
  Users, 
  Settings, 
  HelpCircle, 
  LogOut, 
  Calendar, 
  MessageSquare, 
  Bell,
  Filter,
  FileText as FileIcon,
  BarChart
} from "lucide-react";
import { AnalyzedDocument } from "@/lib/types";

export default function Documents() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState("documents");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: documents, isLoading: documentsLoading } = useQuery<AnalyzedDocument[]>({
    queryKey: ["/api/documents"],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Acesso negado",
        description: "Você precisa estar logado para acessar esta página.",
        variant: "destructive",
      });
      window.location.href = "/api/login?returnTo=/documentos";
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

  // Componente de card de documento
  const DocumentCard = ({ 
    type, 
    title, 
    date, 
    description, 
    badgeColor
  }: { 
    type: "Contrato" | "Petição" | "Relatório" | "Processo", 
    title: string, 
    date: string, 
    description: string,
    badgeColor: string
  }) => {
    const getBadgeStyles = () => {
      switch (type) {
        case "Contrato":
          return "bg-blue-100 text-blue-600";
        case "Petição":
          return "bg-purple-100 text-purple-600";
        case "Relatório":
          return "bg-amber-100 text-amber-600";
        case "Processo":
          return "bg-green-100 text-green-600";
        default:
          return "bg-gray-100 text-gray-600";
      }
    };

    const getIconBg = () => {
      switch (type) {
        case "Contrato":
          return "bg-blue-100 text-blue-600";
        case "Petição":
          return "bg-purple-100 text-purple-600";
        case "Relatório":
          return "bg-amber-100 text-amber-600";
        case "Processo":
          return "bg-green-100 text-green-600";
        default:
          return "bg-gray-100 text-gray-600";
      }
    };

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start mb-3">
          <div className={`flex-shrink-0 mr-3 p-2 rounded-md ${getIconBg()}`}>
            <FileIcon className="h-5 w-5" />
          </div>
          <div className="flex-grow">
            <div className="flex items-center mb-1">
              <span className={`text-xs px-2.5 py-0.5 rounded-full ${getBadgeStyles()}`}>
                {type}
              </span>
              <span className="text-xs text-gray-500 ml-2 flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {date}
              </span>
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
          </div>
        </div>
        <div className="flex justify-between mt-4">
          <button className="text-sm text-gray-500 hover:text-gray-700 font-medium">
            Visualizar
          </button>
          <button className="text-sm text-[#9F85FF] hover:text-[#8A6EF3] font-medium">
            Ver análise
          </button>
        </div>
      </div>
    );
  };

  // Documentos de exemplo para visualização
  const sampleDocuments = [
    {
      id: "1",
      type: "Contrato" as const,
      title: "Contrato de Prestação de Serviços de Advocacia",
      date: "12/05/2025",
      description: "Este contrato estabelece as condições para prestação de serviços advocatícios...",
      color: "blue"
    },
    {
      id: "2",
      type: "Petição" as const,
      title: "Petição Inicial - Processo nº 0123456-78.2025.8.26.0100",
      date: "10/05/2025",
      description: "Trata-se de petição inicial referente ao processo de indenização por danos morais...",
      color: "purple"
    },
    {
      id: "3",
      type: "Relatório" as const,
      title: "Relatório de Audiência - Caso Silva vs Empresa XYZ",
      date: "05/05/2025",
      description: "Na audiência realizada no dia 05/05, as partes deliberaram sobre os seguintes pontos...",
      color: "amber"
    },
    {
      id: "4",
      type: "Contrato" as const,
      title: "Contrato de Aluguel Comercial - Imóvel Centro",
      date: "01/05/2025",
      description: "Contrato de locação do imóvel situado na Rua Principal, nº 123, para fins comerciais...",
      color: "blue"
    },
    {
      id: "5",
      type: "Petição" as const,
      title: "Contestação - Processo nº 1234567-89.2025.8.26.0100",
      date: "28/04/2025",
      description: "Em resposta à petição inicial, vem apresentar contestação aos fatos alegados pelo autor...",
      color: "purple"
    },
    {
      id: "6",
      type: "Processo" as const,
      title: "Acompanhamento Processual - Ação de Cobrança",
      date: "25/04/2025",
      description: "Resumo do andamento processual da ação de cobrança movida contra Empresa ABC Ltda...",
      color: "green"
    }
  ];

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
            onClick={() => window.location.href = "/dashboard"}
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
            onClick={() => setActiveSection("documents")}
          />
          <SidebarLink
            icon={<History className="h-5 w-5" />}
            label="Histórico"
            active={activeSection === "history"}
            onClick={() => setActiveSection("history")}
          />
          <SidebarLink
            icon={<BarChart className="h-5 w-5" />}
            label="Analytics"
            active={activeSection === "analytics"}
            onClick={() => setActiveSection("analytics")}
          />
          <SidebarLink
            icon={<Users className="h-5 w-5" />}
            label="Clientes"
            active={activeSection === "clients"}
            onClick={() => setActiveSection("clients")}
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

        {/* Documents Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Meus Documentos</h2>
              <p className="text-gray-600 mt-1">Visualize e gerencie seus documentos jurídicos</p>
            </div>
            <Button 
              className="bg-[#9F85FF] hover:bg-[#8A6EF3] text-white"
              onClick={() => window.location.href = "/novo-documento"}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo documento
            </Button>
          </div>

          {/* Search and Filter */}
          <div className="mb-6 flex justify-between">
            <div className="relative w-full max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input 
                placeholder="Pesquisar por título ou conteúdo..." 
                className="pl-10 pr-4 py-2 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center">
              <button className="flex items-center text-gray-600 hover:text-gray-800">
                <Filter className="h-4 w-4 mr-2" />
                <span>Todos os tipos</span>
                <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Document Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sampleDocuments.map(doc => (
              <DocumentCard
                key={doc.id}
                type={doc.type}
                title={doc.title}
                date={doc.date}
                description={doc.description}
                badgeColor={doc.color}
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}