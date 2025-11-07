-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'client');

-- Create enum for subscription plans
CREATE TYPE public.subscription_plan AS ENUM ('basic', 'pro', 'enterprise');

-- Create user_roles table (CRITICAL: separate table for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create invitations table
CREATE TABLE public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type app_role NOT NULL,
  max_uses INTEGER NOT NULL DEFAULT 1,
  used_count INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on invitations
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Create client_settings table
CREATE TABLE public.client_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  features JSONB NOT NULL DEFAULT '{
    "inventoryManagement": true,
    "productCategories": true,
    "supplierManagement": false,
    "reports": true,
    "multiWarehouse": false,
    "barcodeSupport": true,
    "apiAccess": false,
    "emailAlerts": true
  }'::jsonb,
  limits JSONB NOT NULL DEFAULT '{
    "maxProducts": 1000,
    "maxUsers": 5,
    "maxWarehouses": 1
  }'::jsonb,
  subscription_plan subscription_plan NOT NULL DEFAULT 'basic',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on client_settings
ALTER TABLE public.client_settings ENABLE ROW LEVEL SECURITY;

-- Update profiles table to add more fields
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS invited_by UUID REFERENCES auth.users(id);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS invitation_code TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for invitations
CREATE POLICY "Anyone can view active valid invitations by code"
  ON public.invitations FOR SELECT
  USING (is_active = true AND expires_at > now() AND used_count < max_uses);

CREATE POLICY "Admins can view all invitations"
  ON public.invitations FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create invitations"
  ON public.invitations FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update invitations"
  ON public.invitations FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete invitations"
  ON public.invitations FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for client_settings
CREATE POLICY "Users can view their own settings"
  ON public.client_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all client settings"
  ON public.client_settings FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update client settings"
  ON public.client_settings FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can create client settings"
  ON public.client_settings FOR INSERT
  WITH CHECK (true);

-- Function to create default client settings
CREATE OR REPLACE FUNCTION public.create_client_settings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only create settings for clients (users without admin role)
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = NEW.id AND role = 'admin'
  ) THEN
    INSERT INTO public.client_settings (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger to create client settings after profile creation
CREATE TRIGGER create_client_settings_trigger
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_client_settings();

-- Trigger for updated_at on invitations
CREATE TRIGGER update_invitations_updated_at
  BEFORE UPDATE ON public.invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger for updated_at on client_settings
CREATE TRIGGER update_client_settings_updated_at
  BEFORE UPDATE ON public.client_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function to increment invitation usage
CREATE OR REPLACE FUNCTION public.use_invitation_code(_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invitation_record RECORD;
BEGIN
  -- Get and lock the invitation
  SELECT * INTO invitation_record
  FROM public.invitations
  WHERE code = _code
    AND is_active = true
    AND expires_at > now()
    AND used_count < max_uses
  FOR UPDATE;

  -- Check if invitation exists and is valid
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Código de convite inválido ou expirado'
    );
  END IF;

  -- Increment usage count
  UPDATE public.invitations
  SET used_count = used_count + 1,
      updated_at = now()
  WHERE id = invitation_record.id;

  -- Return success with role info
  RETURN jsonb_build_object(
    'success', true,
    'role', invitation_record.user_type,
    'created_by', invitation_record.created_by
  );
END;
$$;

-- Create index for performance
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_invitations_code ON public.invitations(code);
CREATE INDEX idx_invitations_created_by ON public.invitations(created_by);
CREATE INDEX idx_client_settings_user_id ON public.client_settings(user_id);