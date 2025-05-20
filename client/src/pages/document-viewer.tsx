import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
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
  FileSearch,
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
  
  const handleViewAnalysis = () => {
    if (documentId) {
      navigate(`/analise-documento?id=${documentId}`);
    }
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  const handleDownload = () => {
    if (!document || !document.content) {
      toast({
        title: "Erro ao baixar",
        description: "Não foi possível gerar o download do documento.",
        variant: "destructive",
      });
      return;
    }
    
    // Criar um blob e fazer o download
    const blob = new Blob([document.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${document.title || 'documento'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download iniciado",
      description: "O documento está sendo baixado.",
    });
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] flex print:block">
      {/* Sidebar - escondido ao imprimir */}
      <div className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col print:hidden">
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
        {/* Header - escondido ao imprimir */}
        <header className="bg-white border-b border-gray-200 px-4 py-4 sm:px-6 print:hidden">
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
        <main className="flex-1 overflow-y-auto p-6 print:p-0">
          {isLoadingDocument ? (
            <div className="flex justify-center py-12 print:hidden">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9F85FF]"></div>
            </div>
          ) : !document ? (
            <div className="bg-white p-8 rounded-lg border text-center print:hidden">
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
            <div className="max-w-5xl mx-auto">
              {/* Actions Bar - escondido ao imprimir */}
              <div className="flex justify-between items-center mb-6 print:hidden">
                <Button 
                  variant="outline" 
                  className="text-gray-600"
                  onClick={handleBackToDocuments}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Button>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="text-gray-600"
                    onClick={handlePrint}
                  >
                    <Printer className="mr-2 h-4 w-4" />
                    Imprimir
                  </Button>
                  <Button 
                    variant="outline" 
                    className="text-gray-600"
                    onClick={handleDownload}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Baixar
                  </Button>
                  <Button 
                    className="bg-[#9F85FF] hover:bg-[#8A6EF3] text-white"
                    onClick={handleViewAnalysis}
                  >
                    <FileSearch className="mr-2 h-4 w-4" />
                    Ver análise
                  </Button>
                </div>
              </div>
              
              {/* Document Content */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 print:border-0 print:shadow-none print:p-0">
                {/* Document Metadata - Alguns campos escondidos ao imprimir */}
                <div className="mb-6 print:mb-8">
                  <div className="print:text-center">
                    <h1 className="text-2xl font-bold text-gray-800 print:text-3xl">{document.title}</h1>
                    <p className="text-gray-500 mt-1 print:hidden">
                      Cliente: {document.clientName || "Cliente não especificado"}
                    </p>
                    <p className="text-gray-500 text-sm mt-1 print:hidden">
                      {document.createdAgo || new Date(document.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                {/* Document Text Content */}
                {document.content ? (
                  <div className="prose max-w-none">
                    {document.content.split('\n').map((line, index) => (
                      <p key={index} className={line.trim() === '' ? 'my-4' : 'my-2'}>
                        {line}
                      </p>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-gray-500 print:hidden">
                    <p>Conteúdo do documento não disponível.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}