
-- Create enums
CREATE TYPE public.visit_method AS ENUM ('AUTO', 'MANUAL');
CREATE TYPE public.staff_role AS ENUM ('STAFF', 'ADMIN');

-- Customers table
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX idx_customers_code ON public.customers(code);
CREATE INDEX idx_customers_phone ON public.customers(phone);
CREATE INDEX idx_customers_email ON public.customers(email);

-- Passes table (one per customer)
CREATE TABLE public.passes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  serial_number TEXT NOT NULL UNIQUE,
  push_token TEXT,
  stamp_count INT NOT NULL DEFAULT 0,
  is_reward_ready BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  customer_id UUID NOT NULL UNIQUE REFERENCES public.customers(id) ON DELETE CASCADE
);

-- Visits table
CREATE TABLE public.visits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  method public.visit_method NOT NULL DEFAULT 'MANUAL',
  logged_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE
);
CREATE INDEX idx_visits_customer ON public.visits(customer_id);
CREATE INDEX idx_visits_created ON public.visits(created_at);

-- Reward configs table
CREATE TABLE public.reward_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_name TEXT NOT NULL,
  item_image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  active_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  active_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by TEXT
);
CREATE INDEX idx_reward_configs_active ON public.reward_configs(is_active);

-- Rewards table (redeemed rewards)
CREATE TABLE public.rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_name TEXT NOT NULL,
  redeemed_by TEXT NOT NULL,
  redeemed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  reward_config_id UUID NOT NULL REFERENCES public.reward_configs(id)
);
CREATE INDEX idx_rewards_customer ON public.rewards(customer_id);

-- Staff users table
CREATE TABLE public.staff_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role public.staff_role NOT NULL DEFAULT 'STAFF',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Webhook logs table
CREATE TABLE public.webhook_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  processed BOOLEAN NOT NULL DEFAULT false,
  customer_id TEXT,
  error TEXT,
  received_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX idx_webhook_logs_processed ON public.webhook_logs(processed);
CREATE INDEX idx_webhook_logs_received ON public.webhook_logs(received_at);

-- Enable RLS on all tables
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- Public read access for reward_configs (customers need to see active reward)
CREATE POLICY "Anyone can view active reward configs" ON public.reward_configs FOR SELECT USING (true);

-- Public insert for customers (onboarding)
CREATE POLICY "Anyone can create a customer" ON public.customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view customers" ON public.customers FOR SELECT USING (true);
CREATE POLICY "Anyone can update customers" ON public.customers FOR UPDATE USING (true);

-- Passes policies
CREATE POLICY "Anyone can view passes" ON public.passes FOR SELECT USING (true);
CREATE POLICY "Anyone can create passes" ON public.passes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update passes" ON public.passes FOR UPDATE USING (true);

-- Visits policies
CREATE POLICY "Anyone can view visits" ON public.visits FOR SELECT USING (true);
CREATE POLICY "Anyone can create visits" ON public.visits FOR INSERT WITH CHECK (true);

-- Rewards policies
CREATE POLICY "Anyone can view rewards" ON public.rewards FOR SELECT USING (true);
CREATE POLICY "Anyone can create rewards" ON public.rewards FOR INSERT WITH CHECK (true);

-- Reward configs write
CREATE POLICY "Anyone can create reward configs" ON public.reward_configs FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update reward configs" ON public.reward_configs FOR UPDATE USING (true);

-- Staff users policies
CREATE POLICY "Anyone can view staff" ON public.staff_users FOR SELECT USING (true);
CREATE POLICY "Anyone can create staff" ON public.staff_users FOR INSERT WITH CHECK (true);

-- Webhook logs
CREATE POLICY "Anyone can view webhook logs" ON public.webhook_logs FOR SELECT USING (true);
CREATE POLICY "Anyone can create webhook logs" ON public.webhook_logs FOR INSERT WITH CHECK (true);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_passes_updated_at BEFORE UPDATE ON public.passes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reward_configs_updated_at BEFORE UPDATE ON public.reward_configs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_staff_users_updated_at BEFORE UPDATE ON public.staff_users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate unique 5-digit code
CREATE OR REPLACE FUNCTION public.generate_customer_code()
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    new_code := LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0');
    SELECT EXISTS(SELECT 1 FROM public.customers WHERE code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  RETURN new_code;
END;
$$ LANGUAGE plpgsql SET search_path = public;
