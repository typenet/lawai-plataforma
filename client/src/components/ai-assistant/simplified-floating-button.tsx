import { useState } from "react";
import { Bot, X, Send, User, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { jsPDF } from "jspdf";

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
  
  // Sistema de geração de documentos jurídicos
  interface Cliente {
    nome: string;
    cpf: string;
    endereco: string;
    cidade: string;
    estado: string;
  }

  // Função para gerar PDF de procuração
  const gerarProcuracaoPDF = () => {
    const cliente = {
      nome: "MARIA SILVA SANTOS",
      cpf: "218.320.908-92",
      endereco: "Rua Doutor Paulo De Queiroz, 790",
      cidade: "São Paulo",
      estado: "SP"
    };
    
    // Criar um novo documento PDF
    const doc = new jsPDF();
    
    // Adicionar marca d'água de fundo
    doc.setFontSize(60);
    doc.setTextColor(230, 230, 230);
    doc.text("LAWAI", 105, 150, { align: "center" });
    
    // Configurar fonte para o título
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    
    // Título centralizado
    doc.text("PROCURAÇÃO", 105, 20, { align: "center" });
    
    // Configurar fonte para o texto
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    
    // Configuração de página e parágrafos
    const pageWidth = doc.internal.pageSize.getWidth();
    const addParagraph = (text: string, startX: number, startY: number, maxWidth: number): number => {
      const splitText = doc.splitTextToSize(text, maxWidth);
      doc.text(splitText, startX, startY);
      return startY + (splitText.length * 8);
    };
    
    // Posição inicial
    let posY = 40;
    
    // Conteúdo da procuração
    posY = addParagraph(`OUTORGANTE: ${cliente.nome}, brasileiro(a), portador(a) do CPF nº ${cliente.cpf}, residente e domiciliado(a) à ${cliente.endereco}, ${cliente.cidade}/${cliente.estado}.`, 20, posY, pageWidth - 40);
    posY += 15;
    
    posY = addParagraph("OUTORGADO: [NOME DO ADVOGADO], [nacionalidade], advogado(a), inscrito(a) na OAB/XX sob nº XXXXX, com escritório profissional localizado à [ENDEREÇO COMPLETO].", 20, posY, pageWidth - 40);
    posY += 15;
    
    posY = addParagraph("PODERES: Por este instrumento particular de procuração, o(a) outorgante nomeia e constitui o(a) outorgado(a) como seu(sua) procurador(a), conferindo-lhe poderes para o foro em geral, com a cláusula \"ad judicia et extra\", em qualquer Juízo, Instância ou Tribunal, podendo propor contra quem de direito as ações competentes e defendê-lo(a) nas contrárias, seguindo umas e outras, até final decisão, usando os recursos legais e acompanhando-os, conferindo-lhe, ainda, poderes especiais para confessar, desistir, transigir, firmar compromissos ou acordos, receber e dar quitação, agindo em conjunto ou separadamente.", 20, posY, pageWidth - 40);
    posY += 25;
    
    // Data
    doc.text(`${cliente.cidade}, ${new Date().toLocaleDateString('pt-BR')}.`, 20, posY);
    posY += 40;
    
    // Assinatura
    doc.text("____________________________________", 20, posY);
    posY += 10;
    doc.text(`${cliente.nome}`, 20, posY);
    posY += 8;
    doc.text(`CPF: ${cliente.cpf}`, 20, posY);
    
    // Salvar PDF
    doc.save(`Procuracao_${cliente.nome.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.pdf`);
    
    // Adicionar mensagem no chat
    setChatHistory(prev => [
      ...prev,
      {
        role: "assistant",
        content: "📄 O download da procuração foi iniciado. O documento será salvo em formato PDF."
      }
    ]);
  };
  
  // Função para gerar PDF de contrato de locação
  const gerarContratoLocacaoPDF = () => {
    const cliente = {
      nome: "MARIA SILVA SANTOS",
      cpf: "218.320.908-92",
      endereco: "Rua Doutor Paulo De Queiroz, 790",
      cidade: "São Paulo",
      estado: "SP"
    };
    
    // Criar um novo documento PDF
    const doc = new jsPDF();
    
    // Adicionar marca d'água de fundo
    doc.setFontSize(60);
    doc.setTextColor(230, 230, 230);
    doc.text("LAWAI", 105, 150, { align: "center" });
    
    // Configurar fonte para o título
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    
    // Título centralizado
    doc.text("CONTRATO DE LOCAÇÃO DE IMÓVEL", 105, 20, { align: "center" });
    
    // Configurar fonte para o texto
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    
    // Configuração de página e parágrafos
    const pageWidth = doc.internal.pageSize.getWidth();
    const addParagraph = (text: string, startX: number, startY: number, maxWidth: number): number => {
      const splitText = doc.splitTextToSize(text, maxWidth);
      doc.text(splitText, startX, startY);
      return startY + (splitText.length * 8);
    };
    
    // Posição inicial
    let posY = 40;
    
    // Conteúdo do contrato
    posY = addParagraph("LOCADOR: [NOME COMPLETO DO LOCADOR], [qualificação completa].", 20, posY, pageWidth - 40);
    posY += 15;
    
    posY = addParagraph(`LOCATÁRIO: ${cliente.nome}, brasileiro(a), portador(a) do CPF nº ${cliente.cpf}, residente e domiciliado(a) à ${cliente.endereco}, ${cliente.cidade}/${cliente.estado}.`, 20, posY, pageWidth - 40);
    posY += 15;
    
    posY = addParagraph("OBJETO: O LOCADOR, sendo proprietário do imóvel situado à [ENDEREÇO COMPLETO DO IMÓVEL], loca-o ao LOCATÁRIO, mediante as cláusulas e condições seguintes:", 20, posY, pageWidth - 40);
    posY += 15;
    
    posY = addParagraph("CLÁUSULA PRIMEIRA - PRAZO: A presente locação é feita pelo prazo de [PRAZO] meses, iniciando-se em [DATA DE INÍCIO] e terminando em [DATA DE TÉRMINO], data em que o LOCATÁRIO se obriga a restituir o imóvel locado completamente desocupado, no estado em que o recebeu, independentemente de notificação ou interpelação judicial.", 20, posY, pageWidth - 40);
    posY += 15;
    
    posY = addParagraph("CLÁUSULA SEGUNDA - ALUGUEL: O aluguel mensal é de R$ [VALOR] que o LOCATÁRIO se compromete a pagar pontualmente até o dia [DIA] de cada mês.", 20, posY, pageWidth - 40);
    posY += 25;
    
    // Data
    doc.text(`${cliente.cidade}, ${new Date().toLocaleDateString('pt-BR')}.`, 20, posY);
    posY += 40;
    
    // Assinatura
    doc.text("____________________________________", 20, posY);
    posY += 10;
    doc.text(`${cliente.nome}`, 20, posY);
    posY += 8;
    doc.text(`CPF: ${cliente.cpf}`, 20, posY);
    
    // Salvar PDF
    doc.save(`Contrato_Locacao_${cliente.nome.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.pdf`);
    
    // Adicionar mensagem no chat
    setChatHistory(prev => [
      ...prev,
      {
        role: "assistant",
        content: "📄 O download do contrato de locação foi iniciado. O documento será salvo em formato PDF."
      }
    ]);
  };
  
  // Função genérica para lidar com o download do PDF
  const handleDownloadPDF = () => {
    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      
      // Por padrão geramos uma procuração
      gerarProcuracaoPDF();
    }, 1000);
  };

  // Verificações locais para respostas rápidas
  const checkLocalResponses = (query: string): string | null => {
    const lowerQuery = query.toLowerCase().trim();
    
    // LGPD - Lei Geral de Proteção de Dados
    if (lowerQuery.includes('lgpd') || lowerQuery.includes('lei geral de proteção de dados')) {
      return `A Lei Geral de Proteção de Dados (LGPD) - Lei nº 13.709/2018 - é a legislação brasileira que regula o tratamento de dados pessoais. Seus principais pontos são:

1. Abrangência: Aplica-se a qualquer operação com dados pessoais por pessoa física ou jurídica.
2. Princípios: Finalidade, adequação, necessidade, livre acesso, qualidade, transparência, segurança, prevenção.
3. Bases legais: Consentimento, obrigação legal, legítimo interesse, entre outras.
4. Direitos dos titulares: Acesso, correção, portabilidade, exclusão, revogação de consentimento.
5. Sanções: Advertência, multa (até 2% do faturamento, limitada a R$ 50 milhões por infração).
6. ANPD: Autoridade Nacional de Proteção de Dados é o órgão fiscalizador.`;
    }
    
    // CDC - Código de Defesa do Consumidor
    if (lowerQuery.includes('cdc') || lowerQuery.includes('código de defesa do consumidor')) {
      return `O Código de Defesa do Consumidor (CDC) - Lei nº 8.078/1990 - estabelece normas de proteção do consumidor. Principais aspectos:

1. Princípios: Vulnerabilidade do consumidor, boa-fé objetiva, equilíbrio contratual.
2. Direitos básicos: Proteção à vida e saúde, informação adequada, proteção contra publicidade enganosa.
3. Responsabilidade: Objetiva do fornecedor, independente de culpa.
4. Práticas abusivas: Proibição de condicionamento de venda, elevação injustificada de preços.
5. Proteção contratual: Nulidade de cláusulas abusivas, direito de arrependimento.
6. Inversão do ônus da prova: Quando verossímil a alegação do consumidor.`;
    }
    
    // Contratos
    if (lowerQuery.includes('contrato') && (lowerQuery.includes('locação') || lowerQuery.includes('aluguel'))) {
      return `Um contrato de locação é um documento que formaliza o acordo entre locador (proprietário) e locatário (inquilino), seguindo a Lei do Inquilinato (Lei nº 8.245/91). Elementos essenciais:

1. Identificação das partes (locador e locatário)
2. Descrição do imóvel
3. Prazo de locação
4. Valor do aluguel e forma de reajuste
5. Responsabilidades sobre despesas (IPTU, condomínio)
6. Garantias (fiança, caução, seguro)
7. Multas por descumprimento

Posso ajudar a gerar um contrato de locação para você.`;
    }
    
    // Procuração
    if (lowerQuery.includes('procuração') || lowerQuery.includes('procuracao')) {
      return `Uma procuração é um instrumento pelo qual uma pessoa (outorgante) confere poderes a outra (outorgado) para agir em seu nome. No direito brasileiro, existem diversos tipos:

1. Procuração ad judicia: para representação em processos judiciais
2. Procuração pública: lavrada em cartório
3. Procuração particular: documento privado entre as partes
4. Procuração com poderes específicos: para atos determinados
5. Procuração com poderes gerais: para gestão ampla

Posso ajudar a gerar uma procuração adaptada às suas necessidades.`;
    }
    
    return null;
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    // Adicionar mensagem do usuário ao histórico
    setChatHistory([...chatHistory, { role: "user", content: message }]);
    setMessage("");
    setIsTyping(true);

    // Verificar se temos uma resposta local disponível
    const localResponse = checkLocalResponses(message);
    
    if (localResponse) {
      // Usar resposta local para maior velocidade
      setTimeout(() => {
        setChatHistory(prev => [...prev, { role: "assistant", content: localResponse }]);
        setIsTyping(false);
        
        // Se for resposta sobre documento, adicionar botão de ação
        const lowerMessage = message.toLowerCase();
        if (lowerMessage.includes('procuração') || lowerMessage.includes('procuracao')) {
          setTimeout(() => {
            setChatHistory(prev => [...prev, { 
              role: "action", 
              content: "Monte uma procuração com os dados do cliente de cpf 218320908-92 que está gravado em minha base de dados"
            }]);
          }, 500);
        } else if (lowerMessage.includes('contrato') && (lowerMessage.includes('locação') || lowerMessage.includes('locacao'))) {
          setTimeout(() => {
            setChatHistory(prev => [...prev, { 
              role: "action", 
              content: "Monte um contrato de locação para o cliente de CPF 218320908-92"
            }]);
          }, 500);
        }
      }, 1500);
      return;
    }

    try {
      // Se não tivermos resposta local, consultar a API
      
      // Adicionar mensagem de carregamento para feedback ao usuário
      setTimeout(() => {
        if (isTyping) {
          const pendingMessage = {
            role: "assistant" as MessageRole, 
            content: "Processando sua consulta..."
          };
          setChatHistory(prev => [...prev, pendingMessage]);
        }
      }, 1000);
      
      // Enviar requisição para a API de IA
      const response = await fetch('/api/ai/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query: message,
          context: "assistente jurídico" 
        }),
      });
      
      // Verificar se a resposta é válida
      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`);
      }

      const data = await response.json();
      
      // Verificar se temos uma resposta da API
      if (data.result || data.response) {
        const responseText = data.result || data.response || "Não foi possível processar sua solicitação no momento.";
        
        // Identificar palavras-chave na mensagem do usuário e na resposta
        const lowerInput = message.toLowerCase();
        const lowerResponse = responseText.toLowerCase();
        
        // Verificar se é solicitação de contrato de locação
        if ((lowerInput.includes("contrato") && (lowerInput.includes("locação") || lowerInput.includes("locacao"))) ||
            (lowerResponse.includes("contrato") && (lowerResponse.includes("locação") || lowerResponse.includes("locacao")))) {
          
          // Adicionar resposta da IA  
          setChatHistory(prev => [
            ...prev, 
            { 
              role: "assistant", 
              content: responseText
            }
          ]);
          
          // Adicionar botão de ação após um pequeno delay
          setTimeout(() => {
            setChatHistory(prev => [
              ...prev, 
              { 
                role: "action", 
                content: "Monte um contrato de locação para o cliente de CPF 218320908-92"
              }
            ]);
            setIsTyping(false);
          }, 500);
          
          return;
        }
        // Verificar se é solicitação de procuração
        else if (lowerInput.includes("procuração") || lowerInput.includes("procuracao") ||
                 lowerResponse.includes("procuração") || lowerResponse.includes("procuracao")) {
          
          // Adicionar resposta da IA
          setChatHistory(prev => [
            ...prev, 
            { 
              role: "assistant", 
              content: responseText
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
        }
        
        // Resposta padrão sem botões de ação
        setChatHistory(prev => [...prev, { role: "assistant", content: responseText }]);
      } else {
        // Fallback se não tivermos uma resposta válida da API
        setChatHistory(prev => [...prev, { 
          role: "assistant", 
          content: "Desculpe, estou com dificuldades para processar sua solicitação no momento. Poderia reformular sua pergunta?" 
        }]);
      }
    } catch (error) {
      console.error("Erro ao consultar API:", error);
      
      // Resposta em caso de erro
      setChatHistory(prev => [...prev, { 
        role: "assistant", 
        content: "Desculpe, ocorreu um erro de comunicação. Por favor, tente novamente mais tarde." 
      }]);
    } finally {
      setIsTyping(false);
    }
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
                      onClick={() => {
                        console.log("Botão clicado:", msg.content);
                        
                        // Se for o botão específico de contrato de locação
                        if (msg.content === "Monte um contrato de locação para o cliente de CPF 218320908-92") {
                          console.log("Gerando contrato de locação específico");
                          gerarContratoLocacaoPDF();
                          return;
                        }
                        
                        // Se inclui locação, baixar um contrato de locação
                        if (msg.content.toLowerCase().includes("locação") || msg.content.toLowerCase().includes("locacao")) {
                          console.log("Gerando contrato de locação");
                          gerarContratoLocacaoPDF();
                        } 
                        // Se inclui baixar, baixar o documento
                        else if (msg.content.includes("Baixar")) {
                          console.log("Gerando procuração (baixar)");
                          gerarProcuracaoPDF();
                        }
                        // Para procuração
                        else if (msg.content.toLowerCase().includes("procuração") || msg.content.toLowerCase().includes("procuracao")) {
                          console.log("Gerando procuração");
                          gerarProcuracaoPDF();
                        }
                        // Para qualquer outro tipo de documento
                        else {
                          console.log("Gerando documento padrão (procuração)");
                          gerarProcuracaoPDF();
                        }
                      }}
                    >
                      <FileText className="h-4 w-4 mr-2" />
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