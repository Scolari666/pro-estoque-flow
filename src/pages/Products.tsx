import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
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
import { ProductForm } from "@/components/ProductForm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Product {
  id: string;
  name: string;
  sku: string;
  current_stock: number;
  min_stock: number;
  unit_price: number;
  status: string;
  category_id: string | null;
}

interface Category {
  id: string;
  name: string;
}

const Products = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("user_id", user.id)
      .order("name");

    if (error) {
      toast.error("Erro ao carregar produtos");
      console.error(error);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const loadCategories = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", user.id)
      .order("name");

    if (error) {
      console.error(error);
    } else {
      setCategories(data || []);
    }
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [user]);

  const handleSubmit = async (data: any) => {
    if (!user) return;

    const { error } = await supabase.from("products").insert([
      {
        ...data,
        user_id: user.id,
      },
    ]);

    if (error) {
      toast.error("Erro ao criar produto");
      console.error(error);
    } else {
      toast.success("Produto criado com sucesso!");
      setIsOpen(false);
      loadProducts();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;

    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      toast.error("Erro ao excluir produto");
      console.error(error);
    } else {
      toast.success("Produto excluído com sucesso!");
      loadProducts();
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Produtos</h2>
            <p className="text-muted-foreground">Gerencie seu catálogo de produtos</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Novo Produto</DialogTitle>
              </DialogHeader>
              <ProductForm onSubmit={handleSubmit} categories={categories} />
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Produtos</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Carregando...</p>
            ) : products.length === 0 ? (
              <p className="text-muted-foreground">
                Nenhum produto cadastrado. Clique em "Novo Produto" para começar.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Estoque</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.sku}</TableCell>
                      <TableCell>
                        <span className={product.current_stock <= product.min_stock ? "text-destructive font-semibold" : ""}>
                          {product.current_stock}
                        </span>
                        {product.current_stock <= product.min_stock && (
                          <Badge variant="destructive" className="ml-2">Baixo</Badge>
                        )}
                      </TableCell>
                      <TableCell>R$ {product.unit_price.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={product.status === "ativo" ? "default" : "secondary"}>
                          {product.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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

export default Products;
