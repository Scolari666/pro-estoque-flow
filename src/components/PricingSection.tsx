import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Básico",
    price: "79",
    description: "Ideal para pequenos negócios começando a organizar o estoque",
    features: [
      "Até 500 produtos",
      "1 depósito/localização",
      "Controle de estoque mínimo",
      "Relatórios básicos",
      "Suporte por email",
    ],
    popular: false,
  },
  {
    name: "Profissional",
    price: "199",
    description: "Para empresas em crescimento que precisam de mais controle",
    features: [
      "Até 2.000 produtos",
      "Múltiplos depósitos",
      "Controle de lotes e validades",
      "Curva ABC e Dashboard avançado",
      "Integração com 2 marketplaces",
      "Suporte prioritário",
    ],
    popular: true,
  },
  {
    name: "Empresarial",
    price: "Consulte",
    description: "Solução completa para operações de grande porte",
    features: [
      "Produtos ilimitados",
      "Todas as funcionalidades",
      "Integrações ilimitadas",
      "API personalizada",
      "Treinamento dedicado",
      "Gerente de conta exclusivo",
    ],
    popular: false,
  },
];

export const PricingSection = () => {
  return (
    <section className="py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-foreground">
            Planos simples e transparentes
          </h2>
          <p className="text-lg text-muted-foreground">
            Escolha o plano ideal para o seu negócio. Todos com 30 dias de teste grátis.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index}
              className={`relative border-2 transition-smooth ${
                plan.popular 
                  ? 'border-primary shadow-glow scale-105' 
                  : 'border-border hover:border-primary/50'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="gradient-secondary text-secondary-foreground text-sm font-bold px-4 py-1 rounded-full">
                    Mais Popular
                  </span>
                </div>
              )}
              
              <CardHeader className="text-center pb-8 pt-6">
                <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                <div className="mb-2">
                  {plan.price === "Consulte" ? (
                    <div className="text-4xl font-bold text-foreground">{plan.price}</div>
                  ) : (
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-2xl text-muted-foreground">R$</span>
                      <span className="text-5xl font-bold text-foreground">{plan.price}</span>
                      <span className="text-muted-foreground">/mês</span>
                    </div>
                  )}
                </div>
                <CardDescription className="text-base">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center mt-0.5">
                        <Check className="w-3 h-3 text-secondary" />
                      </div>
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className="w-full" 
                  variant={plan.popular ? "default" : "outline"}
                  size="lg"
                >
                  {plan.price === "Consulte" ? "Falar com Vendas" : "Começar Teste Grátis"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            Todos os planos incluem 30 dias de teste grátis. Sem cartão de crédito necessário.
          </p>
        </div>
      </div>
    </section>
  );
};
