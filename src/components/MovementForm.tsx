import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const movementSchema = z.object({
  product_id: z.string().min(1, "Produto é obrigatório"),
  type: z.enum(["entrada", "saida", "ajuste"]),
  quantity: z.coerce.number().min(1, "Quantidade deve ser maior que zero"),
  unit_price: z.coerce.number().optional(),
  notes: z.string().optional(),
});

type MovementFormData = z.infer<typeof movementSchema>;

interface MovementFormProps {
  onSubmit: (data: MovementFormData) => void;
  products: Array<{ id: string; name: string; unit_price: number }>;
}

export const MovementForm = ({ onSubmit, products }: MovementFormProps) => {
  const form = useForm<MovementFormData>({
    resolver: zodResolver(movementSchema),
    defaultValues: {
      type: "entrada",
      quantity: 1,
    },
  });

  const selectedProduct = products.find(p => p.id === form.watch("product_id"));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Movimentação</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="entrada">Entrada</SelectItem>
                  <SelectItem value="saida">Saída</SelectItem>
                  <SelectItem value="ajuste">Ajuste</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="product_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Produto</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um produto" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantidade</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="unit_price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preço Unitário</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01" 
                  placeholder={selectedProduct ? String(selectedProduct.unit_price) : "0.00"}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Registrar Movimentação
        </Button>
      </form>
    </Form>
  );
};
