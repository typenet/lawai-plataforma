import { useState } from "react";
import { Bot, X } from "lucide-react";
import { Button } from "@/components/ui/button";
// Importação direta do componente
import AIAssistantDialog from "./ai-assistant-dialog";

export default function FloatingAIButton() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAssistant = () => {
    setIsOpen(!isOpen);
  };

  // Renderização condicional do diálogo para evitar problemas de importação
  const renderDialog = () => {
    if (isOpen) {
      return <AIAssistantDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />;
    }
    return null;
  };

  return (
    <>
      {/* Botão flutuante para acesso rápido à assistência com IA */}
      <Button
        onClick={toggleAssistant}
        className={`fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg flex items-center justify-center p-0 z-50 ai-assistant-button ${
          isOpen ? "bg-red-500 hover:bg-red-600" : "bg-[#0E2C4B] hover:bg-[#173E66]"
        }`}
        aria-label={isOpen ? "Fechar assistente" : "Abrir assistente IA"}
      >
        {isOpen ? (
          <X className="h-6 w-6 animate-fade-in" />
        ) : (
          <Bot className="h-6 w-6 animate-fade-in" />
        )}
      </Button>

      {/* Diálogo de assistência com IA */}
      {renderDialog()}
    </>
  );
}