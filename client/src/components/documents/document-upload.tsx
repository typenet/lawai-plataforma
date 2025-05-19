import { useState, ChangeEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileType, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

export function DocumentUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check file type
      const fileType = selectedFile.type;
      if (fileType !== 'application/pdf' && 
          fileType !== 'application/msword' && 
          fileType !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        toast({
          title: "Formato inválido",
          description: "Por favor, selecione um arquivo PDF, DOC ou DOCX.",
          variant: "destructive",
        });
        return;
      }
      
      // Check file size (10MB max)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "O tamanho máximo permitido é 10MB.",
          variant: "destructive",
        });
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (extension === 'pdf') {
      return <FileType className="text-red-500 h-5 w-5 mr-2" />;
    } else if (extension === 'doc' || extension === 'docx') {
      return <FileType className="text-blue-500 h-5 w-5 mr-2" />;
    }
    return <FileType className="text-gray-500 h-5 w-5 mr-2" />;
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('document', file);

    try {
      const response = await fetch('/api/documents/analyze', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Falha ao analisar o documento');
      }

      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      toast({
        title: "Documento analisado com sucesso",
        description: "Você pode ver os resultados da análise na lista abaixo.",
      });
      setFile(null);
    } catch (error) {
      toast({
        title: "Erro ao analisar documento",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg leading-6 font-medium text-navy">Análise de Documentos</h3>
        <div className="mt-2 max-w-xl text-sm text-neutral-dark">
          <p>Faça upload de documentos para análise e obtenha insights jurídicos automáticos.</p>
        </div>
        <div className="mt-5">
          <div className="max-w-lg flex justify-center px-6 pt-5 pb-6 border-2 border-neutral-light border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-12 w-12 text-neutral-medium" />
              <div className="flex text-sm text-neutral-medium">
                <label htmlFor="document-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-navy hover:text-navy-light focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-navy">
                  <span>Faça upload de um arquivo</span>
                  <input 
                    id="document-upload" 
                    name="document-upload" 
                    type="file" 
                    className="sr-only" 
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                  />
                </label>
                <p className="pl-1">ou arraste e solte</p>
              </div>
              <p className="text-xs text-neutral-medium">
                PDF, DOC ou DOCX até 10MB
              </p>
            </div>
          </div>
          
          {file && (
            <div className="mt-4 p-4 bg-neutral-lightest rounded-md">
              <div className="flex items-center">
                {getFileIcon(file.name)}
                <span className="text-sm text-neutral-dark">{file.name}</span>
                <button 
                  type="button" 
                  onClick={removeFile}
                  className="ml-auto text-neutral-medium hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
          
          <div className="mt-4">
            <Button
              type="button"
              className="bg-navy hover:bg-navy-light"
              onClick={handleUpload}
              disabled={!file || isUploading}
            >
              {isUploading ? "Analisando..." : "Analisar Documento"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
