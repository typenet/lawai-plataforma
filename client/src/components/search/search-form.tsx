import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Search } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

const searchSchema = z.object({
  query: z.string().min(3, "A pesquisa deve ter pelo menos 3 caracteres"),
  sources: z.object({
    jurisprudence: z.boolean().default(true),
    doctrine: z.boolean().default(true),
    legislation: z.boolean().default(true),
  }),
});

type SearchFormValues = z.infer<typeof searchSchema>;

export function SearchForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      query: "",
      sources: {
        jurisprudence: true,
        doctrine: true,
        legislation: true,
      },
    },
  });

  const onSubmit = async (values: SearchFormValues) => {
    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/search", values);
      queryClient.invalidateQueries({ queryKey: ["/api/search/results"] });
      toast({
        title: "Pesquisa realizada",
        description: "Seus resultados foram atualizados.",
      });
    } catch (error) {
      toast({
        title: "Erro ao realizar pesquisa",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg leading-6 font-medium text-navy">Pesquisa Jurídica Inteligente</h3>
        <div className="mt-2 max-w-xl text-sm text-neutral-dark">
          <p>Utilize nossa IA para pesquisar jurisprudência, doutrina e legislação relevante ao seu caso.</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-5 space-y-4">
            <div className="flex rounded-md shadow-sm">
              <FormField
                control={form.control}
                name="query"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Digite sua pesquisa jurídica (ex: responsabilidade civil por danos morais)"
                        className="rounded-l-md rounded-r-none border-r-0 focus:ring-navy"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="rounded-l-none bg-navy hover:bg-navy-light"
                disabled={isSubmitting}
              >
                <Search className="mr-2 h-4 w-4" />
                <span>Pesquisar</span>
              </Button>
            </div>

            <div className="flex space-x-4">
              <FormField
                control={form.control}
                name="sources.jurisprudence"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="text-navy rounded border-neutral-light focus:ring-navy"
                      />
                    </FormControl>
                    <FormLabel className="text-sm text-neutral-dark">Jurisprudência</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sources.doctrine"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="text-navy rounded border-neutral-light focus:ring-navy"
                      />
                    </FormControl>
                    <FormLabel className="text-sm text-neutral-dark">Doutrina</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sources.legislation"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="text-navy rounded border-neutral-light focus:ring-navy"
                      />
                    </FormControl>
                    <FormLabel className="text-sm text-neutral-dark">Legislação</FormLabel>
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
