import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Check, ArrowRight, Users, FileText, Search } from "lucide-react";
import { useABTest } from "@/hooks/useABTest";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const { variant, isVariantA, isVariantB } = useABTest({
    testId: "home_page_layout",
    defaultVariant: "A"
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section - Variante A/B */}
        {isVariantA ? (
          // Variante A - Layout Original com nova paleta de cores
          <div className="bg-[#F8F6FF] text-[#28283E] py-12 md:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
                <div>
                  <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-[#28283E]">
                    Inteligência Artificial
                  </h1>
                  <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-[#9F85FF] mt-2">
                    para Profissionais do Direito
                  </h2>
                  <p className="mt-6 text-xl max-w-3xl text-[#4A4A65]">
                    Aumente sua produtividade com análise automática de documentos jurídicos,
                    extraia informações relevantes e receba recomendações inteligentes.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-4">
                    <Button 
                      className="bg-[#9F85FF] hover:bg-[#8A6EF3] text-white font-medium px-8 py-3 text-lg"
                      onClick={() => window.location.href = isAuthenticated ? "/dashboard" : "/api/login"}
                    >
                      {isAuthenticated ? "Acessar Dashboard" : "Começar Agora"}
                    </Button>
                    <Link href="#recursos">
                      <Button variant="outline" className="border-[#9F85FF] text-[#9F85FF] hover:bg-[#F8F6FF]/80 px-8 py-3 text-lg">
                        Explorar Recursos
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="mt-12 lg:mt-0">
                  <div className="bg-white rounded-lg p-6 shadow-lg">
                    <img 
                      src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                      alt="Documentos jurídicos com IA" 
                      className="w-full rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Variante B - Layout Alternativo com nova paleta
          <div className="bg-gradient-to-br from-[#9F85FF] to-[#BDA8FF] text-white py-16 md:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white mb-6">
                  Revolucione Sua Prática Jurídica
                </h1>
                <p className="mt-4 text-xl max-w-3xl mx-auto text-white/90">
                  Sua assistente jurídica com inteligência artificial, disponível 24 horas por dia.
                  Economize até 70% do seu tempo em pesquisas e análises.
                </p>
                <div className="mt-10 flex flex-wrap gap-6 justify-center">
                  <Button 
                    className="bg-[#FFD700] hover:bg-[#F5C400] text-[#0a1d33] font-medium px-10 py-4 text-lg shadow-lg"
                    onClick={() => window.location.href = isAuthenticated ? "/dashboard" : "/api/login"}
                  >
                    {isAuthenticated ? "Meu Dashboard" : "Experimente Grátis"}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-white/60 text-white hover:bg-white/10 px-10 py-4 text-lg"
                    onClick={() => window.scrollTo({ top: document.querySelector('#recursos')?.offsetTop, behavior: 'smooth' })}
                  >
                    Ver Demonstração
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/15 transition-all">
                  <div className="w-16 h-16 mx-auto bg-[#FFD700]/20 rounded-full flex items-center justify-center mb-4">
                    <Search className="w-8 h-8 text-[#FFD700]" />
                  </div>
                  <h3 className="text-xl font-bold">Pesquisa Inteligente</h3>
                  <p className="mt-3 text-white/80">Encontre jurisprudência relevante em segundos com precisão inigualável.</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/15 transition-all">
                  <div className="w-16 h-16 mx-auto bg-[#FFD700]/20 rounded-full flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-[#FFD700]" />
                  </div>
                  <h3 className="text-xl font-bold">Análise de Documentos</h3>
                  <p className="mt-3 text-white/80">Analise contratos e petições automaticamente, identificando riscos.</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/15 transition-all">
                  <div className="w-16 h-16 mx-auto bg-[#FFD700]/20 rounded-full flex items-center justify-center mb-4">
                    <Users className="w-8 h-8 text-[#FFD700]" />
                  </div>
                  <h3 className="text-xl font-bold">Suporte 24h</h3>
                  <p className="mt-3 text-white/80">Assistência jurídica baseada em IA disponível a qualquer momento.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Features Section */}
        <div id="recursos" className="py-16 bg-neutral-lightest">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-navy sm:text-4xl">
                Recursos Poderosos para Profissionais do Direito
              </h2>
              <p className="mt-4 max-w-2xl text-xl text-neutral-dark mx-auto">
                Nossas ferramentas de IA são projetadas especificamente para o universo jurídico
              </p>
            </div>

            <div className="mt-16">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {/* Feature 1 */}
                <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-navy-light rounded-md flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-navy">Pesquisa Jurídica Inteligente</h3>
                  <p className="mt-2 text-neutral-dark">
                    Encontre jurisprudência, doutrina e legislação relevante em segundos com nossa IA treinada em conteúdo jurídico.
                  </p>
                </div>

                {/* Feature 2 */}
                <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-gold rounded-md flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-navy">Análise de Documentos</h3>
                  <p className="mt-2 text-neutral-dark">
                    Upload de contratos e petições para análise automática. Identifique pontos críticos e receba sugestões.
                  </p>
                </div>

                {/* Feature 3 */}
                <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-navy-light rounded-md flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-navy">Elaboração de Documentos</h3>
                  <p className="mt-2 text-neutral-dark">
                    Modelos inteligentes para petições, contratos e procurações com base nas melhores práticas jurídicas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-navy text-center">
              O que dizem nossos clientes
            </h2>
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {/* Testimonial 1 */}
              <div className="bg-neutral-lightest p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <img 
                    className="h-12 w-12 rounded-full mr-4 object-cover" 
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                    alt="Cliente" 
                  />
                  <div>
                    <h4 className="font-semibold text-navy">Ana Costa</h4>
                    <p className="text-sm text-neutral-medium">Advogada Tributarista</p>
                  </div>
                </div>
                <p className="text-neutral-dark">
                  "A plataforma reduziu drasticamente o tempo que eu gastava pesquisando jurisprudência. Consigo encontrar casos relevantes em minutos."
                </p>
              </div>

              {/* Testimonial 2 */}
              <div className="bg-neutral-lightest p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <img 
                    className="h-12 w-12 rounded-full mr-4 object-cover" 
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                    alt="Cliente" 
                  />
                  <div>
                    <h4 className="font-semibold text-navy">Carlos Mendes</h4>
                    <p className="text-sm text-neutral-medium">Direito Empresarial</p>
                  </div>
                </div>
                <p className="text-neutral-dark">
                  "A análise de contratos economiza horas do meu tempo e identifica cláusulas problemáticas que eu poderia facilmente não perceber."
                </p>
              </div>

              {/* Testimonial 3 */}
              <div className="bg-neutral-lightest p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <img 
                    className="h-12 w-12 rounded-full mr-4 object-cover" 
                    src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                    alt="Cliente" 
                  />
                  <div>
                    <h4 className="font-semibold text-navy">Helena Santos</h4>
                    <p className="text-sm text-neutral-medium">Escritório de Advocacia</p>
                  </div>
                </div>
                <p className="text-neutral-dark">
                  "Implementamos a JurisIA em todo nosso escritório e aumentamos nossa produtividade em mais de 30%. Vale cada centavo investido."
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="py-16 bg-neutral-lightest">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-navy sm:text-4xl">
                Planos para cada necessidade
              </h2>
              <p className="mt-4 max-w-2xl text-xl text-neutral-dark mx-auto">
                Escolha o plano que melhor se adapta ao seu perfil profissional
              </p>
            </div>

            <div className="mt-12 grid gap-8 lg:grid-cols-3">
              {/* Basic Plan */}
              <div className="border border-neutral-light rounded-lg bg-white overflow-hidden shadow-sm">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-navy">Básico</h3>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-3xl font-extrabold text-navy">R$ 99</span>
                    <span className="ml-1 text-xl font-medium text-neutral-medium">/mês</span>
                  </div>
                  <p className="mt-5 text-sm text-neutral-dark">Ideal para advogados autônomos ou escritórios iniciantes.</p>
                
                  <ul className="mt-6 space-y-4">
                    <li className="flex items-start">
                      <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                      <span className="ml-3 text-sm text-neutral-dark">Pesquisas jurídicas básicas (30/mês)</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                      <span className="ml-3 text-sm text-neutral-dark">Análise de documentos (10/mês)</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                      <span className="ml-3 text-sm text-neutral-dark">Sugestões básicas de petições</span>
                    </li>
                  </ul>

                  <div className="mt-8">
                    <Button
                      className="w-full border border-navy text-navy bg-white hover:bg-neutral-lightest"
                      variant="outline"
                      onClick={() => window.location.href = isAuthenticated ? "/dashboard" : "/api/login"}
                    >
                      Começar agora
                    </Button>
                  </div>
                </div>
              </div>

              {/* Professional Plan */}
              <div className="border-2 border-gold rounded-lg bg-white overflow-hidden shadow-md transform scale-105 z-10">
                <div className="bg-gold text-white text-center text-sm font-medium py-1">
                  Mais Popular
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-medium text-navy">Profissional</h3>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-3xl font-extrabold text-navy">R$ 199</span>
                    <span className="ml-1 text-xl font-medium text-neutral-medium">/mês</span>
                  </div>
                  <p className="mt-5 text-sm text-neutral-dark">Para advogados e escritórios em crescimento.</p>
                
                  <ul className="mt-6 space-y-4">
                    <li className="flex items-start">
                      <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                      <span className="ml-3 text-sm text-neutral-dark">Pesquisas jurídicas avançadas (100/mês)</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                      <span className="ml-3 text-sm text-neutral-dark">Análise de documentos (30/mês)</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                      <span className="ml-3 text-sm text-neutral-dark">Sugestões completas de petições</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                      <span className="ml-3 text-sm text-neutral-dark">Pesquisa avançada de jurisprudência</span>
                    </li>
                  </ul>

                  <div className="mt-8">
                    <Button
                      className="w-full bg-navy hover:bg-navy-light"
                      onClick={() => window.location.href = isAuthenticated ? "/dashboard" : "/api/login"}
                    >
                      Começar agora
                    </Button>
                  </div>
                </div>
              </div>

              {/* Enterprise Plan */}
              <div className="border border-neutral-light rounded-lg bg-white overflow-hidden shadow-sm">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-navy">Enterprise</h3>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-3xl font-extrabold text-navy">R$ 399</span>
                    <span className="ml-1 text-xl font-medium text-neutral-medium">/mês</span>
                  </div>
                  <p className="mt-5 text-sm text-neutral-dark">Para escritórios de médio e grande porte.</p>
                
                  <ul className="mt-6 space-y-4">
                    <li className="flex items-start">
                      <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                      <span className="ml-3 text-sm text-neutral-dark">Pesquisas jurídicas ilimitadas</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                      <span className="ml-3 text-sm text-neutral-dark">Análise de documentos ilimitada</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                      <span className="ml-3 text-sm text-neutral-dark">Biblioteca completa de petições</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                      <span className="ml-3 text-sm text-neutral-dark">Assistente virtual disponível 24/7</span>
                    </li>
                  </ul>

                  <div className="mt-8">
                    <Button
                      className="w-full border border-navy text-navy bg-white hover:bg-neutral-lightest"
                      variant="outline"
                      onClick={() => window.location.href = isAuthenticated ? "/dashboard" : "/api/login"}
                    >
                      Começar agora
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-navy text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold sm:text-4xl">
                Pronto para revolucionar sua prática jurídica?
              </h2>
              <p className="mt-4 text-xl max-w-2xl mx-auto">
                Junte-se a milhares de profissionais que já economizam tempo e melhoram seus resultados.
              </p>
              <div className="mt-8">
                <Button 
                  className="bg-gold hover:bg-gold-dark text-navy font-medium text-lg px-8 py-3"
                  onClick={() => window.location.href = isAuthenticated ? "/dashboard" : "/api/login"}
                >
                  {isAuthenticated ? "Ir para o Dashboard" : "Criar Conta Agora"} 
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
