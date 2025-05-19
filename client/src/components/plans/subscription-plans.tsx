import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import PlanCard from "./plan-card";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

export function SubscriptionPlans() {
  const { data, isLoading } = useQuery<{ currentPlan: string }>({
    queryKey: ["/api/subscription"],
  });

  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const planMutation = useMutation({
    mutationFn: async (planId: string) => {
      await apiRequest("POST", "/api/subscription/update", { planId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscription"] });
      toast({
        title: "Plano atualizado com sucesso",
        description: "Seu plano foi atualizado e já está ativo.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar plano",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao atualizar seu plano",
        variant: "destructive",
      });
    },
  });

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    planMutation.mutate(planId);
  };

  const plans = [
    {
      id: "basic",
      name: "Básico",
      price: "R$ 99",
      description: "Ideal para advogados autônomos ou escritórios iniciantes.",
      features: [
        { name: "Pesquisas jurídicas básicas (30/mês)", included: true },
        { name: "Análise de documentos (10/mês)", included: true },
        { name: "Sugestões básicas de petições", included: true },
        { name: "Pesquisa avançada de jurisprudência", included: false },
        { name: "Assistente virtual", included: false },
      ],
    },
    {
      id: "professional",
      name: "Profissional",
      price: "R$ 199",
      description: "Para advogados e escritórios em crescimento.",
      features: [
        { name: "Pesquisas jurídicas avançadas (100/mês)", included: true },
        { name: "Análise de documentos (30/mês)", included: true },
        { name: "Sugestões completas de petições", included: true },
        { name: "Pesquisa avançada de jurisprudência", included: true },
        { name: "Assistente virtual", included: false },
      ],
      isPopular: true,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "R$ 399",
      description: "Para escritórios de médio e grande porte.",
      features: [
        { name: "Pesquisas jurídicas ilimitadas", included: true },
        { name: "Análise de documentos ilimitada", included: true },
        { name: "Biblioteca completa de petições", included: true },
        { name: "Pesquisa avançada de jurisprudência", included: true },
        { name: "Assistente virtual disponível 24/7", included: true },
      ],
    },
  ];

  const currentPlan = isLoading ? null : data?.currentPlan || null;

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg leading-6 font-medium text-navy">Planos de Assinatura</h3>
        <div className="mt-2 max-w-xl text-sm text-neutral-dark">
          <p>Escolha o plano ideal para suas necessidades jurídicas.</p>
        </div>
        
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              name={plan.name}
              price={plan.price}
              description={plan.description}
              features={plan.features}
              isPopular={plan.isPopular}
              isActive={currentPlan === plan.id || selectedPlan === plan.id}
              onSelect={() => handleSelectPlan(plan.id)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
