-- Criar enum para tipos de movimentação
CREATE TYPE movement_type AS ENUM ('entrada', 'saida', 'ajuste');

-- Criar enum para status de produtos
CREATE TYPE product_status AS ENUM ('ativo', 'inativo');

-- Criar tabela de categorias
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Criar tabela de produtos
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT UNIQUE NOT NULL,
  barcode TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  cost_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  current_stock INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER NOT NULL DEFAULT 0,
  max_stock INTEGER,
  status product_status NOT NULL DEFAULT 'ativo',
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Criar tabela de movimentações de estoque
CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  type movement_type NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2),
  total_price DECIMAL(10, 2),
  notes TEXT,
  movement_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Criar tabela de configurações da empresa
CREATE TABLE company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  cnpj TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(user_id)
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para categories
CREATE POLICY "Usuários podem ver suas próprias categorias"
  ON categories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias categorias"
  ON categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias categorias"
  ON categories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias categorias"
  ON categories FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas RLS para products
CREATE POLICY "Usuários podem ver seus próprios produtos"
  ON products FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar seus próprios produtos"
  ON products FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios produtos"
  ON products FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios produtos"
  ON products FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas RLS para stock_movements
CREATE POLICY "Usuários podem ver suas próprias movimentações"
  ON stock_movements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias movimentações"
  ON stock_movements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias movimentações"
  ON stock_movements FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias movimentações"
  ON stock_movements FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas RLS para company_settings
CREATE POLICY "Usuários podem ver suas próprias configurações"
  ON company_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias configurações"
  ON company_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias configurações"
  ON company_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Triggers para atualizar updated_at
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_company_settings_updated_at
  BEFORE UPDATE ON company_settings
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Criar função para atualizar estoque automaticamente
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.type = 'entrada' THEN
    UPDATE products 
    SET current_stock = current_stock + NEW.quantity
    WHERE id = NEW.product_id;
  ELSIF NEW.type = 'saida' THEN
    UPDATE products 
    SET current_stock = current_stock - NEW.quantity
    WHERE id = NEW.product_id;
  ELSIF NEW.type = 'ajuste' THEN
    UPDATE products 
    SET current_stock = NEW.quantity
    WHERE id = NEW.product_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger para atualizar estoque após movimentação
CREATE TRIGGER update_stock_after_movement
  AFTER INSERT ON stock_movements
  FOR EACH ROW
  EXECUTE FUNCTION update_product_stock();

-- Criar índices para melhor performance
CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_stock_movements_product_id ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_user_id ON stock_movements(user_id);
CREATE INDEX idx_categories_user_id ON categories(user_id);