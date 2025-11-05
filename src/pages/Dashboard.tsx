import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Package, TrendingDown, TrendingUp, AlertTriangle, DollarSign } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const statsData = [
  {
    title: "Valor Total em Estoque",
    value: "R$ 487.350",
    change: "+12.5%",
    icon: DollarSign,
    trend: "up",
  },
  {
    title: "Produtos Cadastrados",
    value: "1.247",
    change: "+23",
    icon: Package,
    trend: "up",
  },
  {
    title: "Produtos em Alerta",
    value: "18",
    change: "-5",
    icon: AlertTriangle,
    trend: "down",
  },
  {
    title: "Saídas Hoje",
    value: "156",
    change: "+8.2%",
    icon: TrendingUp,
    trend: "up",
  },
];

const salesData = [
  { name: "Jan", vendas: 4000, entradas: 2400 },
  { name: "Fev", vendas: 3000, entradas: 1398 },
  { name: "Mar", vendas: 2000, entradas: 9800 },
  { name: "Abr", vendas: 2780, entradas: 3908 },
  { name: "Mai", vendas: 1890, entradas: 4800 },
  { name: "Jun", vendas: 2390, entradas: 3800 },
];

const topProducts = [
  { name: "Produto A", value: 35 },
  { name: "Produto B", value: 25 },
  { name: "Produto C", value: 20 },
  { name: "Produto D", value: 12 },
  { name: "Outros", value: 8 },
];

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "hsl(var(--muted))", "hsl(var(--muted-foreground))"];

const recentAlerts = [
  { id: 1, product: "Café Pilão 500g", type: "Estoque Mínimo", quantity: 5, status: "critical" },
  { id: 2, product: "Leite Integral 1L", type: "Validade Próxima", quantity: 12, status: "warning" },
  { id: 3, product: "Arroz Tio João 5kg", type: "Estoque Mínimo", quantity: 8, status: "critical" },
];

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground">Visão geral do seu estoque em tempo real</p>
        </div>

        {/* Stats Cards */}
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
                  <p className={`text-xs ${stat.trend === 'up' ? 'text-secondary' : 'text-primary'}`}>
                    {stat.change} desde o último mês
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts Row */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Movimentações Mensais</CardTitle>
              <CardDescription>Entradas vs Saídas dos últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="vendas" stroke="hsl(var(--primary))" strokeWidth={2} />
                  <Line type="monotone" dataKey="entradas" stroke="hsl(var(--secondary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <CardTitle>Produtos Mais Vendidos</CardTitle>
              <CardDescription>Distribuição de vendas por produto</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={topProducts}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    {topProducts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Alerts Table */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Alertas Recentes</CardTitle>
            <CardDescription>Produtos que precisam de atenção imediata</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-4 rounded-lg border-2 hover:shadow-sm transition-smooth"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        alert.status === "critical" ? "bg-destructive" : "bg-yellow-500"
                      }`}
                    />
                    <div>
                      <p className="font-medium">{alert.product}</p>
                      <p className="text-sm text-muted-foreground">{alert.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{alert.quantity} unidades</p>
                    <p className="text-xs text-muted-foreground">
                      {alert.status === "critical" ? "Ação urgente" : "Atenção"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
