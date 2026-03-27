
-- Create app role enum
CREATE TYPE public.app_role AS ENUM ('SUPER_ADMIN', 'RESTAURANT_OWNER', 'CUSTOMER');

-- Profiles table (linked to auth.users)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'CUSTOMER',
  restaurant_id uuid,
  full_name text,
  email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Restaurants table
CREATE TABLE public.restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_id uuid REFERENCES public.profiles(id),
  logo_url text,
  banner_url text,
  card_bg_color text DEFAULT '#6b3a1f',
  card_accent_color text DEFAULT '#d4722a',
  card_text_color text DEFAULT '#faf5f0',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- FK for restaurant_id on profiles
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_restaurant_id_fkey
  FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id);

-- Loyalty programs
CREATE TABLE public.loyalty_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  program_name text NOT NULL DEFAULT 'Loyalty Program',
  stamps_required integer NOT NULL DEFAULT 7,
  reward_description text NOT NULL DEFAULT 'Free Item',
  expiry_days integer,
  max_stamps_per_visit integer NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Activity logs for super admin
CREATE TABLE public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES public.restaurants(id),
  message text NOT NULL,
  severity text NOT NULL DEFAULT 'info',
  is_resolved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Security definer functions for RLS (avoid recursion)
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS public.app_role
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT role FROM public.profiles WHERE id = _user_id $$;

CREATE OR REPLACE FUNCTION public.get_user_restaurant_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT restaurant_id FROM public.profiles WHERE id = _user_id $$;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Profiles RLS
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (id = auth.uid() OR public.get_user_role(auth.uid()) = 'SUPER_ADMIN');
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid() OR public.get_user_role(auth.uid()) = 'SUPER_ADMIN');
CREATE POLICY "Allow profile creation" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- Restaurants RLS
CREATE POLICY "View restaurants" ON public.restaurants
  FOR SELECT USING (is_active = true OR public.get_user_role(auth.uid()) = 'SUPER_ADMIN' OR owner_id = auth.uid());
CREATE POLICY "Owners update own restaurant" ON public.restaurants
  FOR UPDATE USING (owner_id = auth.uid() OR public.get_user_role(auth.uid()) = 'SUPER_ADMIN');
CREATE POLICY "Super admin creates restaurants" ON public.restaurants
  FOR INSERT WITH CHECK (public.get_user_role(auth.uid()) = 'SUPER_ADMIN');

-- Loyalty programs RLS
CREATE POLICY "View programs" ON public.loyalty_programs
  FOR SELECT USING (true);
CREATE POLICY "Owners manage programs" ON public.loyalty_programs
  FOR INSERT WITH CHECK (
    restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid())
    OR public.get_user_role(auth.uid()) = 'SUPER_ADMIN'
  );
CREATE POLICY "Owners update programs" ON public.loyalty_programs
  FOR UPDATE USING (
    restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid())
    OR public.get_user_role(auth.uid()) = 'SUPER_ADMIN'
  );

-- Activity logs RLS
CREATE POLICY "View own or all logs" ON public.activity_logs
  FOR SELECT USING (
    public.get_user_role(auth.uid()) = 'SUPER_ADMIN'
    OR public.get_user_restaurant_id(auth.uid()) = restaurant_id
  );
CREATE POLICY "Insert logs" ON public.activity_logs
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Super admin resolves logs" ON public.activity_logs
  FOR UPDATE USING (public.get_user_role(auth.uid()) = 'SUPER_ADMIN');

-- Updated at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON public.restaurants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_loyalty_programs_updated_at BEFORE UPDATE ON public.loyalty_programs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
