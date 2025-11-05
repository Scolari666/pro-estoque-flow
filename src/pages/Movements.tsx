import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Movements = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold">Movimentações</h2>
          <p className="text-muted-foreground">Entradas e saídas de estoque</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Histórico de Movimentações</CardTitle>
            <CardDescription>Em breve: Controle completo de entradas e saídas</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Esta funcionalidade estará disponível na próxima versão.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Movements;
