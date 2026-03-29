-- customer_cards: one card per customer per loyalty program
CREATE TABLE customer_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES loyalty_programs(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  stamp_count INTEGER DEFAULT 0 NOT NULL,
  is_reward_ready BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(customer_id, program_id)
);

-- customer_visits: each stamped visit event
CREATE TABLE customer_visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id UUID NOT NULL REFERENCES customer_cards(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  stamps_earned INTEGER DEFAULT 1 NOT NULL,
  visited_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- customer_rewards: redeemed rewards per card
CREATE TABLE customer_rewards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id UUID NOT NULL REFERENCES customer_cards(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  reward_description TEXT NOT NULL,
  redeemed_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Auto-update updated_at on customer_cards
CREATE TRIGGER update_customer_cards_updated_at
  BEFORE UPDATE ON customer_cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE customer_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_rewards ENABLE ROW LEVEL SECURITY;

-- Customers see their own cards/visits/rewards
CREATE POLICY "customers_select_own_cards" ON customer_cards
  FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "customers_select_own_visits" ON customer_visits
  FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "customers_select_own_rewards" ON customer_rewards
  FOR SELECT USING (customer_id = auth.uid());

-- Restaurant owners and super admins can view + manage cards for their restaurant
CREATE POLICY "owners_all_restaurant_cards" ON customer_cards
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND (role = 'SUPER_ADMIN' OR restaurant_id = customer_cards.restaurant_id)
    )
  );

CREATE POLICY "owners_all_restaurant_visits" ON customer_visits
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND (role = 'SUPER_ADMIN' OR restaurant_id = customer_visits.restaurant_id)
    )
  );

CREATE POLICY "owners_all_restaurant_rewards" ON customer_rewards
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND (role = 'SUPER_ADMIN' OR restaurant_id = customer_rewards.restaurant_id)
    )
  );
