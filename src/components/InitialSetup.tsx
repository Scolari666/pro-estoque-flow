import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { sampleCategories, sampleSuppliers, sampleProducts } from "@/lib/sample-data";
import { toast } from "sonner";

export const InitialSetup = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const setupInitialData = async () => {
      if (!user) {
        setIsChecking(false);
        return;
      }

      const { data: existingProducts } = await supabase
        .from("products")
        .select("id")
        .limit(1);

      if (existingProducts && existingProducts.length > 0) {
        setIsChecking(false);
        return;
      }

      try {
        const categoryIds: string[] = [];
        for (const category of sampleCategories) {
          const { data, error } = await supabase
            .from("categories")
            .insert([{ ...category, user_id: user.id }])
            .select()
            .single();

          if (!error && data) {
            categoryIds.push(data.id);
          }
        }

        const supplierIds: string[] = [];
        for (const supplier of sampleSuppliers) {
          const { data, error } = await supabase
            .from("suppliers")
            .insert([{ ...supplier, user_id: user.id }])
            .select()
            .single();

          if (!error && data) {
            supplierIds.push(data.id);
          }
        }

        for (let i = 0; i < sampleProducts.length; i++) {
          const product = sampleProducts[i];
          await supabase.from("products").insert([
            {
              ...product,
              user_id: user.id,
              category_id: categoryIds[i % categoryIds.length] || null,
              supplier_id: supplierIds[i % supplierIds.length] || null,
            },
          ]);
        }

        toast.success("Dados de exemplo carregados com sucesso!");
      } catch (error) {
        console.error("Erro ao carregar dados iniciais:", error);
      } finally {
        setIsChecking(false);
      }
    };

    setupInitialData();
  }, [user]);

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
};
