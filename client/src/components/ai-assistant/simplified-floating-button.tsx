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

  // Função para extrair CPF da mensagem
  const extrairCPF = (mensagem: string): string => {
    const cpfRegex = /\d{3}\.?\d{3}\.?\d{3}-?\d{2}/g;
    const match = mensagem.match(cpfRegex);
    return match ? match[0] : "218.320.908-92"; // CPF padrão se não encontrar
  };

  // Função para obter tipo de documento da mensagem
  const obterTipoDocumento = (mensagem: string): string => {
    const tiposDocumentos = [
      { tipo: "PROCURAÇÃO", palavrasChave: ["procuração", "procuracao"] },
      { tipo: "CONTRATO DE LOCAÇÃO", palavrasChave: ["contrato de locação", "contrato de locacao", "locação", "locacao"] },
      { tipo: "CONTRATO DE PRESTAÇÃO DE SERVIÇOS", palavrasChave: ["prestação de serviços", "prestacao de servicos"] },
      { tipo: "PETIÇÃO INICIAL", palavrasChave: ["petição inicial", "peticao inicial"] },
      { tipo: "RECURSO", palavrasChave: ["recurso"] },
    ];

    const mensagemLowerCase = mensagem.toLowerCase();
    
    for (const doc of tiposDocumentos) {
      if (doc.palavrasChave.some(palavra => mensagemLowerCase.includes(palavra))) {
        return doc.tipo;
      }
    }
    
    return "DOCUMENTO JURÍDICO"; // Tipo genérico se não identificar
  };

  // Função para criar conteúdo do documento com base no tipo
  const gerarConteudoDocumento = (tipoDocumento: string, cliente: Cliente): any => {
    switch (tipoDocumento) {
      case "PROCURAÇÃO":
        return {
          titulo: "PROCURAÇÃO",
          conteudo: [
            `OUTORGANTE: ${cliente.nome}, brasileiro(a), portador(a) do CPF nº ${cliente.cpf}, residente e domiciliado(a) à ${cliente.endereco}, ${cliente.cidade}/${cliente.estado}.`,
            "",
            "OUTORGADO: [NOME DO ADVOGADO], [nacionalidade], advogado(a), inscrito(a) na OAB/XX sob nº XXXXX, com escritório profissional localizado à [ENDEREÇO COMPLETO].",
            "",
            "PODERES: Por este instrumento particular de procuração, o(a) outorgante nomeia e constitui o(a) outorgado(a) como seu(sua) procurador(a), conferindo-lhe poderes para o foro em geral, com a cláusula \"ad judicia et extra\", em qualquer Juízo, Instância ou Tribunal, podendo propor contra quem de direito as ações competentes e defendê-lo(a) nas contrárias, seguindo umas e outras, até final decisão, usando os recursos legais e acompanhando-os, conferindo-lhe, ainda, poderes especiais para confessar, desistir, transigir, firmar compromissos ou acordos, receber e dar quitação, agindo em conjunto ou separadamente."
          ]
        };
      
      case "CONTRATO DE LOCAÇÃO":
        return {
          titulo: "CONTRATO DE LOCAÇÃO DE IMÓVEL",
          conteudo: [
            "LOCADOR: [NOME COMPLETO DO LOCADOR], [qualificação completa].",
            "",
            `LOCATÁRIO: ${cliente.nome}, brasileiro(a), portador(a) do CPF nº ${cliente.cpf}, residente e domiciliado(a) à ${cliente.endereco}, ${cliente.cidade}/${cliente.estado}.`,
            "",
            "OBJETO: O LOCADOR, sendo proprietário do imóvel situado à [ENDEREÇO COMPLETO DO IMÓVEL], loca-o ao LOCATÁRIO, mediante as cláusulas e condições seguintes:",
            "",
            "CLÁUSULA PRIMEIRA - PRAZO: A presente locação é feita pelo prazo de [PRAZO] meses, iniciando-se em [DATA DE INÍCIO] e terminando em [DATA DE TÉRMINO], data em que o LOCATÁRIO se obriga a restituir o imóvel locado completamente desocupado, no estado em que o recebeu, independentemente de notificação ou interpelação judicial.",
            "",
            "CLÁUSULA SEGUNDA - ALUGUEL: O aluguel mensal é de R$ [VALOR] que o LOCATÁRIO se compromete a pagar pontualmente até o dia [DIA] de cada mês."
          ]
        };
      
      default:
        return {
          titulo: tipoDocumento,
          conteudo: [
            `Este é um modelo básico de ${tipoDocumento.toLowerCase()}.`,
            "",
            `PARTE INTERESSADA: ${cliente.nome}, brasileiro(a), portador(a) do CPF nº ${cliente.cpf}, residente e domiciliado(a) à ${cliente.endereco}, ${cliente.cidade}/${cliente.estado}.`,
            "",
            "Este documento foi gerado automaticamente pelo sistema LAWAI e deve ser revisado por um profissional qualificado antes de sua utilização para fins legais.",
            "",
            "[O conteúdo completo deste documento deve ser elaborado por um advogado, de acordo com as especificidades do caso e a legislação vigente.]"
          ]
        };
    }
  };

  // Função para lidar com o download do PDF
  const handleDownloadPDF = () => {
    // Identificar qual foi a última mensagem do usuário para determinar o tipo de documento
    let ultimaMensagem = "";
    for (let i = chatHistory.length - 1; i >= 0; i--) {
      if (chatHistory[i].role === "user") {
        ultimaMensagem = chatHistory[i].content;
        break;
      }
    }
    
    // Extrair o CPF do contexto da mensagem (se disponível)
    const cpfExtraido = extrairCPF(ultimaMensagem);
    
    // Identificar o tipo de documento a ser gerado
    const tipoDocumento = obterTipoDocumento(ultimaMensagem);
    
    // Simular a preparação e download do arquivo
    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      setChatHistory(prev => [
        ...prev,
        {
          role: "assistant",
          content: `📄 O download do ${tipoDocumento.toLowerCase()} foi iniciado. O documento será salvo em formato PDF.`
        }
      ]);
      
      // Dados do cliente para o documento
      const cliente: Cliente = {
        nome: "MARIA SILVA SANTOS",
        cpf: cpfExtraido,
        endereco: "Rua Doutor Paulo De Queiroz, 790",
        cidade: "São Paulo",
        estado: "SP"
      };
      
      // Obter estrutura e conteúdo do documento
      const documento = gerarConteudoDocumento(tipoDocumento, cliente);
      
      // Criar um novo documento PDF
      const doc = new jsPDF();
      
      // Adicionar marca d'água de fundo (texto claro)
      doc.setFontSize(60);
      doc.setTextColor(230, 230, 230);
      doc.text("LAWAI", 105, 150, { align: "center" });
      
      // Configurar fonte e tamanho para o título
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      
      // Título centralizado
      doc.text(documento.titulo, 105, 20, { align: "center" });
      
      // Configurar fonte para o corpo do texto
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      
      // Configuração de página para A4
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Função para escrever parágrafos com quebra automática
      const addParagraph = (text: string, startX: number, startY: number, maxWidth: number): number => {
        const splitText = doc.splitTextToSize(text, maxWidth);
        doc.text(splitText, startX, startY);
        return startY + (splitText.length * 8);
      };
      
      // Posição inicial
      let posY = 40;
      
      // Adicionar o conteúdo do documento
      for (const paragrafos of documento.conteudo) {
        posY = addParagraph(paragrafos, 20, posY, pageWidth - 40);
        posY += 10; // Espaçamento entre parágrafos
      }
      
      posY += 15;
      
      // Adicionar data
      doc.text(`${cliente.cidade}, ${new Date().toLocaleDateString('pt-BR')}.`, 20, posY);
      
      posY += 40;
      
      // Adicionar assinatura
      doc.text("____________________________________", 20, posY);
      posY += 10;
      doc.text(`${cliente.nome}`, 20, posY);
      posY += 8;
      doc.text(`CPF: ${cliente.cpf}`, 20, posY);
      
      // Salvar o PDF com nome apropriado
      doc.save(`${documento.titulo.replace(/\s+/g, '_')}_${cliente.nome.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.pdf`);
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
                      onClick={() => {
                        // Se inclui locação, baixar um contrato de locação
                        if (msg.content.toLowerCase().includes("locação") || msg.content.toLowerCase().includes("locacao")) {
                          handleDownloadPDF();
                        } 
                        // Se inclui baixar, baixar o documento
                        else if (msg.content.includes("Baixar")) {
                          handleDownloadPDF();
                        }
                        // Para procuração
                        else if (msg.content.toLowerCase().includes("procuração") || msg.content.toLowerCase().includes("procuracao")) {
                          handleProcuracaoAction();
                        }
                        // Para qualquer outro tipo de documento
                        else {
                          handleDownloadPDF();
                        }
                      }}
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