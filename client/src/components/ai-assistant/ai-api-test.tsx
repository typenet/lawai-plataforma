import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { apiRequest, queryClient } from '@/lib/queryClient';

export function AIApiTest() {
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [documentText, setDocumentText] = useState('');
  const [documentType, setDocumentType] = useState('contract');
  const [documentAnalysis, setDocumentAnalysis] = useState<any>(null);

  // Testar a conexão com a API
  const testConnection = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      const response = await fetch('/api/ai/test-connection', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Falha na requisição: ' + response.status);
      }
      
      const data = await response.json();
      
      setTestResult({
        success: data.success,
        message: data.message || `Conexão estabelecida com serviço: ${data.status?.primary || 'Nenhum'}`
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Falha ao conectar com a API de IA: ' + (error instanceof Error ? error.message : String(error))
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Realizar pesquisa jurídica
  const performSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setSearchResults(null);
    
    try {
      const response = await fetch('/api/ai/legal-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: searchQuery,
          sources: {
            jurisprudence: true,
            doctrine: true,
            legislation: true
          }
        })
      });
      
      if (!response.ok) {
        throw new Error('Falha na requisição: ' + response.status);
      }
      
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      setSearchResults({
        success: false,
        message: 'Falha ao realizar pesquisa: ' + (error instanceof Error ? error.message : String(error))
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Analisar documento
  const analyzeDocument = async () => {
    if (!documentText.trim()) return;
    
    setIsLoading(true);
    setDocumentAnalysis(null);
    
    try {
      const response = await fetch('/api/ai/analyze-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: documentText,
          documentType
        })
      });
      
      if (!response.ok) {
        throw new Error('Falha na requisição: ' + response.status);
      }
      
      const data = await response.json();
      setDocumentAnalysis(data);
    } catch (error) {
      setDocumentAnalysis({
        success: false,
        message: 'Falha ao analisar documento: ' + (error instanceof Error ? error.message : String(error))
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Teste de API de IA</CardTitle>
        <CardDescription>
          Teste as funcionalidades da API de IA integrada com DeepSeek
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="connection">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="connection">Conexão</TabsTrigger>
            <TabsTrigger value="search">Pesquisa Jurídica</TabsTrigger>
            <TabsTrigger value="analysis">Análise de Documento</TabsTrigger>
          </TabsList>

          {/* Teste de Conexão */}
          <TabsContent value="connection" className="space-y-4">
            <div className="py-4">
              <p className="text-sm text-gray-500 mb-4">
                Teste a conexão com o serviço de IA. Se configurado corretamente, o serviço DeepSeek será usado.
                Caso contrário, o sistema tentará usar o OpenAI como fallback.
              </p>
              <Button 
                onClick={testConnection} 
                disabled={isLoading}
                className="w-full bg-[#9F85FF] hover:bg-[#8A6EF3]"
              >
                {isLoading ? 'Testando conexão...' : 'Testar Conexão'}
              </Button>
            </div>

            {testResult && (
              <Alert variant={testResult.success ? "default" : "destructive"}>
                {testResult.success ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertTitle>
                  {testResult.success ? 'Conexão estabelecida!' : 'Erro na conexão'}
                </AlertTitle>
                <AlertDescription>
                  {testResult.message}
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {/* Pesquisa Jurídica */}
          <TabsContent value="search" className="space-y-4">
            <div className="space-y-4">
              <div>
                <label htmlFor="search-query" className="block text-sm font-medium text-gray-700 mb-1">
                  Consulta de pesquisa jurídica
                </label>
                <Textarea
                  id="search-query"
                  placeholder="Digite sua consulta jurídica aqui..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-24"
                />
              </div>
              <Button 
                onClick={performSearch} 
                disabled={isLoading || !searchQuery.trim()}
                className="w-full bg-[#9F85FF] hover:bg-[#8A6EF3]"
              >
                {isLoading ? 'Pesquisando...' : 'Realizar Pesquisa'}
              </Button>
            </div>

            {searchResults && (
              <div className="mt-4 border rounded-md p-4">
                <h3 className="text-lg font-semibold mb-2">
                  {searchResults.success ? 'Resultados da pesquisa' : 'Erro na pesquisa'}
                </h3>
                {searchResults.success ? (
                  <div className="space-y-4">
                    {searchResults.results?.results?.map((result: any, index: number) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-md">
                        <div className="font-medium">{result.title}</div>
                        <div className="text-sm text-gray-600 mt-1">{result.summary}</div>
                        <div className="text-xs text-gray-500 mt-2">
                          Fonte: {result.source} | Ref: {result.reference}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Falha na pesquisa</AlertTitle>
                    <AlertDescription>
                      {searchResults.message}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </TabsContent>

          {/* Análise de Documento */}
          <TabsContent value="analysis" className="space-y-4">
            <div className="space-y-4">
              <div>
                <label htmlFor="document-type" className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de documento
                </label>
                <select
                  id="document-type"
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-[#9F85FF] focus:outline-none focus:ring-1 focus:ring-[#9F85FF]"
                >
                  <option value="contract">Contrato</option>
                  <option value="petition">Petição</option>
                  <option value="power_of_attorney">Procuração</option>
                  <option value="general">Documento Geral</option>
                </select>
              </div>
              <div>
                <label htmlFor="document-text" className="block text-sm font-medium text-gray-700 mb-1">
                  Texto do documento
                </label>
                <Textarea
                  id="document-text"
                  placeholder="Cole o texto do documento jurídico aqui..."
                  value={documentText}
                  onChange={(e) => setDocumentText(e.target.value)}
                  className="h-40"
                />
              </div>
              <Button 
                onClick={analyzeDocument} 
                disabled={isLoading || !documentText.trim()}
                className="w-full bg-[#9F85FF] hover:bg-[#8A6EF3]"
              >
                {isLoading ? 'Analisando...' : 'Analisar Documento'}
              </Button>
            </div>

            {documentAnalysis && (
              <div className="mt-4 border rounded-md p-4">
                <h3 className="text-lg font-semibold mb-2">
                  {documentAnalysis.success ? 'Análise do documento' : 'Erro na análise'}
                </h3>
                {documentAnalysis.success ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-700">Resumo</h4>
                      <p className="text-sm text-gray-600 mt-1">{documentAnalysis.analysis?.summary}</p>
                    </div>
                    
                    {documentAnalysis.analysis?.findings && documentAnalysis.analysis.findings.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-700">Achados</h4>
                        <div className="space-y-2 mt-2">
                          {documentAnalysis.analysis.findings.map((finding: any, index: number) => (
                            <div key={index} className="text-sm bg-gray-50 p-2 rounded-md">
                              <span className="font-medium">{finding.type}: </span>
                              <span>{finding.description}</span>
                              {finding.severity && (
                                <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">
                                  {finding.severity}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <h4 className="font-medium text-gray-700">Status</h4>
                      <p className="text-sm mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          documentAnalysis.analysis?.status === 'complete' 
                            ? 'bg-green-100 text-green-800' 
                            : documentAnalysis.analysis?.status === 'issues_found'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}>
                          {documentAnalysis.analysis?.status === 'complete' 
                            ? 'Completo' 
                            : documentAnalysis.analysis?.status === 'issues_found'
                              ? 'Problemas encontrados'
                              : 'Incompleto'}
                        </span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Falha na análise</AlertTitle>
                    <AlertDescription>
                      {documentAnalysis.message}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-xs text-gray-500">
          API de IA alimentada por DeepSeek ou OpenAI
        </div>
      </CardFooter>
    </Card>
  );
}