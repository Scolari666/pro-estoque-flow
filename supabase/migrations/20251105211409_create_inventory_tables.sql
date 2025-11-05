/*
  # Sistema de Controle de Estoque - Tabelas Principais

  ## Tabelas Criadas
  
  ### 1. categories (Categorias de Produtos)
    - id (uuid, PK)
    - user_id (uuid, FK para auth.users)
    - name (text) - Nome da categoria
    - description (text) - Descrição opcional
    - created_at (timestamptz)
    - updated_at (timestamptz)

  ### 2. suppliers (Fornecedores)
    - id (uuid, PK)
    - user_id (uuid, FK)
    - name (text) - Nome do fornecedor
    - cnpj (text) - CNPJ do fornecedor
    - phone (text) - Telefone
    - email (text) - Email
    - address (text) - Endereço
    - created_at (timestamptz)
    - updated_at (timestamptz)

  ### 3. products (Produtos)
    - id (uuid, PK)
    - user_id (uuid, FK)
    - sku (text, unique) - Código SKU
    - name (text) - Nome do produto
    - description (text) - Descrição
    - category_id (uuid, FK) - Categoria
    - supplier_id (uuid, FK) - Fornecedor
    - cost_price (decimal) - Preço de custo
    - sale_price (decimal) - Preço de venda
    - current_stock (integer) - Estoque atual
    - minimum_stock (integer) - Estoque mínimo
    - image_url (text) - URL da imagem
    - active (boolean) - Produto ativo
    - created_at (timestamptz)
    - updated_at (timestamptz)

  ### 4. stock_movements (Movimentações de Estoque)
    - id (uuid, PK)
    - user_id (uuid, FK)
    - product_id (uuid, FK)
    - type (text) - Tipo: 'entrada' ou 'saida'
    - quantity (integer) - Quantidade movimentada
    - reason (text) - Motivo: 'compra', 'venda', 'ajuste', 'devolucao', 'avaria'
    - notes (text) - Observações
    - reference_number (text) - Número de nota fiscal, pedido, etc
    - created_at (timestamptz)

  ### 5. stock_alerts (Alertas de Estoque)
    - id (uuid, PK)
    - user_id (uuid, FK)
    - product_id (uuid, FK)
    - alert_type (text) - Tipo: 'low_stock', 'expiry_date', 'inactive'
    - message (text) - Mensagem do alerta
    - is_read (boolean) - Alerta lido
    - created_at (timestamptz)

  ## Segurança
    - RLS habilitado em todas as tabelas
    - Políticas de acesso por usuário autenticado
    - Usuários só acessam seus próprios dados
*/

-- Tabela de Categorias
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own categories"
  ON categories FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories"
  ON categories FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Tabela de Fornecedores
CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  cnpj text,
  phone text,
  email text,
  address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own suppliers"
  ON suppliers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own suppliers"
  ON suppliers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own suppliers"
  ON suppliers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own suppliers"
  ON suppliers FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Tabela de Produtos
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  sku text NOT NULL,
  name text NOT NULL,
  description text,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  supplier_id uuid REFERENCES suppliers(id) ON DELETE SET NULL,
  cost_price decimal(10,2) DEFAULT 0,
  sale_price decimal(10,2) DEFAULT 0,
  current_stock integer DEFAULT 0,
  minimum_stock integer DEFAULT 0,
  image_url text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, sku)
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own products"
  ON products FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products"
  ON products FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own products"
  ON products FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Tabela de Movimentações
CREATE TABLE IF NOT EXISTS stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('entrada', 'saida')),
  quantity integer NOT NULL,
  reason text NOT NULL CHECK (reason IN ('compra', 'venda', 'ajuste', 'devolucao', 'avaria', 'transferencia')),
  notes text,
  reference_number text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own movements"
  ON stock_movements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own movements"
  ON stock_movements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own movements"
  ON stock_movements FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Tabela de Alertas
CREATE TABLE IF NOT EXISTS stock_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  alert_type text NOT NULL CHECK (alert_type IN ('low_stock', 'expiry_date', 'inactive')),
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE stock_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own alerts"
  ON stock_alerts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts"
  ON stock_alerts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own alerts"
  ON stock_alerts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_supplier_id ON products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_user_id ON stock_movements(user_id);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_user_id ON stock_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_product_id ON stock_alerts(product_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_suppliers_updated_at ON suppliers;
CREATE TRIGGER update_suppliers_updated_at
  BEFORE UPDATE ON suppliers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();