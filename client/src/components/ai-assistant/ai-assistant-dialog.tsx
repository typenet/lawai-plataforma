import { useState, useRef, useEffect } from "react";
import { Send, User, Bot, FileText, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Importando os módulos CSS necessários
import "@/index.css";

interface AIAssistantDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
}

export default function AIAssistantDialog({ isOpen, onClose }: AIAssistantDialogProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "ai",
      content: "Olá! Sou a assistente virtual da JurisIA. Como posso ajudar você hoje?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [messages, isOpen]);

  const handleSendMessage = () => {
    if (!input.trim()) return;
    
    // Adicionar mensagem do usuário
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    
    // Simular resposta da IA
    setTimeout(() => {
      const aiResponses: Record<string, string> = {
        pesquisa: "Posso ajudar você a encontrar jurisprudência, doutrina ou legislação sobre qualquer tópico jurídico. Basta me dizer qual assunto você está pesquisando.",
        documento: "Posso analisar seus documentos jurídicos, identificar problemas potenciais e sugerir melhorias. Você pode fazer upload de contratos, petições ou outros documentos para análise.",
        prazo: "Para calcular prazos processuais, preciso saber a data inicial, o tipo de processo e o tribunal. Posso ajudar com cálculos precisos para você não perder nenhum prazo.",
        default: "Estou aqui para ajudar com pesquisas jurídicas, análise de documentos, cálculo de prazos e muito mais. Como posso auxiliar você especificamente hoje?",
      };
      
      let responseContent = aiResponses.default;
      
      // Identificar palavras-chave na mensagem do usuário
      const lowerInput = input.toLowerCase();
      if (lowerInput.includes("pesquisa") || lowerInput.includes("encontrar") || lowerInput.includes("buscar")) {
        responseContent = aiResponses.pesquisa;
      } else if (lowerInput.includes("documento") || lowerInput.includes("contrato") || lowerInput.includes("petição")) {
        responseContent = aiResponses.documento;
      } else if (lowerInput.includes("prazo") || lowerInput.includes("data") || lowerInput.includes("processo")) {
        responseContent = aiResponses.prazo;
      }
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: responseContent,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-6 w-[360px] sm:w-[420px] bg-white rounded-xl shadow-xl border border-gray-200 flex flex-col overflow-hidden transition-all duration-300 z-50">
      {/* Cabeçalho */}
      <div className="bg-navy text-white p-4 flex justify-between items-center">
        <div className="flex items-center">
          <Sparkles className="h-5 w-5 mr-2" />
          <h3 className="font-semibold">Assistente Jurídico IA</h3>
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
      
      {/* Abas */}
      <Tabs defaultValue="chat" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-3 px-2 pt-2">
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="docs">Documentos</TabsTrigger>
          <TabsTrigger value="help">Ajuda</TabsTrigger>
        </TabsList>
        
        {/* Aba do Chat */}
        <TabsContent value="chat" className="flex-1 flex flex-col data-[state=active]:flex-1">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex max-w-[80%] ${
                    message.type === "user" 
                      ? "bg-navy text-white rounded-l-xl rounded-tr-xl" 
                      : "bg-gray-100 text-navy rounded-r-xl rounded-tl-xl"
                  } p-3`}
                >
                  <div className="mr-2 mt-1">
                    {message.type === "user" ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-500 rounded-r-xl rounded-tl-xl p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          <div className="border-t p-3">
            <div className="flex space-x-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite uma mensagem..."
                className="flex-1"
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!input.trim()}
                size="icon"
                className="bg-navy hover:bg-navy-light"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </TabsContent>
        
        {/* Aba de Documentos */}
        <TabsContent value="docs" className="flex-1 p-4">
          <div className="text-center p-6 space-y-4">
            <FileText className="h-12 w-12 mx-auto text-navy opacity-50" />
            <h3 className="font-medium text-lg">Carregue um documento</h3>
            <p className="text-sm text-neutral-dark">
              Faça upload de um documento jurídico para analisá-lo com IA
            </p>
            <Button className="bg-navy hover:bg-navy-light w-full">
              Selecionar Arquivo
            </Button>
          </div>
        </TabsContent>
        
        {/* Aba de Ajuda */}
        <TabsContent value="help" className="flex-1 p-4 overflow-y-auto">
          <h3 className="font-medium text-lg mb-3">Como posso ajudar?</h3>
          
          <div className="space-y-4">
            <div className="border rounded-lg p-3">
              <h4 className="font-medium text-navy">Pesquisa Jurídica</h4>
              <p className="text-sm text-neutral-dark mt-1">
                Posso encontrar jurisprudência, doutrina e legislação sobre qualquer tema jurídico.
              </p>
            </div>
            
            <div className="border rounded-lg p-3">
              <h4 className="font-medium text-navy">Análise de Documentos</h4>
              <p className="text-sm text-neutral-dark mt-1">
                Faça upload de documentos para análise e receba insights jurídicos.
              </p>
            </div>
            
            <div className="border rounded-lg p-3">
              <h4 className="font-medium text-navy">Cálculo de Prazos</h4>
              <p className="text-sm text-neutral-dark mt-1">
                Calcule prazos processuais para diferentes tipos de processos e tribunais.
              </p>
            </div>
            
            <div className="border rounded-lg p-3">
              <h4 className="font-medium text-navy">Redação Jurídica</h4>
              <p className="text-sm text-neutral-dark mt-1">
                Receba sugestões para melhorar a redação de documentos jurídicos.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}