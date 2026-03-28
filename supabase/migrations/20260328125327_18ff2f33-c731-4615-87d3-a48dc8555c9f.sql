
-- Add reward type enum
CREATE TYPE public.reward_type AS ENUM ('free_item', 'percentage_discount', 'fixed_discount', 'custom');

-- Add visit reset policy enum
CREATE TYPE public.visit_reset_policy AS ENUM ('never', 'after_redemption', 'after_inactivity');

-- Add reset policy columns to loyalty_programs
ALTER TABLE public.loyalty_programs
  ADD COLUMN visit_reset_policy visit_reset_policy NOT NULL DEFAULT 'never',
  ADD COLUMN inactivity_days integer NULL;

-- Create reward_tiers table
CREATE TABLE public.reward_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loyalty_program_id uuid NOT NULL REFERENCES public.loyalty_programs(id) ON DELETE CASCADE,
  visits_required integer NOT NULL DEFAULT 5,
  reward_type reward_type NOT NULL DEFAULT 'free_item',
  reward_name text NOT NULL DEFAULT 'Free Item',
  reward_value numeric NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reward_tiers ENABLE ROW LEVEL SECURITY;

-- RLS: anyone can view tiers (needed for customer-facing)
CREATE POLICY "View reward tiers" ON public.reward_tiers
  FOR SELECT USING (true);

-- RLS: owners and super admins can insert
CREATE POLICY "Owners insert tiers" ON public.reward_tiers
  FOR INSERT WITH CHECK (
    (loyalty_program_id IN (
      SELECT lp.id FROM public.loyalty_programs lp
      JOIN public.restaurants r ON r.id = lp.restaurant_id
      WHERE r.owner_id = auth.uid()
    ))
    OR (get_user_role(auth.uid()) = 'SUPER_ADMIN'::app_role)
  );

-- RLS: owners and super admins can update
CREATE POLICY "Owners update tiers" ON public.reward_tiers
  FOR UPDATE USING (
    (loyalty_program_id IN (
      SELECT lp.id FROM public.loyalty_programs lp
      JOIN public.restaurants r ON r.id = lp.restaurant_id
      WHERE r.owner_id = auth.uid()
    ))
    OR (get_user_role(auth.uid()) = 'SUPER_ADMIN'::app_role)
  );

-- RLS: owners and super admins can delete
CREATE POLICY "Owners delete tiers" ON public.reward_tiers
  FOR DELETE USING (
    (loyalty_program_id IN (
      SELECT lp.id FROM public.loyalty_programs lp
      JOIN public.restaurants r ON r.id = lp.restaurant_id
      WHERE r.owner_id = auth.uid()
    ))
    OR (get_user_role(auth.uid()) = 'SUPER_ADMIN'::app_role)
  );
