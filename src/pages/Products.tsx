import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const Products = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Produtos</h2>
            <p className="text-muted-foreground">Gerencie seu catálogo de produtos</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Produto
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Produtos</CardTitle>
            <CardDescription>Em breve: Sistema completo de gestão de produtos</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Esta funcionalidade estará disponível na próxima versão. Aqui você poderá cadastrar,
              editar e gerenciar todos os seus produtos.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Products;
