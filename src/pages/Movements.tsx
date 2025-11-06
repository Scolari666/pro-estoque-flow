import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MovementForm } from "@/components/MovementForm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface Movement {
  id: string;
  type: string;
  quantity: number;
  unit_price: number | null;
  total_price: number | null;
  notes: string | null;
  movement_date: string;
  products: { name: string };
}

interface Product {
  id: string;
  name: string;
  unit_price: number;
}

const Movements = () => {
  const { user } = useAuth();
  const [movements, setMovements] = useState<Movement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadMovements = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("stock_movements")
      .select(`
        *,
        products (name)
      `)
      .eq("user_id", user.id)
      .order("movement_date", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar movimentações");
      console.error(error);
    } else {
      setMovements(data || []);
    }
    setLoading(false);
  };

  const loadProducts = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("products")
      .select("id, name, unit_price")
      .eq("user_id", user.id)
      .eq("status", "ativo")
      .order("name");

    if (error) {
      console.error(error);
    } else {
      setProducts(data || []);
    }
  };

  useEffect(() => {
    loadMovements();
    loadProducts();
  }, [user]);

  const handleSubmit = async (data: any) => {
    if (!user) return;

    const totalPrice = data.unit_price ? data.quantity * data.unit_price : null;

    const { error } = await supabase.from("stock_movements").insert([
      {
        ...data,
        total_price: totalPrice,
        user_id: user.id,
      },
    ]);

    if (error) {
      toast.error("Erro ao registrar movimentação");
      console.error(error);
    } else {
      toast.success("Movimentação registrada com sucesso!");
      setIsOpen(false);
      loadMovements();
    }
  };

  const getMovementBadge = (type: string) => {
    switch (type) {
      case "entrada":
        return <Badge className="bg-secondary">Entrada</Badge>;
      case "saida":
        return <Badge variant="destructive">Saída</Badge>;
      case "ajuste":
        return <Badge variant="outline">Ajuste</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Movimentações</h2>
            <p className="text-muted-foreground">Entradas e saídas de estoque</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Movimentação
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Movimentação</DialogTitle>
              </DialogHeader>
              <MovementForm onSubmit={handleSubmit} products={products} />
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Histórico de Movimentações</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Carregando...</p>
            ) : movements.length === 0 ? (
              <p className="text-muted-foreground">
                Nenhuma movimentação registrada. Clique em "Nova Movimentação" para começar.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Valor Total</TableHead>
                    <TableHead>Observações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell>
                        {format(new Date(movement.movement_date), "dd/MM/yyyy HH:mm")}
                      </TableCell>
                      <TableCell>{getMovementBadge(movement.type)}</TableCell>
                      <TableCell className="font-medium">{movement.products.name}</TableCell>
                      <TableCell>{movement.quantity}</TableCell>
                      <TableCell>
                        {movement.total_price ? `R$ ${movement.total_price.toFixed(2)}` : "-"}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {movement.notes || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Movements;
