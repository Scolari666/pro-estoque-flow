import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Reports = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold">Relatórios</h2>
          <p className="text-muted-foreground">Análises e insights do seu estoque</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Central de Relatórios</CardTitle>
            <CardDescription>Em breve: Curva ABC, Giro de Estoque e muito mais</CardDescription>
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

export default Reports;
