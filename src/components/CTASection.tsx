import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const CTASection = () => {
  return (
    <section className="py-20 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-foreground">
              Pronto para transformar sua
              <span className="block text-primary">gestão de estoque?</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Junte-se a milhares de empresas que já economizam tempo e dinheiro 
              com o EstoquePro. Comece seu teste gratuito hoje mesmo.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="group">
              Começar Agora - É Grátis
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-smooth" />
            </Button>
            <Button size="lg" variant="outline" className="border-2">
              Agendar Demonstração
            </Button>
          </div>

          <div className="pt-8 flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-secondary" />
              <span>30 dias grátis</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-secondary" />
              <span>Sem cartão de crédito</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-secondary" />
              <span>Cancele quando quiser</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Check = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);
