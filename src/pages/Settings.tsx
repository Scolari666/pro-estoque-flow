import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Building2 } from "lucide-react";

interface CompanySettings {
  company_name: string;
  cnpj: string;
  address: string;
  phone: string;
  email: string;
}

const Settings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<CompanySettings>({
    company_name: "",
    cnpj: "",
    address: "",
    phone: "",
    email: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("company_settings")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error(error);
    } else if (data) {
      setSettings({
        company_name: data.company_name || "",
        cnpj: data.cnpj || "",
        address: data.address || "",
        phone: data.phone || "",
        email: data.email || "",
      });
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);

    const { data: existingSettings } = await supabase
      .from("company_settings")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    let error;

    if (existingSettings) {
      const result = await supabase
        .from("company_settings")
        .update(settings)
        .eq("user_id", user.id);
      error = result.error;
    } else {
      const result = await supabase.from("company_settings").insert([
        {
          ...settings,
          user_id: user.id,
        },
      ]);
      error = result.error;
    }

    if (error) {
      toast.error("Erro ao salvar configurações");
      console.error(error);
    } else {
      toast.success("Configurações salvas com sucesso!");
    }

    setSaving(false);
  };

  const handleChange = (field: keyof CompanySettings, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold">Configurações</h2>
          <p className="text-muted-foreground">Personalize as informações da sua empresa</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Dados da Empresa
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Carregando...</p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="company_name">Nome da Empresa</Label>
                  <Input
                    id="company_name"
                    value={settings.company_name}
                    onChange={(e) => handleChange("company_name", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    value={settings.cnpj}
                    onChange={(e) => handleChange("cnpj", e.target.value)}
                    placeholder="00.000.000/0000-00"
                  />
                </div>

                <div>
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    value={settings.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={settings.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="(00) 0000-0000"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={settings.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                    />
                  </div>
                </div>

                <Button type="submit" disabled={saving} className="w-full">
                  {saving ? "Salvando..." : "Salvar Configurações"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
