import { useState } from "react";
import { Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import LegalWritingAssistant from "./legal-writing-assistant";

export default function FloatingWritingButton() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAssistant = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Botão flutuante para acesso rápido ao assistente de redação */}
      <Button
        onClick={toggleAssistant}
        className={`fixed bottom-24 right-6 rounded-full w-14 h-14 shadow-lg flex items-center justify-center p-0 z-40 ${
          isOpen ? "bg-red-500 hover:bg-red-600" : "bg-[#9F85FF] hover:bg-[#8A6EF3]"
        }`}
        aria-label={isOpen ? "Fechar assistente" : "Abrir assistente de redação"}
      >
        {isOpen ? (
          <X className="h-6 w-6 animate-fade-in" />
        ) : (
          <Pencil className="h-6 w-6 animate-fade-in" />
        )}
      </Button>

      {/* Assistente de redação jurídica */}
      {isOpen && <LegalWritingAssistant isOpen={isOpen} onClose={() => setIsOpen(false)} />}
    </>
  );
}