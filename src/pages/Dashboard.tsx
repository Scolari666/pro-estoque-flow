import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Package, AlertTriangle, DollarSign, TrendingUp } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useStockMovements } from "@/hooks/useStockMovements";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { InitialSetup } from "@/components/InitialSetup";

const Dashboard = () => {
  const { products } = useProducts();
  const { movements } = useStockMovements();

  const totalProducts = products?.length || 0;
  const productsInAlert = products?.filter(p => p.current_stock <= p.minimum_stock).length || 0;

  const totalValue = products?.reduce((acc, p) => acc + (p.current_stock * p.sale_price), 0) || 0;

  const todayMovements = movements?.filter(m => {
    const today = new Date().toDateString();
    const movDate = new Date(m.created_at).toDateString();
    return today === movDate && m.type === "saida";
  }).length || 0;

  const statsData = [
    {
      title: "Valor Total em Estoque",
      value: new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(totalValue),
      change: "+12.5%",
      icon: DollarSign,
      trend: "up",
    },
    {
      title: "Produtos Cadastrados",
      value: totalProducts.toString(),
      change: `+${totalProducts}`,
      icon: Package,
      trend: "up",
    },
    {
      title: "Produtos em Alerta",
      value: productsInAlert.toString(),
      change: productsInAlert > 0 ? "Atenção necessária" : "Tudo OK",
      icon: AlertTriangle,
      trend: productsInAlert > 0 ? "down" : "up",
    },
    {
      title: "Saídas Hoje",
      value: todayMovements.toString(),
      change: "+8.2%",
      icon: TrendingUp,
      trend: "up",
    },
  ];

  const movementsByMonth = movements?.reduce((acc, m) => {
    const month = new Date(m.created_at).toLocaleDateString("pt-BR", { month: "short" });
    const existing = acc.find(item => item.name === month);

    if (existing) {
      if (m.type === "entrada") {
        existing.entradas += m.quantity;
      } else {
        existing.saidas += m.quantity;
      }
    } else {
      acc.push({
        name: month,
        entradas: m.type === "entrada" ? m.quantity : 0,
        saidas: m.type === "saida" ? m.quantity : 0,
      });
    }

    return acc;
  }, [] as { name: string; entradas: number; saidas: number }[]) || [];

  const lowStockProducts = products?.filter(p => p.current_stock <= p.minimum_stock).slice(0, 5) || [];

  return (
    <InitialSetup>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold">Dashboard</h2>
            <p className="text-muted-foreground">Visão geral do seu estoque em tempo real</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statsData.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="border-2 hover:shadow-elegant transition-smooth">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className={`text-xs ${stat.trend === 'up' ? 'text-secondary' : 'text-destructive'}`}>
                      {stat.change}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="border-2">
            <CardHeader>
              <CardTitle>Movimentações</CardTitle>
              <CardDescription>Entradas e saídas por período</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={movementsByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="entradas" stroke="hsl(var(--secondary))" strokeWidth={2} />
                  <Line type="monotone" dataKey="saidas" stroke="hsl(var(--destructive))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {lowStockProducts.length > 0 && (
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Alertas de Estoque Baixo</CardTitle>
                <CardDescription>Produtos que precisam de atenção imediata</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lowStockProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-4 rounded-lg border-2 hover:shadow-sm transition-smooth"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-3 h-3 rounded-full bg-destructive" />
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{product.current_stock} unidades</p>
                        <p className="text-xs text-muted-foreground">
                          Mínimo: {product.minimum_stock}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </InitialSetup>
  );
};

export default Dashboard;
