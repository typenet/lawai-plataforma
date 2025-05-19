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
  EyeIcon,
  Download,
  FileIcon,
  BarChart
} from "lucide-react";
import { AnalyzedDocument } from "@/lib/types";

export default function HistoryPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState("history");
  const [currentPage, setCurrentPage] = useState(1);

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
      window.location.href = "/api/login?returnTo=/historico";
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

  // Status badge component
  const StatusBadge = ({ status }: { status: "Concluído" | "Processando" | "Erro" }) => {
    const getStatusStyles = () => {
      switch (status) {
        case "Concluído":
          return "bg-green-100 text-green-700";
        case "Processando":
          return "bg-blue-100 text-blue-700";
        case "Erro":
          return "bg-red-100 text-red-700";
        default:
          return "bg-gray-100 text-gray-700";
      }
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyles()}`}>
        {status}
      </span>
    );
  };

  // Histórico de documentos para visualização
  const historyDocuments = [
    {
      id: "1",
      title: "Contrato de Prestação de Serviços de Advocacia",
      type: "Contrato",
      date: "12/05/2025",
      status: "Concluído" as const,
      insights: 5
    },
    {
      id: "2",
      title: "Petição Inicial - Processo nº 0123456-78.2025.8.26.0100",
      type: "Petição",
      date: "10/05/2025",
      status: "Concluído" as const,
      insights: 4
    },
    {
      id: "3",
      title: "Relatório de Audiência - Caso Silva vs Empresa XYZ",
      type: "Relatório",
      date: "05/05/2025",
      status: "Concluído" as const,
      insights: 3
    },
    {
      id: "4",
      title: "Contrato de Aluguel Comercial - Imóvel Centro",
      type: "Contrato",
      date: "01/05/2025",
      status: "Concluído" as const,
      insights: 4
    },
    {
      id: "5",
      title: "Contestação - Processo nº 1234567-89.2025.8.26.0100",
      type: "Petição",
      date: "28/04/2025",
      status: "Processando" as const,
      insights: null
    },
    {
      id: "6",
      title: "Acompanhamento Processual - Ação de Cobrança",
      type: "Processo",
      date: "25/04/2025",
      status: "Erro" as const,
      insights: null
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
            onClick={() => window.location.href = "/documentos"}
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

        {/* History Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Histórico de Análises</h2>
            <p className="text-gray-600 mt-1">Veja o histórico de documentos analisados pela nossa IA</p>
          </div>

          {/* History Table */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-200">
                    <th className="px-6 py-3 text-gray-500 font-medium text-sm">Documento</th>
                    <th className="px-6 py-3 text-gray-500 font-medium text-sm">Tipo</th>
                    <th className="px-6 py-3 text-gray-500 font-medium text-sm">Data</th>
                    <th className="px-6 py-3 text-gray-500 font-medium text-sm">Status</th>
                    <th className="px-6 py-3 text-gray-500 font-medium text-sm">Insights</th>
                    <th className="px-6 py-3 text-gray-500 font-medium text-sm">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {historyDocuments.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span className="text-gray-400 mr-2">
                            <FileIcon className="h-4 w-4" />
                          </span>
                          <span className="text-sm text-gray-700 font-medium line-clamp-1">{doc.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{doc.type}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{doc.date}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={doc.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {doc.insights !== null ? doc.insights : "-"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-3 text-gray-400">
                          <button className="hover:text-gray-700" title="Visualizar">
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          <button className="hover:text-gray-700" title="Baixar">
                            <Download className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="border-t border-gray-200 px-6 py-3 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Mostrando 6 de 24 registros
              </div>
              <div className="flex space-x-1">
                <button 
                  className="px-3 py-1 rounded border border-gray-300 text-sm text-gray-600 hover:bg-gray-50"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                >
                  Anterior
                </button>
                <button 
                  className={`px-3 py-1 rounded text-sm ${currentPage === 1 ? 'bg-[#9F85FF] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                  onClick={() => setCurrentPage(1)}
                >
                  1
                </button>
                <button 
                  className={`px-3 py-1 rounded text-sm ${currentPage === 2 ? 'bg-[#9F85FF] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                  onClick={() => setCurrentPage(2)}
                >
                  2
                </button>
                <button 
                  className={`px-3 py-1 rounded text-sm ${currentPage === 3 ? 'bg-[#9F85FF] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                  onClick={() => setCurrentPage(3)}
                >
                  3
                </button>
                <button 
                  className="px-3 py-1 rounded border border-gray-300 text-sm text-gray-600 hover:bg-gray-50"
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  Próxima
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}