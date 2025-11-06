import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Package, AlertTriangle, DollarSign, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "hsl(var(--muted))", "hsl(var(--muted-foreground))"];

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalValue: 0,
    totalProducts: 0,
    alertProducts: 0,
    todayMovements: 0,
  });
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    const { data: products } = await supabase
      .from("products")
      .select("*")
      .eq("user_id", user.id);

    if (products) {
      const totalValue = products.reduce((sum, p) => sum + (p.current_stock * p.unit_price), 0);
      const alertProducts = products.filter(p => p.current_stock <= p.min_stock).length;

      const { data: todayMovements } = await supabase
        .from("stock_movements")
        .select("*")
        .eq("user_id", user.id)
        .gte("movement_date", new Date().toISOString().split('T')[0]);

      const lowStock = products
        .filter(p => p.current_stock <= p.min_stock)
        .slice(0, 5);

      const topByValue = products
        .sort((a, b) => (b.current_stock * b.unit_price) - (a.current_stock * a.unit_price))
        .slice(0, 5)
        .map(p => ({
          name: p.name.substring(0, 15),
          value: p.current_stock * p.unit_price,
        }));

      setStats({
        totalValue,
        totalProducts: products.length,
        alertProducts,
        todayMovements: todayMovements?.length || 0,
      });

      setLowStockProducts(lowStock);
      setTopProducts(topByValue);
    }

    setLoading(false);
  };

  const statsData = [
    {
      title: "Valor Total em Estoque",
      value: `R$ ${stats.totalValue.toFixed(2)}`,
      change: "",
      icon: DollarSign,
    },
    {
      title: "Produtos Cadastrados",
      value: stats.totalProducts.toString(),
      change: "",
      icon: Package,
    },
    {
      title: "Produtos em Alerta",
      value: stats.alertProducts.toString(),
      change: "",
      icon: AlertTriangle,
    },
    {
      title: "Movimentações Hoje",
      value: stats.todayMovements.toString(),
      change: "",
      icon: TrendingUp,
    },
  ];
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
                  <div className="text-2xl font-bold">{loading ? "..." : stat.value}</div>
                  {stat.change && <p className="text-xs text-muted-foreground">{stat.change}</p>}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts Row */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Top 5 Produtos por Valor</CardTitle>
              <CardDescription>Produtos com maior valor em estoque</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground">Carregando...</p>
              ) : topProducts.length === 0 ? (
                <p className="text-muted-foreground">Nenhum produto cadastrado</p>
              ) : (
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
                    <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <CardTitle>Distribuição de Estoque</CardTitle>
              <CardDescription>Visão geral do inventário</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-[300px]">
              <div className="text-center">
                <p className="text-4xl font-bold">{stats.totalProducts}</p>
                <p className="text-muted-foreground mt-2">Produtos Cadastrados</p>
                <p className="text-2xl font-bold mt-4 text-destructive">{stats.alertProducts}</p>
                <p className="text-muted-foreground mt-1">Em Alerta</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts Table */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Alertas de Estoque Baixo</CardTitle>
            <CardDescription>Produtos que precisam de atenção imediata</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Carregando...</p>
            ) : lowStockProducts.length === 0 ? (
              <p className="text-muted-foreground">Nenhum produto em alerta</p>
            ) : (
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
                        <p className="text-sm text-muted-foreground">Estoque Mínimo</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{product.current_stock} unidades</p>
                      <p className="text-xs text-muted-foreground">
                        Mínimo: {product.min_stock}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
