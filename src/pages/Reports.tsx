import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ProductReport {
  id: string;
  name: string;
  current_stock: number;
  unit_price: number;
  total_value: number;
  movements_count: number;
}

const Reports = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<ProductReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, [user]);

  const loadReports = async () => {
    if (!user) return;

    const { data: productsData, error } = await supabase
      .from("products")
      .select(`
        id,
        name,
        current_stock,
        unit_price
      `)
      .eq("user_id", user.id)
      .order("name");

    if (error) {
      console.error(error);
    } else {
      const productsWithValue = (productsData || []).map((p) => ({
        ...p,
        total_value: p.current_stock * p.unit_price,
        movements_count: 0,
      }));
      setProducts(productsWithValue);
    }
    setLoading(false);
  };

  const totalStockValue = products.reduce((sum, p) => sum + p.total_value, 0);
  const totalProducts = products.length;

  const stockData = products
    .sort((a, b) => b.total_value - a.total_value)
    .slice(0, 10)
    .map((p) => ({
      name: p.name.substring(0, 15),
      value: p.total_value,
    }));

  const curvaABC = products
    .sort((a, b) => b.total_value - a.total_value)
    .map((product, index, arr) => {
      const cumValue = arr.slice(0, index + 1).reduce((sum, p) => sum + p.total_value, 0);
      const percentage = (cumValue / totalStockValue) * 100;
      
      let classification = "C";
      if (percentage <= 80) classification = "A";
      else if (percentage <= 95) classification = "B";

      return {
        ...product,
        classification,
        percentage: ((product.total_value / totalStockValue) * 100).toFixed(2),
      };
    });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold">Relatórios</h2>
          <p className="text-muted-foreground">Análises e insights do seu estoque</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Valor Total em Estoque</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {totalStockValue.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {totalProducts > 0 ? (totalStockValue / totalProducts).toFixed(2) : "0.00"}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="curva-abc" className="space-y-4">
          <TabsList>
            <TabsTrigger value="curva-abc">Curva ABC</TabsTrigger>
            <TabsTrigger value="estoque-valor">Estoque por Valor</TabsTrigger>
          </TabsList>

          <TabsContent value="curva-abc" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Análise Curva ABC</CardTitle>
                <CardDescription>
                  Classificação dos produtos por valor em estoque
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-muted-foreground">Carregando...</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead>Estoque</TableHead>
                        <TableHead>Valor Unit.</TableHead>
                        <TableHead>Valor Total</TableHead>
                        <TableHead>% do Total</TableHead>
                        <TableHead>Classe</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {curvaABC.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.current_stock}</TableCell>
                          <TableCell>R$ {product.unit_price.toFixed(2)}</TableCell>
                          <TableCell>R$ {product.total_value.toFixed(2)}</TableCell>
                          <TableCell>{product.percentage}%</TableCell>
                          <TableCell>
                            <span
                              className={`font-bold ${
                                product.classification === "A"
                                  ? "text-secondary"
                                  : product.classification === "B"
                                  ? "text-yellow-500"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {product.classification}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="estoque-valor" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top 10 Produtos por Valor em Estoque</CardTitle>
                <CardDescription>Produtos com maior valor total em estoque</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={stockData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
                    <Bar dataKey="value" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
