import { useState, useRef, useEffect } from "react";
import { Send, FileText, Sparkles, X, AlertCircle, CheckCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface LegalWritingAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  initialText?: string;
}

interface Suggestion {
  id: string;
  type: "grammar" | "style" | "legal" | "structure";
  originalText: string;
  suggestedText: string;
  explanation: string;
  severity: "high" | "medium" | "low";
}

export default function LegalWritingAssistant({ 
  isOpen, 
  onClose,
  initialText = ""
}: LegalWritingAssistantProps) {
  const [text, setText] = useState(initialText);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState("editor");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [documentType, setDocumentType] = useState<string>("general");
  const [focusMode, setFocusMode] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);
  
  useEffect(() => {
    if (initialText && initialText !== text) {
      setText(initialText);
    }
  }, [initialText]);

  // Detecta automaticamente o tipo de documento com base no conteúdo
  useEffect(() => {
    if (!text) return;
    
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes("contrato") || lowerText.includes("cláusula") || 
        lowerText.includes("partes") || lowerText.includes("celebram")) {
      setDocumentType("contract");
    } else if (lowerText.includes("excelentíssimo") || lowerText.includes("meritíssimo") || 
               lowerText.includes("petição") || lowerText.includes("requer")) {
      setDocumentType("petition");
    } else if (lowerText.includes("procuração") || lowerText.includes("outorgante") || 
               lowerText.includes("outorgado") || lowerText.includes("poderes")) {
      setDocumentType("power_of_attorney");
    } else {
      setDocumentType("general");
    }
  }, [text]);

  const analyzeText = async () => {
    if (!text.trim()) {
      toast({
        title: "Texto vazio",
        description: "Por favor, insira algum texto para analisar.",
        variant: "destructive",
      });
      return;
    }
    
    setIsAnalyzing(true);
    
    try {
      // Simulação de análise - em produção, este seria um chamado à API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Exemplos de sugestões baseadas no tipo de documento
      const mockSuggestions: Suggestion[] = [];
      
      if (documentType === "contract") {
        mockSuggestions.push({
          id: "1",
          type: "legal",
          originalText: "As partes concordam com os termos.",
          suggestedText: "As partes, de comum acordo, obrigam-se a cumprir fielmente os termos e condições estabelecidos neste instrumento.",
          explanation: "Linguagem mais formal e precisa para contratos.",
          severity: "medium"
        });
        mockSuggestions.push({
          id: "2",
          type: "structure",
          originalText: "",
          suggestedText: "Considere adicionar uma cláusula sobre foro competente para resolução de conflitos.",
          explanation: "Contratos geralmente precisam definir qual jurisdição será responsável em caso de disputas.",
          severity: "high"
        });
      } else if (documentType === "petition") {
        mockSuggestions.push({
          id: "3",
          type: "style",
          originalText: "Venho por meio desta pedir que...",
          suggestedText: "Respeitosamente requer a Vossa Excelência que...",
          explanation: "Linguagem mais formal e adequada para petições judiciais.",
          severity: "medium"
        });
        mockSuggestions.push({
          id: "4",
          type: "legal",
          originalText: "",
          suggestedText: "Considere mencionar os precedentes relevantes que fundamentam seu pedido.",
          explanation: "Petições são mais efetivas quando citam jurisprudência aplicável.",
          severity: "medium"
        });
      } else {
        // Sugestões genéricas
        mockSuggestions.push({
          id: "5",
          type: "grammar",
          originalText: "Os documentos anexo",
          suggestedText: "Os documentos anexos",
          explanation: "Concordância nominal correta.",
          severity: "medium"
        });
        mockSuggestions.push({
          id: "6",
          type: "style",
          originalText: "",
          suggestedText: "Considere usar linguagem mais técnica e formal para documentos jurídicos.",
          explanation: "A linguagem jurídica requer formalidade e precisão.",
          severity: "low"
        });
      }
      
      setSuggestions(mockSuggestions);
      setActiveTab("suggestions");
      
    } catch (error) {
      toast({
        title: "Erro na análise",
        description: "Não foi possível analisar o texto. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applySuggestion = (suggestion: Suggestion) => {
    if (!suggestion.originalText) {
      // É uma sugestão geral sem texto específico para substituir
      toast({
        title: "Sugestão aplicada",
        description: "Esta é uma recomendação geral. Aplique manualmente ao seu texto.",
      });
      return;
    }
    
    const newText = text.replace(suggestion.originalText, suggestion.suggestedText);
    setText(newText);
    
    // Remover a sugestão aplicada da lista
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
    
    toast({
      title: "Sugestão aplicada",
      description: "O texto foi atualizado com a sugestão.",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-[90vw] max-w-4xl h-[80vh] flex flex-col overflow-hidden">
        {/* Cabeçalho */}
        <div className="bg-navy text-white p-4 flex justify-between items-center">
          <div className="flex items-center">
            <Sparkles className="h-5 w-5 mr-2" />
            <h3 className="font-semibold">Assistente de Redação Jurídica</h3>
            <span className="ml-2 text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full">
              IA Contextual
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-navy-light"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Conteúdo Principal */}
        <Tabs defaultValue="editor" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="border-b px-4">
            <TabsList className="h-12">
              <TabsTrigger value="editor" className="data-[state=active]:text-navy">
                Editor
              </TabsTrigger>
              <TabsTrigger value="suggestions" className="data-[state=active]:text-navy">
                Sugestões {suggestions.length > 0 && `(${suggestions.length})`}
              </TabsTrigger>
              <TabsTrigger value="help" className="data-[state=active]:text-navy">
                Ajuda
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Aba do Editor */}
          <TabsContent value="editor" className="flex-1 p-4 overflow-auto">
            <div className={`h-full flex flex-col ${focusMode ? 'max-w-2xl mx-auto' : ''}`}>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {documentType === "contract" && "Contrato Detectado"}
                    {documentType === "petition" && "Petição Detectada"}
                    {documentType === "power_of_attorney" && "Procuração Detectada"}
                    {documentType === "general" && "Documento Jurídico"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Digite ou cole seu texto para receber sugestões de melhoria
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFocusMode(!focusMode)}
                    className="text-xs"
                  >
                    {focusMode ? "Sair do modo foco" : "Modo foco"}
                  </Button>
                </div>
              </div>
              
              <Textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Digite ou cole seu texto jurídico aqui para análise..."
                className="flex-1 min-h-[300px] p-4 text-md leading-relaxed resize-none focus:ring-navy"
              />
              
              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  {text ? `${text.split(/\s+/).filter(Boolean).length} palavras` : "0 palavras"}
                </div>
                <Button 
                  onClick={analyzeText}
                  disabled={isAnalyzing || !text.trim()}
                  className="bg-navy hover:bg-navy-light"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Analisando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Analisar texto
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
          
          {/* Aba de Sugestões */}
          <TabsContent value="suggestions" className="flex-1 p-4 overflow-auto">
            {suggestions.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <FileText className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma sugestão ainda
                </h3>
                <p className="text-sm text-gray-500 max-w-md mb-6">
                  Para receber sugestões de melhorias, escreva ou cole seu texto jurídico na aba Editor e clique em Analisar.
                </p>
                <Button
                  onClick={() => setActiveTab("editor")}
                  className="bg-navy hover:bg-navy-light"
                >
                  Ir para o Editor
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium text-gray-900">
                    Sugestões para seu texto
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setActiveTab("editor");
                      setSuggestions([]);
                    }}
                    className="text-xs"
                  >
                    Limpar sugestões
                  </Button>
                </div>
                
                {suggestions.map((suggestion) => (
                  <Card key={suggestion.id} className="relative overflow-hidden">
                    <div 
                      className={`absolute top-0 left-0 w-1 h-full
                        ${suggestion.severity === 'high' ? 'bg-red-500' : 
                          suggestion.severity === 'medium' ? 'bg-amber-500' : 
                          'bg-blue-500'}`}
                    />
                    <CardContent className="p-4 pl-6">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium mr-2
                            ${suggestion.type === 'grammar' ? 'bg-red-100 text-red-800' :
                              suggestion.type === 'style' ? 'bg-blue-100 text-blue-800' :
                              suggestion.type === 'legal' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'}`}
                          >
                            {suggestion.type === 'grammar' && 'Gramática'}
                            {suggestion.type === 'style' && 'Estilo'}
                            {suggestion.type === 'legal' && 'Jurídico'}
                            {suggestion.type === 'structure' && 'Estrutura'}
                          </span>
                          <span className="text-sm font-medium text-gray-700">
                            {suggestion.severity === 'high' && 'Alta prioridade'}
                            {suggestion.severity === 'medium' && 'Média prioridade'}
                            {suggestion.severity === 'low' && 'Baixa prioridade'}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          className="bg-[#9F85FF] hover:bg-[#8A6EF3] h-8"
                          onClick={() => applySuggestion(suggestion)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Aplicar
                        </Button>
                      </div>
                      
                      {suggestion.originalText && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-500 mb-1">Texto original:</p>
                          <div className="p-2 bg-red-50 text-red-800 rounded border border-red-200 text-sm">
                            {suggestion.originalText}
                          </div>
                        </div>
                      )}
                      
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-1">Sugestão:</p>
                        <div className="p-2 bg-green-50 text-green-800 rounded border border-green-200 text-sm">
                          {suggestion.suggestedText}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Explicação:</p>
                        <p className="text-sm text-gray-700">
                          {suggestion.explanation}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          {/* Aba de Ajuda */}
          <TabsContent value="help" className="flex-1 p-4 overflow-auto">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Como usar o Assistente de Redação Jurídica
              </h3>
              
              <div className="space-y-4">
                <div className="border rounded-md p-4">
                  <h4 className="font-medium text-[#9F85FF] mb-2">Detecção automática de documento</h4>
                  <p className="text-sm text-gray-700">
                    O assistente detecta automaticamente o tipo de documento que você está escrevendo (contrato, petição, procuração) e oferece sugestões específicas para cada tipo.
                  </p>
                </div>
                
                <div className="border rounded-md p-4">
                  <h4 className="font-medium text-[#9F85FF] mb-2">Análise contextual</h4>
                  <p className="text-sm text-gray-700">
                    Receba sugestões personalizadas sobre gramática, estilo, terminologia jurídica e estrutura, considerando o contexto legal específico do seu documento.
                  </p>
                </div>
                
                <div className="border rounded-md p-4">
                  <h4 className="font-medium text-[#9F85FF] mb-2">Aplicação das sugestões</h4>
                  <p className="text-sm text-gray-700">
                    Você pode aplicar as sugestões com um clique, o que automaticamente atualiza seu texto. Sugestões estruturais podem exigir edição manual.
                  </p>
                </div>
                
                <div className="border rounded-md p-4">
                  <h4 className="font-medium text-[#9F85FF] mb-2">Dicas para melhores resultados</h4>
                  <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
                    <li>Forneça contexto suficiente para análise mais precisa</li>
                    <li>Use terminologia jurídica apropriada para seu caso</li>
                    <li>Revise manualmente o texto após aplicar as sugestões</li>
                    <li>Para documentos extensos, analise por seções</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-md">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-amber-800 mb-1">Importante</h4>
                    <p className="text-sm text-amber-700">
                      Este assistente oferece sugestões baseadas em IA, mas não substitui a revisão profissional. Sempre verifique o conteúdo jurídico e a aplicabilidade das sugestões ao seu caso específico.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}