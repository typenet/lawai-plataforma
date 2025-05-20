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
  Eye,
  Download,
  FileIcon,
  BarChart
} from "lucide-react";

export default function HistoryPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState("history");
  const [currentPage, setCurrentPage] = useState(1);

  // Buscar documentos da API
  const { data, isLoading: documentsLoading } = useQuery({
    queryKey: ["/api/documents"],
    enabled: isAuthenticated,
  });
  
  const documents = data?.documents || [];

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

  // Formatar data para exibição amigável
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Converter documentos da API para o formato da tabela de histórico
  const historyDocuments = documents.map(doc => {
    // Determinar o tipo do documento com base no título
    let type = "Documento";
    if (doc.title.toLowerCase().includes("contrato")) type = "Contrato";
    else if (doc.title.toLowerCase().includes("petição") || doc.title.toLowerCase().includes("peticao")) type = "Petição";
    else if (doc.title.toLowerCase().includes("procuração") || doc.title.toLowerCase().includes("procuracao")) type = "Procuração";
    
    return {
      id: doc.id,
      title: doc.title,
      type: type,
      date: formatDate(doc.createdAt),
      status: "Concluído" as const,
      insights: Math.floor(Math.random() * 3) + 2 // Simular número de insights (2-4)
    };
  });

  return (
    <div className="min-h-screen bg-[#F8F9FC] flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-[#9F85FF]">LawAI</h1>
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
            onClick={() => window.location.href = "/analytics"}
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
            onClick={() => window.location.href = "/configuracoes"}
          />
        </nav>
        
        {/* User Menu */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-[#9F85FF] flex items-center justify-center text-white font-medium">
              {user?.firstName?.charAt(0) || "U"}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{user?.firstName || "Usuário"}</p>
              <p className="text-xs text-gray-500">Advogado</p>
            </div>
            <button 
              onClick={() => window.location.href = "/api/logout"}
              className="ml-auto text-gray-400 hover:text-gray-600"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button className="text-gray-500 md:hidden mr-2">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-lg font-medium text-gray-800 md:hidden">LawAI</h1>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Bell className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <MessageSquare className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        {/* History Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Histórico de Análises</h2>
            <p className="text-gray-600 mt-1">Veja o histórico de documentos analisados pela IA</p>
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
                  {historyDocuments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                        <FileIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                        <p className="font-medium">Nenhum documento encontrado</p>
                        <p className="text-sm mb-4">Você ainda não analisou nenhum documento.</p>
                        <Button 
                          className="bg-[#9F85FF] hover:bg-[#8A6EF3] text-white"
                          onClick={() => window.location.href = "/novo-documento"}
                        >
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Novo documento
                        </Button>
                      </td>
                    </tr>
                  ) : (
                    historyDocuments.map((doc) => (
                      <tr key={doc.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <span className="text-gray-400 mr-2">
                              <FileIcon className="h-4 w-4" />
                            </span>
                            <span className="text-sm text-gray-700 font-medium line-clamp-1">{doc.title}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">{doc.type}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">{doc.date}</span>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={doc.status} />
                        </td>
                        <td className="px-6 py-4">
                          {doc.insights !== null ? (
                            <div className="flex items-center">
                              <span className="font-medium text-sm text-gray-700">{doc.insights}</span>
                              <span className="text-xs text-gray-400 ml-1">itens</span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button className="text-gray-400 hover:text-gray-600 p-1" title="Visualizar">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="text-gray-400 hover:text-gray-600 p-1" title="Baixar">
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Mostrando {historyDocuments.length} de {historyDocuments.length} resultados
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
                  Anterior
                </button>
                <button className="bg-[#9F85FF] text-white px-3 py-1 rounded text-sm">
                  1
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
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