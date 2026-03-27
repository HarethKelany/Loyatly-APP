
-- Seed BakeBar as pilot tenant restaurant
INSERT INTO public.restaurants (id, name, card_bg_color, card_accent_color, card_text_color)
VALUES ('00000000-0000-0000-0000-000000626162', 'BAKEBAR', '#6b3a1f', '#d4722a', '#faf5f0')
ON CONFLICT (id) DO NOTHING;

-- Seed BakeBar loyalty program
INSERT INTO public.loyalty_programs (restaurant_id, program_name, stamps_required, reward_description)
VALUES ('00000000-0000-0000-0000-000000626162', 'BakeBar Loyalty', 7, 'Free Item')
ON CONFLICT DO NOTHING;

-- Function to auto-assign SUPER_ADMIN role to the platform admin on first login
CREATE OR REPLACE FUNCTION public.ensure_admin_profile()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Find the admin user by email
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'harethkelany7@outlook.com' LIMIT 1;
  
  IF admin_user_id IS NOT NULL THEN
    -- Upsert profile with SUPER_ADMIN role
    INSERT INTO public.profiles (id, email, role, restaurant_id)
    VALUES (admin_user_id, 'harethkelany7@outlook.com', 'SUPER_ADMIN', null)
    ON CONFLICT (id) DO UPDATE SET role = 'SUPER_ADMIN';
  END IF;
END;
$$;

-- Run it now
SELECT public.ensure_admin_profile();
