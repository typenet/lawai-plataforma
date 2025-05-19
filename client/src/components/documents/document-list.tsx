import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileType, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AnalyzedDocument } from "@/lib/types";

export function DocumentList() {
  const { data, isLoading, isError } = useQuery<{ documents: AnalyzedDocument[] }>({
    queryKey: ["/api/documents"],
  });

  const getFileIcon = (fileType: string) => {
    if (fileType === "pdf") {
      return <FileType className="flex-shrink-0 mr-1.5 text-red-500 h-4 w-4" />;
    } else if (fileType === "doc" || fileType === "docx") {
      return <FileText className="flex-shrink-0 mr-1.5 text-blue-500 h-4 w-4" />;
    }
    return <FileText className="flex-shrink-0 mr-1.5 text-neutral-medium h-4 w-4" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "issues_found":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Problemas Identificados</Badge>;
      case "complete":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completo</Badge>;
      case "incomplete":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Incompleto</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Em Análise</Badge>;
    }
  };

  const renderDocuments = () => {
    if (isLoading) {
      return Array(2)
        .fill(0)
        .map((_, index) => (
          <div key={index} className="px-4 py-4 sm:px-6 border-b border-neutral-light last:border-b-0">
            <div className="flex justify-between">
              <div className="w-3/4">
                <Skeleton className="h-5 w-full mb-2" />
                <Skeleton className="h-4 w-32 mb-4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full mt-1" />
              </div>
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
        ));
    }

    if (isError || !data || data.documents.length === 0) {
      return (
        <div className="px-4 py-8 text-center">
          <p className="text-neutral-dark">
            {isError
              ? "Erro ao carregar os documentos. Tente novamente."
              : "Nenhum documento analisado recentemente."}
          </p>
        </div>
      );
    }

    return data.documents.map((doc) => (
      <li key={doc.id} className="border-b border-neutral-light last:border-b-0">
        <div className="px-4 py-4 sm:px-6 hover:bg-neutral-lightest">
          <div className="flex items-center justify-between">
            <div className="truncate">
              <div className="flex text-sm">
                <p className="font-medium text-navy truncate">{doc.title}</p>
                <p className="ml-1 flex-shrink-0 font-normal text-neutral-medium">
                  {doc.createdAt ? `- ${doc.createdAgo}` : ""}
                </p>
              </div>
              <div className="mt-2 flex">
                <div className="flex items-center text-sm text-neutral-medium">
                  {getFileIcon(doc.fileType)}
                  <p>{doc.fileInfo}</p>
                </div>
              </div>
            </div>
            <div className="ml-2 flex-shrink-0 flex">
              {getStatusBadge(doc.status)}
            </div>
          </div>
          <div className="mt-2 text-sm text-neutral-dark">
            <div className="line-clamp-2">{doc.analysis}</div>
          </div>
        </div>
      </li>
    ));
  };

  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-navy">Documentos Analisados Recentemente</h3>
        <p className="mt-1 max-w-2xl text-sm text-neutral-medium">
          Documentos processados pela IA nos últimos 30 dias
        </p>
      </div>
      <CardContent className="p-0 border-t border-neutral-light">
        <ul className="divide-y divide-neutral-light">{renderDocuments()}</ul>
      </CardContent>
    </Card>
  );
}
