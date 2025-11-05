import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

export const HeroSection = () => {
  return (
    <section className="gradient-hero relative overflow-hidden py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <h1 className="text-foreground">
                Gestão de Estoque
                <span className="block bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent">
                  Inteligente e Simples
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl">
                Controle completo do seu inventário com alertas inteligentes, 
                relatórios precisos e integrações perfeitas. Reduza custos e 
                aumente a lucratividade do seu negócio.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="group">
                Experimente Grátis por 30 Dias
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-smooth" />
              </Button>
              <Button size="lg" variant="outline" className="border-2">
                Ver Demonstração
              </Button>
            </div>

            <div className="flex items-center gap-8 pt-4">
              <div>
                <div className="text-3xl font-bold text-foreground">10.000+</div>
                <div className="text-sm text-muted-foreground">Empresas Ativas</div>
              </div>
              <div className="h-12 w-px bg-border" />
              <div>
                <div className="text-3xl font-bold text-foreground">98%</div>
                <div className="text-sm text-muted-foreground">Satisfação</div>
              </div>
              <div className="h-12 w-px bg-border" />
              <div>
                <div className="text-3xl font-bold text-foreground">24/7</div>
                <div className="text-sm text-muted-foreground">Suporte</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 blur-3xl rounded-full" />
            <img 
              src={heroImage}
              alt="Gestão inteligente de estoque com dashboard moderno"
              className="relative rounded-2xl shadow-elegant w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
