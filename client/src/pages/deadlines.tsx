import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Plus, Trash2, Edit, CheckCircle, CalendarIcon, AlertTriangle, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import type { Deadline, Case } from "@shared/schema";

export default function DeadlinesPage() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDeadlineOpen, setIsAddDeadlineOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deadlineToDelete, setDeadlineToDelete] = useState<number | null>(null);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = useState("pending");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: new Date(),
    caseId: 0,
    priority: "medium",
    notifyDaysBefore: 3,
  });
  
  // Consultar prazos pendentes
  const { data: pendingDeadlinesData, isLoading: isPendingLoading } = useQuery({
    queryKey: ["/api/deadlines/pending"],
    enabled: isAuthenticated,
  });
  
  const pendingDeadlines = pendingDeadlinesData?.deadlines || [];
  
  // Consultar todos os prazos
  const { data: allDeadlinesData, isLoading: isAllDeadlinesLoading } = useQuery({
    queryKey: ["/api/deadlines"],
    enabled: isAuthenticated,
  });
  
  const allDeadlines = allDeadlinesData?.deadlines || [];
  
  // Consultar casos para o select de criação de prazo
  const { data: casesData, isLoading: isCasesLoading } = useQuery({
    queryKey: ["/api/cases"],
    enabled: isAuthenticated,
  });
  
  const cases = casesData?.cases || [];

  // Adicionar um novo prazo
  const addDeadlineMutation = useMutation({
    mutationFn: async (data: any) => {
      return fetch("/api/deadlines", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }).then(res => {
        if (!res.ok) throw new Error("Falha ao adicionar prazo");
        return res.json();
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deadlines"] });
      queryClient.invalidateQueries({ queryKey: ["/api/deadlines/pending"] });
      setIsAddDeadlineOpen(false);
      resetForm();
      toast({
        title: "Prazo adicionado",
        description: "O prazo processual foi adicionado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao adicionar prazo",
        description: error.message || "Ocorreu um erro ao adicionar o prazo processual.",
        variant: "destructive",
      });
    },
  });
  
  // Marcar prazo como concluído
  const completeDeadlineMutation = useMutation({
    mutationFn: async (id: number) => {
      return fetch(`/api/deadlines/${id}/complete`, {
        method: "PATCH",
      }).then(res => {
        if (!res.ok) throw new Error("Falha ao concluir prazo");
        return res.json();
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deadlines"] });
      queryClient.invalidateQueries({ queryKey: ["/api/deadlines/pending"] });
      toast({
        title: "Prazo concluído",
        description: "O prazo foi marcado como concluído com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao concluir prazo",
        description: error.message || "Ocorreu um erro ao marcar o prazo como concluído.",
        variant: "destructive",
      });
    },
  });
  
  // Excluir um prazo
  const deleteDeadlineMutation = useMutation({
    mutationFn: async (id: number) => {
      return fetch(`/api/deadlines/${id}`, {
        method: "DELETE",
      }).then(res => {
        if (!res.ok) throw new Error("Falha ao excluir prazo");
        return res.json();
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deadlines"] });
      queryClient.invalidateQueries({ queryKey: ["/api/deadlines/pending"] });
      setIsDeleteDialogOpen(false);
      setDeadlineToDelete(null);
      toast({
        title: "Prazo excluído",
        description: "O prazo foi excluído com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir prazo",
        description: error.message || "Ocorreu um erro ao excluir o prazo.",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      setFormData((prev) => ({ ...prev, dueDate: selectedDate }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addDeadlineMutation.mutate(formData);
  };

  const confirmDelete = (id: number) => {
    setDeadlineToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (deadlineToDelete) {
      deleteDeadlineMutation.mutate(deadlineToDelete);
    }
  };
  
  const handleComplete = (id: number) => {
    completeDeadlineMutation.mutate(id);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      dueDate: new Date(),
      caseId: 0,
      priority: "medium",
      notifyDaysBefore: 3,
    });
    setDate(new Date());
  };
  
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">Alta</Badge>;
      case "medium":
        return <Badge variant="default">Média</Badge>;
      case "low":
        return <Badge variant="outline">Baixa</Badge>;
      default:
        return <Badge variant="outline">Normal</Badge>;
    }
  };
  
  const getDeadlineStatus = (deadline: any) => {
    if (deadline.completed) {
      return <Badge variant="outline" className="bg-green-100 text-green-800">Concluído</Badge>;
    }
    
    const today = new Date();
    const dueDate = new Date(deadline.dueDate);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return <Badge variant="destructive">Atrasado</Badge>;
    } else if (diffDays <= 2) {
      return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Urgente</Badge>;
    } else {
      return <Badge variant="outline" className="bg-blue-100 text-blue-800">Pendente</Badge>;
    }
  };
  
  const getCaseName = (caseId: number) => {
    if (!cases?.cases) return "Carregando...";
    const foundCase = cases.cases.find((c: Case) => c.id === caseId);
    return foundCase ? foundCase.caseNumber : "Caso não encontrado";
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Acesso Restrito</h2>
        <p className="mb-4">Você precisa estar logado para acessar esta página.</p>
        <Button asChild>
          <Link href="/api/login">Fazer Login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => window.location.href = "/dashboard"}>
            Voltar
          </Button>
          <h1 className="text-3xl font-bold">Prazos Processuais</h1>
        </div>
        <Button onClick={() => setIsAddDeadlineOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Novo Prazo
        </Button>
      </div>

      <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="pending">Prazos Pendentes</TabsTrigger>
          <TabsTrigger value="all">Todos os Prazos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending">
          {isPendingLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Prazos Pendentes</CardTitle>
                <CardDescription>Prazos que requerem sua atenção nos próximos dias</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingDeadlines.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Prazo</TableHead>
                        <TableHead>Processo</TableHead>
                        <TableHead>Data Limite</TableHead>
                        <TableHead>Prioridade</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingDeadlines.map((deadline: Deadline) => (
                        <TableRow key={deadline.id}>
                          <TableCell>{getDeadlineStatus(deadline)}</TableCell>
                          <TableCell className="font-medium">{deadline.title}</TableCell>
                          <TableCell>{getCaseName(deadline.caseId)}</TableCell>
                          <TableCell>{new Date(deadline.dueDate).toLocaleDateString('pt-BR')}</TableCell>
                          <TableCell>{getPriorityBadge(deadline.priority)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="icon" onClick={() => handleComplete(deadline.id)}>
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              </Button>
                              <Button variant="outline" size="icon" asChild>
                                <Link href={`/deadlines/${deadline.id}`}>
                                  <Edit className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button variant="outline" size="icon" onClick={() => confirmDelete(deadline.id)}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">Nenhum prazo pendente para os próximos dias.</p>
                    <Button onClick={() => setIsAddDeadlineOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" /> Adicionar Prazo
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="all">
          {isAllDeadlinesLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Todos os Prazos</CardTitle>
                <CardDescription>Lista completa de prazos processuais</CardDescription>
              </CardHeader>
              <CardContent>
                {allDeadlines.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Prazo</TableHead>
                        <TableHead>Processo</TableHead>
                        <TableHead>Data Limite</TableHead>
                        <TableHead>Prioridade</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allDeadlines.map((deadline: Deadline) => (
                        <TableRow key={deadline.id} className={deadline.completed ? "opacity-60" : ""}>
                          <TableCell>{getDeadlineStatus(deadline)}</TableCell>
                          <TableCell className="font-medium">{deadline.title}</TableCell>
                          <TableCell>{getCaseName(deadline.caseId)}</TableCell>
                          <TableCell>{new Date(deadline.dueDate).toLocaleDateString('pt-BR')}</TableCell>
                          <TableCell>{getPriorityBadge(deadline.priority)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {!deadline.completed && (
                                <Button variant="outline" size="icon" onClick={() => handleComplete(deadline.id)}>
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                </Button>
                              )}
                              <Button variant="outline" size="icon" asChild>
                                <Link href={`/deadlines/${deadline.id}`}>
                                  <Edit className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button variant="outline" size="icon" onClick={() => confirmDelete(deadline.id)}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">Nenhum prazo cadastrado.</p>
                    <Button onClick={() => setIsAddDeadlineOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" /> Adicionar Prazo
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Diálogo para adicionar novo prazo */}
      <Dialog open={isAddDeadlineOpen} onOpenChange={setIsAddDeadlineOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Prazo</DialogTitle>
            <DialogDescription>
              Preencha os dados do prazo processual. Todos os campos marcados com * são obrigatórios.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="title">Título do Prazo *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="caseId">Processo *</Label>
                  <Select
                    value={formData.caseId.toString()}
                    onValueChange={(value) => handleSelectChange("caseId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um processo" />
                    </SelectTrigger>
                    <SelectContent>
                      {isCasesLoading ? (
                        <SelectItem value="loading" disabled>Carregando...</SelectItem>
                      ) : cases.length > 0 ? (
                        cases.map((caseItem: Case) => (
                          <SelectItem key={caseItem.id} value={caseItem.id.toString()}>
                            {caseItem.caseNumber} ({caseItem.subject})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="empty" disabled>Nenhum processo encontrado</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => handleSelectChange("priority", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="low">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dueDate">Data Limite *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={handleDateChange}
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label htmlFor="notifyDaysBefore">Notificar com antecedência de (dias)</Label>
                  <Input
                    id="notifyDaysBefore"
                    name="notifyDaysBefore"
                    type="number"
                    min={1}
                    max={30}
                    value={formData.notifyDaysBefore}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDeadlineOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={addDeadlineMutation.isPending}>
                {addDeadlineMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Salvar Prazo
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmação de exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este prazo? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteDeadlineMutation.isPending}>
              {deleteDeadlineMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}