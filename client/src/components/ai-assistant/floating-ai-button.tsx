import { useState } from "react";
import { Bot, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import AIAssistantDialog from "./ai-assistant-dialog";

export default function FloatingAIButton() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAssistant = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Botão flutuante para acesso rápido à assistência com IA */}
      <Button
        onClick={toggleAssistant}
        className={`fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg flex items-center justify-center p-0 transition-all duration-300 ${
          isOpen ? "bg-red-500 hover:bg-red-600" : "bg-navy hover:bg-navy-light"
        }`}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Bot className="h-6 w-6" />
        )}
      </Button>

      {/* Diálogo de assistência com IA */}
      <AIAssistantDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}