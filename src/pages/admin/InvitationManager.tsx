import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Copy, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Invitation {
  id: string;
  code: string;
  user_type: 'admin' | 'client';
  max_uses: number;
  used_count: number;
  expires_at: string;
  is_active: boolean;
  created_at: string;
}

export default function InvitationManager() {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<'admin' | 'client'>('admin');
  const [maxUses, setMaxUses] = useState(1);
  const [expiryDays, setExpiryDays] = useState(7);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvitations(data || []);
    } catch (error) {
      console.error('Error fetching invitations:', error);
      toast.error('Erro ao carregar convites');
    } finally {
      setLoading(false);
    }
  };

  const generateCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const createInvitation = async () => {
    if (!user) return;

    try {
      const code = generateCode();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiryDays);

      const { error } = await supabase
        .from('invitations')
        .insert({
          code,
          created_by: user.id,
          user_type: userType,
          max_uses: maxUses,
          expires_at: expiresAt.toISOString(),
        });

      if (error) throw error;

      toast.success('Convite criado com sucesso!');
      fetchInvitations();
    } catch (error) {
      console.error('Error creating invitation:', error);
      toast.error('Erro ao criar convite');
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Código copiado!');
  };

  const deleteInvitation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('invitations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Convite excluído');
      fetchInvitations();
    } catch (error) {
      console.error('Error deleting invitation:', error);
      toast.error('Erro ao excluir convite');
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
          <h1 className="text-3xl font-bold">Gerenciar Convites</h1>
          <p className="text-muted-foreground mt-2">
            Crie e gerencie códigos de convite para novos administradores
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Criar Novo Convite</CardTitle>
            <CardDescription>
              Gere um código de convite para novos usuários admin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Usuário</Label>
                <Select value={userType} onValueChange={(v) => setUserType(v as 'admin' | 'client')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="client">Cliente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Máximo de Usos</Label>
                <Input
                  type="number"
                  min={1}
                  value={maxUses}
                  onChange={(e) => setMaxUses(parseInt(e.target.value) || 1)}
                />
              </div>

              <div className="space-y-2">
                <Label>Expira em (dias)</Label>
                <Input
                  type="number"
                  min={1}
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(parseInt(e.target.value) || 7)}
                />
              </div>
            </div>

            <Button onClick={createInvitation}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Convite
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Convites Existentes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Usos</TableHead>
                  <TableHead>Expira em</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Nenhum convite criado
                    </TableCell>
                  </TableRow>
                ) : (
                  invitations.map((invitation) => {
                    const isExpired = new Date(invitation.expires_at) < new Date();
                    const isExhausted = invitation.used_count >= invitation.max_uses;

                    return (
                      <TableRow key={invitation.id}>
                        <TableCell className="font-mono font-semibold">
                          {invitation.code}
                        </TableCell>
                        <TableCell>
                          <Badge variant={invitation.user_type === 'admin' ? 'default' : 'secondary'}>
                            {invitation.user_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {invitation.used_count} / {invitation.max_uses}
                        </TableCell>
                        <TableCell>
                          {new Date(invitation.expires_at).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          {isExpired || isExhausted ? (
                            <Badge variant="destructive">Inválido</Badge>
                          ) : (
                            <Badge variant="outline">Ativo</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyCode(invitation.code)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteInvitation(invitation.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
