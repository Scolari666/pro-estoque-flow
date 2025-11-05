import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, BarChart3, Plug, Package } from "lucide-react";
import alertsIcon from "@/assets/alerts-icon.jpg";
import analyticsIcon from "@/assets/analytics-icon.jpg";
import integrationIcon from "@/assets/integration-icon.jpg";

const features = [
  {
    title: "Alertas Inteligentes",
    description: "Notificações automáticas para estoque mínimo, produtos inativos e prazos de validade próximos. Nunca mais perca vendas por falta de produto.",
    icon: Bell,
    image: alertsIcon,
  },
  {
    title: "Relatórios Poderosos",
    description: "Curva ABC, análise de giro, inventário completo e muito mais. Tome decisões baseadas em dados reais do seu negócio.",
    icon: BarChart3,
    image: analyticsIcon,
  },
  {
    title: "Integrações Nativas",
    description: "Conecte-se com NFe, marketplaces (Mercado Livre, Shopee), e-commerce e ERPs. Sincronização automática e em tempo real.",
    icon: Plug,
    image: integrationIcon,
  },
  {
    title: "Controle de Lotes",
    description: "Rastreabilidade completa de lotes e prazos de validade. Essencial para alimentos, fármacos e cosméticos.",
    icon: Package,
    image: null,
  },
];

export const FeaturesSection = () => {
  return (
    <section className="py-20 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-foreground">
            Tudo que você precisa para
            <span className="block text-primary">gerenciar seu estoque</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Funcionalidades pensadas para pequenas e médias empresas que querem crescer com eficiência
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index} 
                className="border-2 hover:border-primary/50 transition-smooth hover:shadow-elegant group"
              >
                <CardHeader>
                  <div className="flex items-start gap-4">
                    {feature.image ? (
                      <div className="flex-shrink-0">
                        <img 
                          src={feature.image} 
                          alt={feature.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex-shrink-0 w-16 h-16 rounded-lg gradient-primary flex items-center justify-center">
                        <Icon className="w-8 h-8 text-primary-foreground" />
                      </div>
                    )}
                    <div className="space-y-2">
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
