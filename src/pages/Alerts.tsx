import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Alerts = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold">Alertas</h2>
          <p className="text-muted-foreground">Sistema de notificações inteligentes</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Central de Alertas</CardTitle>
            <CardDescription>Em breve: Alertas de estoque mínimo, validades e mais</CardDescription>
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

export default Alerts;
