import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
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
  ChevronLeft,
  Download,
  Printer,
  BarChart
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function DocumentViewer() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState("documents");
  
  // Extrair o ID do documento da URL
  const params = new URLSearchParams(window.location.search);
  const documentId = params.get('id');
  
  // Consulta para obter os detalhes do documento
  const { data: documentData, isLoading: isLoadingDocument } = useQuery({
    queryKey: ['/api/documents', documentId],
    enabled: !!documentId && isAuthenticated,
    queryFn: async () => {
      if (!documentId) return null;
      try {
        const response = await apiRequest('GET', `/api/documents/${documentId}`);
        return response;
      } catch (error) {
        console.error("Erro ao carregar documento:", error);
        toast({
          title: "Erro ao carregar documento",
          description: "Não foi possível carregar o documento solicitado.",
          variant: "destructive",
        });
        return null;
      }
    }
  });

  const document = documentData?.document;
  
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Acesso negado",
        description: "Você precisa estar logado para acessar esta página.",
        variant: "destructive",
      });
      window.location.href = "/api/login?returnTo=/visualizar-documento";
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

  const handleBackToDocuments = () => {
    navigate('/documentos');
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  // Determinar o tipo do documento com base no título
  const getDocumentType = (title: string) => {
    let type = "Documento";
    if (title.toLowerCase().includes("contrato")) type = "Contrato";
    else if (title.toLowerCase().includes("petição") || title.toLowerCase().includes("peticao")) type = "Petição";
    else if (title.toLowerCase().includes("procuração") || title.toLowerCase().includes("procuracao")) type = "Procuração";
    return type;
  };

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
            onClick={() => navigate('/documentos')}
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

        {/* Document Viewer Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {isLoadingDocument ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9F85FF]"></div>
            </div>
          ) : !document ? (
            <div className="bg-white p-8 rounded-lg border text-center">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">Documento não encontrado</h3>
              <p className="text-gray-500 mb-4">
                O documento solicitado não foi encontrado ou você não tem permissão para acessá-lo.
              </p>
              <Button 
                className="bg-[#9F85FF] hover:bg-[#8A6EF3] text-white"
                onClick={handleBackToDocuments}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Voltar para Documentos
              </Button>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              {/* Document Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-[#9F85FF]">
                        {getDocumentType(document.title)}
                      </span>
                      <span className="text-sm text-gray-500">
                        Criado em: {new Date(document.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">{document.title}</h1>
                    <p className="text-gray-600 mt-1">
                      Cliente: {document.clientName || "Cliente não especificado"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="text-gray-600"
                      onClick={handleBackToDocuments}
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Voltar
                    </Button>
                    <Button 
                      variant="outline" 
                      className="text-gray-600"
                      onClick={handlePrint}
                    >
                      <Printer className="mr-2 h-4 w-4" />
                      Imprimir
                    </Button>
                    <Button 
                      className="bg-[#9F85FF] hover:bg-[#8A6EF3] text-white"
                      onClick={() => {
                        // Opção para baixar - futuramente
                        alert("Funcionalidade de download será implementada em breve.");
                      }}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Baixar
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Document Content */}
              <div className="p-6">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 font-mono text-sm whitespace-pre-wrap">
                  {document.content || "Este documento não possui conteúdo."}
                </div>
              </div>
              
              {/* Document Metadata */}
              <div className="border-t border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Informações adicionais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Tipo de arquivo</p>
                    <p className="text-sm font-medium">{document.fileType || "Texto"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tamanho</p>
                    <p className="text-sm font-medium">{document.fileInfo || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="text-sm font-medium">{document.status || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Cliente</p>
                    <p className="text-sm font-medium">{document.clientName || "Cliente não especificado"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}