import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Landmark, Book, FileText, Filter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchResult } from "@/lib/types";

export function SearchResults() {
  const { data, isLoading, isError } = useQuery<{
    results: SearchResult[];
    totalResults: number;
    currentPage: number;
    totalPages: number;
  }>({
    queryKey: ["/api/search/results"],
  });

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "jurisprudence":
        return <Landmark className="flex-shrink-0 mr-1.5 text-neutral-medium h-4 w-4" />;
      case "doctrine":
        return <Book className="flex-shrink-0 mr-1.5 text-neutral-medium h-4 w-4" />;
      case "legislation":
        return <FileText className="flex-shrink-0 mr-1.5 text-neutral-medium h-4 w-4" />;
      default:
        return <FileText className="flex-shrink-0 mr-1.5 text-neutral-medium h-4 w-4" />;
    }
  };

  const getSourceBadge = (source: string) => {
    switch (source) {
      case "jurisprudence":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Jurisprudência</Badge>;
      case "doctrine":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Doutrina</Badge>;
      case "legislation":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Legislação</Badge>;
      default:
        return <Badge>Desconhecido</Badge>;
    }
  };

  const renderResults = () => {
    if (isLoading) {
      return Array(3)
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

    if (isError || !data || data.results.length === 0) {
      return (
        <div className="px-4 py-8 text-center">
          <p className="text-neutral-dark">
            {isError
              ? "Erro ao carregar os resultados. Tente novamente."
              : "Nenhum resultado encontrado. Tente uma nova pesquisa."}
          </p>
        </div>
      );
    }

    return data.results.map((result) => (
      <li key={result.id} className="border-b border-neutral-light last:border-b-0">
        <div className="px-4 py-4 sm:px-6 hover:bg-neutral-lightest">
          <div className="flex items-center justify-between">
            <div className="truncate">
              <div className="flex text-sm">
                <p className="font-medium text-navy truncate">{result.title}</p>
                <p className="ml-1 flex-shrink-0 font-normal text-neutral-medium">
                  {result.createdAt ? `- ${result.createdAgo}` : ""}
                </p>
              </div>
              <div className="mt-2 flex">
                <div className="flex items-center text-sm text-neutral-medium">
                  {getSourceIcon(result.source)}
                  <p>{result.reference}</p>
                </div>
              </div>
            </div>
            <div className="ml-2 flex-shrink-0 flex">
              {getSourceBadge(result.source)}
            </div>
          </div>
          <div className="mt-2 text-sm text-neutral-dark line-clamp-2">{result.summary}</div>
        </div>
      </li>
    ));
  };

  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-navy">Resultados Recentes</h3>
          <p className="mt-1 max-w-2xl text-sm text-neutral-medium">Suas pesquisas mais relevantes</p>
        </div>
        <div>
          <Button variant="outline" size="sm" className="text-neutral-dark hover:bg-neutral-lightest">
            <Filter className="mr-1 h-4 w-4" />
            Filtrar
          </Button>
        </div>
      </div>

      <CardContent className="p-0 border-t border-neutral-light">
        <ul className="divide-y divide-neutral-light">{renderResults()}</ul>
      </CardContent>

      {data && data.totalPages > 1 && (
        <CardFooter className="px-4 py-3 border-t border-neutral-light sm:px-6">
          <div className="w-full">
            <div className="hidden sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-neutral-medium">
                  Mostrando
                  <span className="font-medium"> {(data.currentPage - 1) * 10 + 1} </span>
                  a
                  <span className="font-medium"> {Math.min(data.currentPage * 10, data.totalResults)} </span>
                  de
                  <span className="font-medium"> {data.totalResults} </span>
                  resultados
                </p>
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#" isActive={data.currentPage === 1}>
                      1
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#" isActive={data.currentPage === 2}>
                      2
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#" isActive={data.currentPage === 3}>
                      3
                    </PaginationLink>
                  </PaginationItem>
                  {data.totalPages > 3 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                  <PaginationItem>
                    <PaginationNext href="#" />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
            
            <div className="flex justify-between sm:hidden">
              <Button variant="outline" size="sm" disabled={data.currentPage === 1}>
                Anterior
              </Button>
              <Button variant="outline" size="sm" disabled={data.currentPage === data.totalPages}>
                Próxima
              </Button>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
