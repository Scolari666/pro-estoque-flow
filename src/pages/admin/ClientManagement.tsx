import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Edit, Eye } from "lucide-react";

interface ClientFeatures {
  inventoryManagement?: boolean;
  productCategories?: boolean;
  supplierManagement?: boolean;
  reports?: boolean;
  multiWarehouse?: boolean;
  barcodeSupport?: boolean;
  apiAccess?: boolean;
  emailAlerts?: boolean;
}

interface Client {
  id: string;
  email: string;
  full_name: string;
  company_name: string;
  created_at: string;
  is_active: boolean;
  settings?: {
    subscription_plan: string;
    is_active: boolean;
    features: ClientFeatures;
  };
}

export default function ClientManagement() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'client');

      if (!roles || roles.length === 0) {
        setClients([]);
        setLoading(false);
        return;
      }

      const clientIds = roles.map(r => r.user_id);

      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', clientIds);

      const { data: settings } = await supabase
        .from('client_settings')
        .select('*')
        .in('user_id', clientIds);

      const clientsData = profiles?.map(profile => {
        const clientSettings = settings?.find(s => s.user_id === profile.id);
        return {
          id: profile.id,
          email: '', // Email não está no profile, precisaria vir do auth.users
          full_name: profile.full_name || '',
          company_name: profile.company_name || '',
          created_at: profile.created_at || '',
          is_active: profile.is_active || false,
          settings: clientSettings ? {
            subscription_plan: clientSettings.subscription_plan,
            is_active: clientSettings.is_active,
            features: (clientSettings.features as ClientFeatures) || {},
          } : undefined,
        };
      }) || [];

      setClients(clientsData);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  const toggleClientStatus = async (clientId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !currentStatus })
        .eq('id', clientId);

      if (error) throw error;

      toast.success(`Cliente ${!currentStatus ? 'ativado' : 'desativado'} com sucesso`);
      fetchClients();
    } catch (error) {
      console.error('Error updating client status:', error);
      toast.error('Erro ao atualizar status do cliente');
    }
  };

  const toggleFeature = async (clientId: string, featureName: string, currentValue: boolean) => {
    try {
      const client = clients.find(c => c.id === clientId);
      if (!client?.settings) return;

      const updatedFeatures = {
        ...client.settings.features,
        [featureName]: !currentValue,
      };

      const { error } = await supabase
        .from('client_settings')
        .update({ features: updatedFeatures })
        .eq('user_id', clientId);

      if (error) throw error;

      toast.success('Funcionalidade atualizada');
      fetchClients();
    } catch (error) {
      console.error('Error updating feature:', error);
      toast.error('Erro ao atualizar funcionalidade');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Clientes</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie clientes, funcionalidades e configurações
          </p>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Nenhum cliente cadastrado
                  </TableCell>
                </TableRow>
              ) : (
                clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.full_name || 'Sem nome'}</TableCell>
                    <TableCell>{client.company_name || 'Sem empresa'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {client.settings?.subscription_plan || 'basic'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={client.is_active}
                        onCheckedChange={() => toggleClientStatus(client.id, client.is_active)}
                      />
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedClient(client)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Gerenciar
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Gerenciar Cliente</DialogTitle>
                            <DialogDescription>
                              Configure funcionalidades e limites para {client.full_name}
                            </DialogDescription>
                          </DialogHeader>
                          {selectedClient && (
                            <div className="space-y-4">
                              <h3 className="font-semibold">Funcionalidades</h3>
                              {Object.entries(selectedClient.settings?.features || {}).map(([key, value]) => (
                                <div key={key} className="flex items-center justify-between">
                                  <Label htmlFor={key} className="capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                  </Label>
                                  <Switch
                                    id={key}
                                    checked={value}
                                    onCheckedChange={() =>
                                      toggleFeature(selectedClient.id, key, value)
                                    }
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </DashboardLayout>
  );
}
