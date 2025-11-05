import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface StockMovement {
  id: string;
  user_id: string;
  product_id: string;
  type: "entrada" | "saida";
  quantity: number;
  reason: "compra" | "venda" | "ajuste" | "devolucao" | "avaria" | "transferencia";
  notes?: string;
  reference_number?: string;
  created_at: string;
}

export interface StockMovementFormData {
  product_id: string;
  type: "entrada" | "saida";
  quantity: number;
  reason: "compra" | "venda" | "ajuste" | "devolucao" | "avaria" | "transferencia";
  notes?: string;
  reference_number?: string;
}

export const useStockMovements = (productId?: string) => {
  const queryClient = useQueryClient();

  const { data: movements, isLoading } = useQuery({
    queryKey: productId ? ["stock_movements", productId] : ["stock_movements"],
    queryFn: async () => {
      let query = supabase
        .from("stock_movements")
        .select(`
          *,
          products:product_id(name, sku)
        `)
        .order("created_at", { ascending: false });

      if (productId) {
        query = query.eq("product_id", productId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });

  const createMovement = useMutation({
    mutationFn: async (movement: StockMovementFormData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data: product, error: productError } = await supabase
        .from("products")
        .select("current_stock")
        .eq("id", movement.product_id)
        .single();

      if (productError) throw productError;

      const newStock = movement.type === "entrada"
        ? product.current_stock + movement.quantity
        : product.current_stock - movement.quantity;

      if (newStock < 0) {
        throw new Error("Estoque insuficiente para esta operação");
      }

      const { data, error } = await supabase
        .from("stock_movements")
        .insert([{ ...movement, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      const { error: updateError } = await supabase
        .from("products")
        .update({ current_stock: newStock })
        .eq("id", movement.product_id);

      if (updateError) throw updateError;

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock_movements"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Movimentação registrada com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    movements,
    isLoading,
    createMovement: createMovement.mutate,
    isCreating: createMovement.isPending,
  };
};
