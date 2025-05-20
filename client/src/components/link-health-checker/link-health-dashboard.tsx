import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';
import { LinkCheckResult, LinkCheckStats } from './types';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  AlertCircle, 
  ArrowUpRight, 
  CheckCircle, 
  Clock, 
  ExternalLink, 
  RefreshCw, 
  XCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const formatRelativeTime = (dateString: string | Date) => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) {
    return `${diffMins} min atrás`;
  } else if (diffHours < 24) {
    return `${diffHours} horas atrás`;
  } else {
    return `${diffDays} dias atrás`;
  }
};

interface LinkHealthResponse {
  success: boolean;
  results: LinkCheckResult[];
  stats: LinkCheckStats;
  isCached: boolean;
  lastChecked: string;
  message?: string;
}

export function LinkHealthDashboard() {
  const [activeTab, setActiveTab] = useState('all');
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<LinkHealthResponse>({
    queryKey: ['/api/link-health/results'],
    refetchInterval: 60000 * 5, // Refetch every 5 minutes
  });

  const checkMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/link-health/check'),
    onSuccess: () => {
      toast({
        title: 'Verificação Iniciada',
        description: 'A verificação de links foi iniciada e será concluída em alguns momentos.',
      });
      
      // Refetch after 10 seconds to allow the check to complete
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['/api/link-health/results'] });
      }, 10000);
    },
    onError: () => {
      toast({
        title: 'Erro',
        description: 'Não foi possível iniciar a verificação de links.',
        variant: 'destructive'
      });
    }
  });

  const handleRefresh = () => {
    checkMutation.mutate();
  };

  const getFilteredResults = () => {
    if (!data?.results) return [];
    
    if (activeTab === 'all') return data.results;
    if (activeTab === 'healthy') return data.results.filter(r => r.status === 'healthy');
    if (activeTab === 'broken') return data.results.filter(r => r.status === 'broken');
    if (activeTab === 'redirected') return data.results.filter(r => r.status === 'redirected');
    
    return [];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'broken':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'redirected':
        return <ArrowUpRight className="h-5 w-5 text-yellow-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getImportanceBadge = (importance: string) => {
    switch (importance) {
      case 'critical':
        return <Badge variant="destructive">Crítico</Badge>;
      case 'high':
        return <Badge variant="default" className="bg-amber-500">Alto</Badge>;
      case 'medium':
        return <Badge variant="secondary">Médio</Badge>;
      case 'low':
        return <Badge variant="outline">Baixo</Badge>;
      default:
        return <Badge variant="outline">Indefinido</Badge>;
    }
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Verificador de Saúde de Links</CardTitle>
          <CardDescription>Monitore a saúde dos links internos e externos do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md bg-red-50 p-4 my-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <XCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Erro ao carregar dados</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>Não foi possível carregar os dados de saúde dos links. Tente novamente mais tarde.</p>
                </div>
              </div>
            </div>
          </div>
          <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/link-health/results'] })}>
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Verificador de Saúde de Links</CardTitle>
            <CardDescription>Monitore a saúde dos links internos e externos do sistema</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={checkMutation.isPending}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${checkMutation.isPending ? 'animate-spin' : ''}`} />
            Verificar agora
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-8 w-16" />
                  </CardContent>
                </Card>
              ))}
            </div>
            <Skeleton className="h-[300px] w-full" />
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground mb-1">Total de Links</p>
                  <h3 className="text-2xl font-bold">{data?.stats?.total || 0}</h3>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground mb-1">Links Saudáveis</p>
                  <div className="flex items-center">
                    <h3 className="text-2xl font-bold text-green-600">
                      {data?.stats?.healthy || 0}
                    </h3>
                    <span className="text-sm text-muted-foreground ml-2">
                      ({data?.stats?.total ? Math.round((data.stats.healthy / data.stats.total) * 100) : 0}%)
                    </span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground mb-1">Links Quebrados</p>
                  <div className="flex items-center">
                    <h3 className="text-2xl font-bold text-red-600">
                      {data?.stats?.broken || 0}
                    </h3>
                    <span className="text-sm text-muted-foreground ml-2">
                      ({data?.stats?.total ? Math.round((data.stats.broken / data.stats.total) * 100) : 0}%)
                    </span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground mb-1">Redirecionamentos</p>
                  <div className="flex items-center">
                    <h3 className="text-2xl font-bold text-yellow-600">
                      {data?.stats?.redirected || 0}
                    </h3>
                    <span className="text-sm text-muted-foreground ml-2">
                      ({data?.stats?.total ? Math.round((data.stats.redirected / data.stats.total) * 100) : 0}%)
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">Saúde Geral do Sistema</h3>
                <span className="text-sm text-muted-foreground">
                  {data?.stats?.total ? Math.round((data.stats.healthy / data.stats.total) * 100) : 0}% saudável
                </span>
              </div>
              <Progress 
                value={data?.stats?.total ? (data.stats.healthy / data.stats.total) * 100 : 0} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Última verificação completa: {data?.lastChecked ? formatRelativeTime(data.lastChecked) : 'N/A'}
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="all">Todos ({data?.stats?.total || 0})</TabsTrigger>
                <TabsTrigger value="healthy">Saudáveis ({data?.stats?.healthy || 0})</TabsTrigger>
                <TabsTrigger value="broken">Quebrados ({data?.stats?.broken || 0})</TabsTrigger>
                <TabsTrigger value="redirected">Redirecionados ({data?.stats?.redirected || 0})</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-0">
                {getFilteredResults().length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Nenhum link encontrado nesta categoria.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">Status</TableHead>
                          <TableHead>URL</TableHead>
                          <TableHead>Contexto</TableHead>
                          <TableHead>Importância</TableHead>
                          <TableHead>Tempo de Resposta</TableHead>
                          <TableHead>Última Verificação</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getFilteredResults().map((result, i) => (
                          <TableRow key={i}>
                            <TableCell>{getStatusIcon(result.status)}</TableCell>
                            <TableCell className="font-mono text-xs max-w-[300px] truncate">
                              {result.url}
                              {result.statusCode && (
                                <span className="ml-2 text-xs text-muted-foreground">
                                  ({result.statusCode})
                                </span>
                              )}
                            </TableCell>
                            <TableCell>{result.context}</TableCell>
                            <TableCell>{getImportanceBadge(result.importance)}</TableCell>
                            <TableCell>
                              {result.responseTime ? `${result.responseTime}ms` : 'N/A'}
                            </TableCell>
                            <TableCell>
                              {result.lastChecked ? formatRelativeTime(result.lastChecked) : 'N/A'}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button size="sm" variant="ghost" asChild>
                                <a href={result.url} target="_blank" rel="noreferrer">
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t px-6 py-4">
        <p className="text-xs text-muted-foreground">
          {data?.stats?.avgResponseTime ? 
            `Tempo médio de resposta: ${Math.round(data.stats.avgResponseTime)}ms` : 
            'Tempo médio de resposta: N/A'}
        </p>
        {data?.message && (
          <p className="text-xs text-muted-foreground">{data.message}</p>
        )}
      </CardFooter>
    </Card>
  );
}