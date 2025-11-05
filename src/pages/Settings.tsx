import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Settings = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold">Configurações</h2>
          <p className="text-muted-foreground">Personalize seu sistema</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Configurações da Conta</CardTitle>
            <CardDescription>Em breve: Gestão completa de configurações</CardDescription>
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

export default Settings;
