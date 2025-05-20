import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  FileText, 
  Upload, 
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
  AlertCircle,
  BarChart 
} from "lucide-react";

export default function NewDocument() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState("newDocument");
  const [dragActive, setDragActive] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [editorVisible, setEditorVisible] = useState(false);
  const [documentText, setDocumentText] = useState<string>("");
  
  // Verificar parâmetros na URL para pré-selecionar modelo
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const modelo = params.get('modelo');
    
    if (modelo) {
      setSelectedTemplate(modelo);
      // Selecionar aba "Modelos" automaticamente se um modelo foi selecionado
      const tabsElement = document.getElementById('document-tabs');
      if (tabsElement) {
        setTimeout(() => {
          const modelsTab = tabsElement.querySelector('[data-value="modelos"]');
          if (modelsTab) {
            (modelsTab as HTMLElement).click();
          }
        }, 100);
      }
    }
  }, [location]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Acesso negado",
        description: "Você precisa estar logado para acessar esta página.",
        variant: "destructive",
      });
      window.location.href = "/api/login?returnTo=/novo-documento";
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

  // Função para carregar o texto do modelo selecionado
  const loadTemplateText = () => {
    let modelContent = "";
    
    if (selectedTemplate === 'contrato-honorarios') {
      modelContent = `CONTRATO DE HONORÁRIOS ADVOCATÍCIOS

CONTRATANTE: [NOME DO CLIENTE], [NACIONALIDADE], [ESTADO CIVIL], [PROFISSÃO], inscrito no CPF sob nº [CPF], portador do RG nº [RG], residente e domiciliado na [ENDEREÇO COMPLETO], doravante denominado CLIENTE.

CONTRATADO: [NOME DO ADVOGADO], advogado inscrito na OAB/[ESTADO] sob o nº [NÚMERO OAB], com escritório profissional na [ENDEREÇO DO ESCRITÓRIO], doravante denominado ADVOGADO.

As partes acima identificadas têm, entre si, justo e acertado o presente Contrato de Honorários Advocatícios, que se regerá pelas cláusulas seguintes e pelas condições descritas no presente.

CLÁUSULA PRIMEIRA - DO OBJETO

O presente contrato tem por objeto a prestação de serviços advocatícios pelo ADVOGADO ao CLIENTE, consistentes em [DESCRIÇÃO DETALHADA DOS SERVIÇOS], incluindo a prática de todos os atos necessários ao bom andamento do processo.

CLÁUSULA SEGUNDA - DOS HONORÁRIOS

Pelos serviços prestados, o CLIENTE pagará ao ADVOGADO o valor de R$ [VALOR EM REAIS] ([VALOR POR EXTENSO]), a serem pagos da seguinte forma: [FORMA DE PAGAMENTO].

§1º - Em caso de êxito na ação, o CLIENTE pagará ao ADVOGADO, a título de honorários de êxito, o percentual de [PERCENTUAL]% sobre o valor da condenação ou do proveito econômico obtido.

§2º - Os honorários contratados não incluem despesas processuais, custas judiciais, diligências, cópias, deslocamentos, que serão de responsabilidade do CLIENTE.

CLÁUSULA TERCEIRA - DAS OBRIGAÇÕES DO ADVOGADO

O ADVOGADO se obriga a:
1. Prestar os serviços advocatícios com zelo, dedicação e ética profissional;
2. Manter o CLIENTE informado sobre o andamento do processo;
3. Cumprir rigorosamente os prazos processuais;
4. Guardar sigilo profissional sobre os fatos que tiver conhecimento em razão de sua atuação.

CLÁUSULA QUARTA - DAS OBRIGAÇÕES DO CLIENTE

O CLIENTE se obriga a:
1. Fornecer tempestivamente todos os documentos e informações solicitados pelo ADVOGADO;
2. Comparecer aos atos processuais quando solicitado;
3. Pagar pontualmente os honorários advocatícios e as despesas processuais;
4. Não realizar acordos diretos com a parte contrária sem a ciência e participação do ADVOGADO.

CLÁUSULA QUINTA - DA VIGÊNCIA

O presente contrato vigorará até o trânsito em julgado da sentença ou até o cumprimento integral de todas as obrigações deste contrato, o que ocorrer por último.

CLÁUSULA SEXTA - DA RESCISÃO

O presente contrato poderá ser rescindido a qualquer tempo, por qualquer das partes, mediante notificação prévia de 30 (trinta) dias.

§1º - Em caso de rescisão por iniciativa do CLIENTE, este deverá pagar ao ADVOGADO os honorários proporcionais ao trabalho realizado até o momento da rescisão.

§2º - Em caso de rescisão por iniciativa do ADVOGADO, sem justo motivo, este deverá continuar representando o CLIENTE por 10 (dez) dias, a fim de evitar prejuízos, salvo se o CLIENTE dispensar esses serviços.

CLÁUSULA SÉTIMA - DO FORO

As partes elegem o Foro da Comarca de [COMARCA], com renúncia expressa de qualquer outro, por mais privilegiado que seja, para dirimir quaisquer dúvidas ou controvérsias oriundas do presente contrato.

E, por estarem assim justas e contratadas, as partes assinam o presente instrumento em 2 (duas) vias de igual teor e forma, na presença de 2 (duas) testemunhas abaixo assinadas.

[LOCAL], [DATA].

____________________________
[NOME DO CLIENTE]
CONTRATANTE

____________________________
[NOME DO ADVOGADO]
CONTRATADO

TESTEMUNHAS:

____________________________
Nome:
CPF:

____________________________
Nome:
CPF:`;
    } else if (selectedTemplate === 'procuracao') {
      modelContent = `PROCURAÇÃO "AD JUDICIA ET EXTRA"

OUTORGANTE: [NOME COMPLETO], [NACIONALIDADE], [ESTADO CIVIL], [PROFISSÃO], portador(a) da cédula de identidade RG nº [NÚMERO DO RG], inscrito(a) no CPF/MF sob o nº [NÚMERO DO CPF], residente e domiciliado(a) na [ENDEREÇO COMPLETO], [CIDADE], [ESTADO], [CEP].

OUTORGADO(S): [NOME DO ADVOGADO], brasileiro(a), advogado(a), inscrito(a) na OAB/[ESTADO] sob o nº [NÚMERO DA OAB], com escritório profissional na [ENDEREÇO COMPLETO DO ESCRITÓRIO], [CIDADE], [ESTADO], [CEP].

PODERES: Por este instrumento particular de procuração, o(a) outorgante nomeia e constitui seu(sua) bastante procurador(a) o(a) outorgado(a) acima qualificado(a), a quem confere amplos poderes para o foro em geral, com a cláusula "ad judicia et extra", em qualquer Juízo, Instância ou Tribunal, podendo propor contra quem de direito as ações competentes e defendê-lo(a) nas contrárias, seguindo umas e outras, até final decisão, usando os recursos legais e acompanhando-os, conferindo-lhe, ainda, poderes especiais para confessar, desistir, transigir, firmar compromissos ou acordos, receber e dar quitação, agindo em conjunto ou separadamente, podendo ainda substabelecer esta com ou sem reservas de poderes, dando tudo por bom, firme e valioso, especialmente para [FINALIDADE ESPECÍFICA DA PROCURAÇÃO, SE HOUVER].

[CIDADE], [DATA POR EXTENSO].

_______________________________________
[NOME COMPLETO DO OUTORGANTE]`;
    } else if (selectedTemplate === 'juntada') {
      modelContent = `EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO DA [NÚMERO] VARA [CÍVEL/CRIMINAL/TRABALHISTA/ETC] DA COMARCA DE [NOME DA COMARCA]

Processo nº [NÚMERO DO PROCESSO]

[NOME DA PARTE] já qualificado(a) nos autos do processo em epígrafe, que move em face de [NOME DA PARTE CONTRÁRIA], por seu(sua) advogado(a) que esta subscreve, vem, respeitosamente, à presença de Vossa Excelência, requerer a JUNTADA dos documentos em anexo, consistentes em:

1. [DESCRIÇÃO DO DOCUMENTO 1];
2. [DESCRIÇÃO DO DOCUMENTO 2];
3. [DESCRIÇÃO DO DOCUMENTO 3].

Os documentos ora apresentados são indispensáveis para a comprovação dos fatos alegados pela parte requerente, em especial no que tange a [EXPLICAR A RELEVÂNCIA DOS DOCUMENTOS PARA O PROCESSO].

Destaca-se que tais documentos estão sendo apresentados neste momento processual em razão de [JUSTIFICAR O MOMENTO DA JUNTADA, SE NECESSÁRIO].

Nestes termos,
Pede deferimento.

[CIDADE], [DATA].

____________________________
[NOME DO(A) ADVOGADO(A)]
OAB/[ESTADO] nº [NÚMERO DA OAB]`;
    }
    
    setDocumentText(modelContent);
    setEditorVisible(true);
    
    toast({
      title: "Modelo carregado",
      description: "O modelo foi carregado e está pronto para edição.",
    });
  };

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

  // Manipuladores para drag and drop
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Aqui você processaria os arquivos
      console.log("Arquivos recebidos:", e.dataTransfer.files);
      // handleFiles(e.dataTransfer.files);
      toast({
        title: "Arquivos recebidos",
        description: `${e.dataTransfer.files.length} arquivo(s) prontos para upload.`,
      });
    }
  };

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
            onClick={() => navigate('/dashboard')}
          />
          <SidebarLink
            icon={<PlusCircle className="h-5 w-5" />}
            label="Novo documento"
            active={activeSection === "newDocument"}
            onClick={() => setActiveSection("newDocument")}
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

        {/* Upload Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Upload de Documentos</h2>
            <p className="text-gray-600 mt-1">Envie documentos jurídicos para análise pela nossa IA</p>
          </div>

          {editorVisible ? (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {selectedTemplate === 'contrato-honorarios' ? 'Contrato de Honorários' : 
                   selectedTemplate === 'procuracao' ? 'Procuração Ad Judicia' : 
                   'Petição de Juntada'}
                </h3>
                <Button 
                  variant="outline" 
                  onClick={() => setEditorVisible(false)}
                  className="text-gray-600"
                >
                  Voltar
                </Button>
              </div>
              
              <textarea 
                value={documentText}
                onChange={(e) => setDocumentText(e.target.value)}
                className="w-full h-[60vh] p-4 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#9F85FF] focus:border-transparent"
              />
              
              <div className="flex justify-end space-x-3 mt-4">
                <Button variant="outline" className="text-gray-600">
                  Cancelar
                </Button>
                <Button className="bg-[#9F85FF] hover:bg-[#8A6EF3]">
                  Salvar documento
                </Button>
              </div>
            </div>
          ) : (
            <Tabs defaultValue="upload" className="mb-8">
              <TabsList className="border-b border-gray-200 w-full justify-start space-x-6 bg-transparent p-0" id="document-tabs">
                <TabsTrigger 
                  value="upload" 
                  className="pb-2 pt-1 px-0 data-[state=active]:border-b-2 data-[state=active]:border-[#9F85FF] data-[state=active]:text-[#9F85FF] text-gray-500 bg-transparent font-medium rounded-none"
                >
                  Upload de arquivos
                </TabsTrigger>
                <TabsTrigger 
                  value="text" 
                  className="pb-2 pt-1 px-0 data-[state=active]:border-b-2 data-[state=active]:border-[#9F85FF] data-[state=active]:text-[#9F85FF] text-gray-500 bg-transparent font-medium rounded-none"
                >
                  Adicionar texto
                </TabsTrigger>
                <TabsTrigger 
                  value="modelos" 
                  data-value="modelos"
                  className="pb-2 pt-1 px-0 data-[state=active]:border-b-2 data-[state=active]:border-[#9F85FF] data-[state=active]:text-[#9F85FF] text-gray-500 bg-transparent font-medium rounded-none"
                >
                  Modelos prontos
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="upload" className="mt-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Drop Area */}
                  <div className="lg:w-2/3">
                    <div 
                      className={`border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center min-h-[300px] transition-colors
                      ${dragActive 
                        ? 'border-[#9F85FF] bg-[#F5F2FF]' 
                        : 'border-gray-300 hover:border-[#9F85FF] hover:bg-[#F9F8FF]'
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <div className="p-4 rounded-full bg-[#F0EBFF] mb-6 text-[#9F85FF]">
                        <Upload className="h-8 w-8" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Arraste e solte seus documentos</h3>
                      <p className="text-gray-500 text-center mb-6">
                        Arraste documentos para esta área ou clique para fazer upload
                      </p>
                      <p className="text-xs text-gray-400 mb-4">
                        Formatos suportados: PDF, DOCX
                      </p>
                      <Button className="bg-[#9F85FF] hover:bg-[#8A6EF3]">
                        Selecionar arquivos
                      </Button>
                      <input type="file" className="hidden" multiple accept=".pdf,.docx,.doc" />
                    </div>
                  </div>

                  {/* Tips and Info */}
                  <div className="lg:w-1/3">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Dicas para upload</h3>
                      
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-medium text-gray-700 mb-1">Formatos aceitos</h4>
                          <p className="text-sm text-gray-600">
                            Nossa plataforma aceita arquivos PDF e documentos do Word (DOCX, DOC).
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-700 mb-1">Tamanho máximo</h4>
                          <p className="text-sm text-gray-600">
                            O limite de tamanho por arquivo é de 25MB.
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-700 mb-1">Documentos legíveis</h4>
                          <p className="text-sm text-gray-600">
                            Para melhor análise, certifique-se de que os documentos sejam legíveis, preferencialmente no formato digital nativo e não escaneados.
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-700 mb-1">Segurança</h4>
                          <p className="text-sm text-gray-600">
                            Todos os documentos são processados com segurança e criptografados em nosso sistema.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Warning Notice */}
                    <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <div className="mr-3 text-amber-500">
                          <AlertCircle className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm text-amber-800">
                            <span className="font-medium">Lembre-se:</span> A análise da IA é uma ferramenta auxiliar. Sempre revise as informações e recomendações antes de tomar decisões jurídicas.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="text" className="mt-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Adicionar Texto para Análise</h3>
                  <p className="text-gray-600 mb-4">Cole o texto jurídico que deseja analisar no campo abaixo:</p>
                  
                  <div className="mb-4">
                    <textarea 
                      className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9F85FF] focus:border-transparent"
                      placeholder="Cole ou digite o texto jurídico aqui..."
                    ></textarea>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button className="bg-[#9F85FF] hover:bg-[#8A6EF3]">
                      Analisar Texto
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="modelos" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Contrato de Honorários */}
                  <div className={`bg-white rounded-lg border ${selectedTemplate === 'contrato-honorarios' ? 'border-[#9F85FF] shadow-md' : 'border-gray-200'} overflow-hidden hover:border-[#9F85FF] hover:shadow-md transition-all`}>
                    <div className="p-6">
                      <div className="w-12 h-12 bg-[#F5F2FF] rounded-lg flex items-center justify-center mb-4">
                        <FileText className="h-6 w-6 text-[#9F85FF]" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Contrato de Honorários</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Modelo padrão de contrato de honorários advocatícios, com cláusulas essenciais e personalizáveis.
                      </p>
                      <Button 
                        className={selectedTemplate === 'contrato-honorarios' ? 'bg-[#9F85FF] w-full' : 'bg-gray-100 text-gray-800 hover:bg-gray-200 w-full'}
                        onClick={() => setSelectedTemplate('contrato-honorarios')}
                      >
                        {selectedTemplate === 'contrato-honorarios' ? 'Selecionado' : 'Selecionar modelo'}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Procuração Ad Judicia */}
                  <div className={`bg-white rounded-lg border ${selectedTemplate === 'procuracao' ? 'border-[#9F85FF] shadow-md' : 'border-gray-200'} overflow-hidden hover:border-[#9F85FF] hover:shadow-md transition-all`}>
                    <div className="p-6">
                      <div className="w-12 h-12 bg-[#F5F2FF] rounded-lg flex items-center justify-center mb-4">
                        <FileText className="h-6 w-6 text-[#9F85FF]" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Procuração Ad Judicia</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Modelo de procuração Ad Judicia para representação em processos judiciais com poderes da cláusula ad judicia.
                      </p>
                      <Button 
                        className={selectedTemplate === 'procuracao' ? 'bg-[#9F85FF] w-full' : 'bg-gray-100 text-gray-800 hover:bg-gray-200 w-full'}
                        onClick={() => setSelectedTemplate('procuracao')}
                      >
                        {selectedTemplate === 'procuracao' ? 'Selecionado' : 'Selecionar modelo'}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Petição de Juntada */}
                  <div className={`bg-white rounded-lg border ${selectedTemplate === 'juntada' ? 'border-[#9F85FF] shadow-md' : 'border-gray-200'} overflow-hidden hover:border-[#9F85FF] hover:shadow-md transition-all`}>
                    <div className="p-6">
                      <div className="w-12 h-12 bg-[#F5F2FF] rounded-lg flex items-center justify-center mb-4">
                        <FileText className="h-6 w-6 text-[#9F85FF]" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Petição de Juntada</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Modelo de petição para juntada de documentos em processos judiciais em andamento.
                      </p>
                      <Button 
                        className={selectedTemplate === 'juntada' ? 'bg-[#9F85FF] w-full' : 'bg-gray-100 text-gray-800 hover:bg-gray-200 w-full'}
                        onClick={() => setSelectedTemplate('juntada')}
                      >
                        {selectedTemplate === 'juntada' ? 'Selecionado' : 'Selecionar modelo'}
                      </Button>
                    </div>
                  </div>
                </div>
                
                {selectedTemplate && (
                  <div className="mt-8 flex justify-end">
                    <Button 
                      className="bg-[#9F85FF] hover:bg-[#8A6EF3]"
                      onClick={loadTemplateText}
                    >
                      Usar modelo selecionado
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </main>
      </div>
    </div>
  );
}