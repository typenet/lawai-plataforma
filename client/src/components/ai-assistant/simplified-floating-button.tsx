import { useState } from "react";
import { Bot, X, Send, User, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type MessageRole = "user" | "assistant" | "action";

interface ChatMessage {
  role: MessageRole;
  content: string;
}

export default function SimplifiedFloatingButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { role: "assistant", content: "Olá! Sou a assistente virtual da JurisIA. Como posso ajudar você hoje?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const toggleAssistant = () => {
    setIsOpen(!isOpen);
  };

  // Função para lidar com a ação de procuração
  const handleProcuracaoAction = () => {
    // Simular busca do cliente na base
    const clienteEncontrado = {
      nome: "Maria Silva Santos",
      cpf: "218.320.908-92",
      endereco: "Rua Doutor Paulo De Queiroz, 790",
      cidade: "São Paulo",
      estado: "SP"
    };

    // Resposta com a procuração gerada
    setChatHistory(prev => [
      ...prev,
      { 
        role: "assistant", 
        content: `✅ Procuração gerada com sucesso para o cliente:\n\n**Nome:** ${clienteEncontrado.nome}\n**CPF:** ${clienteEncontrado.cpf}\n**Endereço:** ${clienteEncontrado.endereco}, ${clienteEncontrado.cidade}/${clienteEncontrado.estado}\n\nVocê pode baixar a procuração completa em formato PDF ou solicitar outras ações.`
      }
    ]);
    
    // Adicionar o botão de download após um pequeno delay
    setTimeout(() => {
      setChatHistory(prev => [
        ...prev,
        {
          role: "action",
          content: "Baixar procuração em PDF"
        }
      ]);
    }, 500);
  };
  
  // Função para lidar com o download do PDF
  const handleDownloadPDF = () => {
    // Simular a preparação e download do arquivo
    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      setChatHistory(prev => [
        ...prev,
        {
          role: "assistant",
          content: "📄 O download da procuração foi iniciado. O documento será aberto em uma nova aba."
        }
      ]);
      
      // Criar um documento fictício para download
      const conteudoProcuracao = `
PROCURAÇÃO

OUTORGANTE: MARIA SILVA SANTOS, brasileira, portadora do CPF nº 218.320.908-92, 
residente e domiciliada à Rua Doutor Paulo De Queiroz, 790, São Paulo/SP.

OUTORGADO: [NOME DO ADVOGADO], [nacionalidade], advogado, inscrito na OAB/XX sob nº XXXXX, 
com escritório profissional localizado à [ENDEREÇO COMPLETO].

PODERES: Por este instrumento particular de procuração, a outorgante nomeia e constitui o outorgado 
como seu procurador, conferindo-lhe poderes para o foro em geral, com a cláusula "ad judicia et extra", 
em qualquer Juízo, Instância ou Tribunal, podendo propor contra quem de direito as ações competentes 
e defendê-la nas contrárias, seguindo umas e outras, até final decisão, usando os recursos legais 
e acompanhando-os, conferindo-lhe, ainda, poderes especiais para confessar, desistir, transigir, 
firmar compromissos ou acordos, receber e dar quitação, agindo em conjunto ou separadamente.

São Paulo, ${new Date().toLocaleDateString('pt-BR')}.


____________________________________
MARIA SILVA SANTOS
CPF: 218.320.908-92
      `;
      
      // Criar um objeto Blob com o conteúdo do documento
      const blob = new Blob([conteudoProcuracao], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      // Criar um link de download e clicar automaticamente
      const a = document.createElement('a');
      a.href = url;
      a.download = `Procuracao_Maria_Silva_Santos_${new Date().toISOString().slice(0,10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Limpar o objeto URL após o download
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    }, 1500);
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;

    // Adicionar mensagem do usuário ao histórico
    setChatHistory([...chatHistory, { role: "user", content: message }]);
    setMessage("");
    setIsTyping(true);

    // Simular resposta da IA
    setTimeout(() => {
      const aiResponses = {
        pesquisa: "Posso ajudar você a encontrar jurisprudência, doutrina ou legislação sobre qualquer tópico jurídico. Basta me dizer qual assunto você está pesquisando.",
        documento: "Posso analisar seus documentos jurídicos, identificar problemas potenciais e sugerir melhorias. Você pode fazer upload de contratos, petições ou outros documentos para análise.",
        prazo: "Para calcular prazos processuais, preciso saber a data inicial, o tipo de processo e o tribunal. Posso ajudar com cálculos precisos para você não perder nenhum prazo.",
        default: "Estou aqui para ajudar com pesquisas jurídicas, análise de documentos, cálculo de prazos e muito mais. Como posso auxiliar você especificamente hoje?",
      };
      
      let responseContent = aiResponses.default;
      
      // Identificar palavras-chave na mensagem do usuário
      const lowerInput = message.toLowerCase();
      if (lowerInput.includes("pesquisa") || lowerInput.includes("encontrar") || lowerInput.includes("buscar")) {
        responseContent = aiResponses.pesquisa;
      } else if (lowerInput.includes("documento") || lowerInput.includes("contrato") || lowerInput.includes("petição")) {
        responseContent = aiResponses.documento;
      } else if (lowerInput.includes("prazo") || lowerInput.includes("data") || lowerInput.includes("processo")) {
        responseContent = aiResponses.prazo;
      } else if (lowerInput.includes("procuração") || lowerInput.includes("procuracao")) {
        if (lowerInput.includes("21832") || lowerInput.includes("218320908") || 
            lowerInput.includes("cpf") || lowerInput.includes("cliente")) {
          
          // Mensagem de processamento
          setChatHistory(prev => [
            ...prev, 
            { 
              role: "assistant", 
              content: "Posso gerar uma procuração usando os dados do cliente. Clique no botão abaixo:"
            }
          ]);
          
          // Adicionar botão de ação após um pequeno delay
          setTimeout(() => {
            setChatHistory(prev => [
              ...prev, 
              { 
                role: "action", 
                content: "Monte uma procuração com os dados do cliente de cpf 218320908-92 que está gravado em minha base de dados"
              }
            ]);
            setIsTyping(false);
          }, 500);
          
          return;
        } else {
          responseContent = "Para gerar uma procuração, preciso do CPF ou nome do cliente. Você pode me fornecer essas informações?";
        }
      }

      setChatHistory(prev => [...prev, { role: "assistant", content: responseContent }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <>
      {/* Botão flutuante */}
      <Button
        onClick={toggleAssistant}
        className={`fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg flex items-center justify-center p-0 z-50 transition-all duration-300 ${
          isOpen ? "bg-red-500 hover:bg-red-600" : "bg-[#9F85FF] hover:bg-[#8A6EF3]"
        }`}
        aria-label={isOpen ? "Fechar assistente" : "Abrir assistente IA"}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Bot className="h-6 w-6" />
        )}
      </Button>

      {/* Chat Dialog */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[350px] sm:w-[400px] bg-white rounded-xl shadow-xl border border-gray-200 flex flex-col overflow-hidden z-50">
          {/* Header */}
          <div className="bg-[#9F85FF] text-white p-4 flex justify-between items-center">
            <div className="flex items-center">
              <Bot className="h-5 w-5 mr-2" />
              <h3 className="font-semibold">Assistente LawAI</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-[#8A6EF3]"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: "350px" }}>
            {chatHistory.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "action" ? (
                  <div className="w-full max-w-[80%]">
                    <Button 
                      className="w-full bg-[#9F85FF] hover:bg-[#8A6EF3] text-white flex items-center justify-center p-3"
                      onClick={msg.content.includes("Baixar") ? handleDownloadPDF : handleProcuracaoAction}
                    >
                      {msg.content.includes("Baixar") ? (
                        <FileText className="h-4 w-4 mr-2" />
                      ) : (
                        <User className="h-4 w-4 mr-2" />
                      )}
                      {msg.content}
                    </Button>
                  </div>
                ) : (
                  <div
                    className={`flex max-w-[80%] ${
                      msg.role === "user" 
                        ? "bg-[#9F85FF] text-white rounded-l-xl rounded-tr-xl" 
                        : "bg-[#F8F6FF] text-gray-800 rounded-r-xl rounded-tl-xl"
                    } p-3`}
                  >
                    <div className="mr-2 mt-1">
                      {msg.role === "user" ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm whitespace-pre-line">{msg.content}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-500 rounded-r-xl rounded-tl-xl p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "100ms" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "200ms" }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Input Area */}
          <div className="border-t p-3">
            <div className="flex space-x-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Digite uma mensagem..."
                className="flex-1"
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!message.trim()}
                size="icon"
                className="bg-[#9F85FF] hover:bg-[#8A6EF3]"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-2 text-xs text-center text-gray-400">
              Assistente IA para auxílio jurídico
            </div>
          </div>
        </div>
      )}
    </>
  );
}