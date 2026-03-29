import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LogOut,
  Gift,
  Coffee,
  ChevronDown,
  ChevronUp,
  Star,
  Clock,
  LayoutList,
  CreditCard,
  Store,
} from "lucide-react";

interface VisitRow {
  id: string;
  stamps_earned: number;
  visited_at: string;
}

interface RewardRow {
  id: string;
  reward_description: string;
  redeemed_at: string;
}

interface LoyaltyCard {
  id: string;
  stamp_count: number;
  is_reward_ready: boolean;
  created_at: string;
  program: {
    id: string;
    program_name: string;
    stamps_required: number;
    reward_description: string;
  };
  restaurant: {
    id: string;
    name: string;
    logo_url: string | null;
    card_bg_color: string | null;
    card_accent_color: string | null;
    card_text_color: string | null;
  };
  visits: VisitRow[];
  rewards: RewardRow[];
}

type ActivityItem =
  | {
      type: "visit";
      date: string;
      stamps_earned: number;
      restaurant_name: string;
      restaurant_logo: string | null;
      accent: string;
      text_color: string;
    }
  | {
      type: "reward";
      date: string;
      reward_description: string;
      restaurant_name: string;
      restaurant_logo: string | null;
      accent: string;
      text_color: string;
    };

// ─── Stamp dots ───────────────────────────────────────────────────────────────

const StampDots = ({
  count,
  required,
  accentColor,
  textColor,
}: {
  count: number;
  required: number;
  accentColor: string;
  textColor: string;
}) => {
  const dots = Array.from({ length: required });
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {dots.map((_, i) => {
        const filled = i < count;
        const isLast = i === required - 1;
        return (
          <div
            key={i}
            className="w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all"
            style={{
              backgroundColor: filled ? accentColor : "transparent",
              borderColor: accentColor,
              opacity: filled ? 1 : 0.4,
            }}
          >
            {isLast ? (
              <Gift className="w-4 h-4" style={{ color: filled ? textColor : accentColor }} />
            ) : (
              filled && <Coffee className="w-3.5 h-3.5" style={{ color: textColor }} />
            )}
          </div>
        );
      })}
    </div>
  );
};

// ─── Restaurant avatar ────────────────────────────────────────────────────────

const RestaurantAvatar = ({
  name,
  logoUrl,
  accent,
  textColor,
  size = "sm",
}: {
  name: string;
  logoUrl: string | null;
  accent: string;
  textColor: string;
  size?: "sm" | "md";
}) => {
  const dim = size === "md" ? "w-10 h-10" : "w-8 h-8";
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={name}
        className={`${dim} rounded-lg object-cover flex-shrink-0`}
      />
    );
  }
  return (
    <div
      className={`${dim} rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0`}
      style={{ backgroundColor: accent, color: textColor }}
    >
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
};

// ─── Single loyalty card ───────────────────────────────────────────────────────

const LoyaltyCardView = ({ card }: { card: LoyaltyCard }) => {
  const [expanded, setExpanded] = useState(false);

  const bg = card.restaurant.card_bg_color || "#1a1a2e";
  const accent = card.restaurant.card_accent_color || "#e94560";
  const text = card.restaurant.card_text_color || "#ffffff";

  const stampsLeft = card.program.stamps_required - card.stamp_count;

  const sortedVisits = [...card.visits].sort(
    (a, b) => new Date(b.visited_at).getTime() - new Date(a.visited_at).getTime()
  );
  const sortedRewards = [...card.rewards].sort(
    (a, b) => new Date(b.redeemed_at).getTime() - new Date(a.redeemed_at).getTime()
  );

  return (
    <div className="rounded-2xl overflow-hidden shadow-lg border">
      {/* Card face */}
      <div className="p-5 relative" style={{ backgroundColor: bg, color: text }}>
        {card.is_reward_ready && (
          <div
            className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
            style={{ backgroundColor: accent, color: text }}
          >
            <Star className="w-3 h-3" />
            Reward Ready!
          </div>
        )}

        {/* Restaurant identity */}
        <div className="flex items-center gap-3 mb-1">
          <RestaurantAvatar
            name={card.restaurant.name}
            logoUrl={card.restaurant.logo_url}
            accent={accent}
            textColor={text}
            size="md"
          />
          <div>
            <p className="font-bold text-base leading-tight">{card.restaurant.name}</p>
            <p className="text-xs opacity-70">{card.program.program_name}</p>
          </div>
        </div>

        {/* Stamps */}
        <StampDots
          count={card.stamp_count}
          required={card.program.stamps_required}
          accentColor={accent}
          textColor={text}
        />

        {/* Progress text */}
        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs opacity-80">
            {card.is_reward_ready
              ? `Collect your free: ${card.program.reward_description}`
              : `${stampsLeft} more visit${stampsLeft !== 1 ? "s" : ""} for a free ${card.program.reward_description}`}
          </p>
          <span className="text-xs font-mono opacity-60">
            {card.stamp_count}/{card.program.stamps_required}
          </span>
        </div>
      </div>

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors border-t"
      >
        <span>
          {card.visits.length} visit{card.visits.length !== 1 ? "s" : ""} &middot;{" "}
          {card.rewards.length} reward{card.rewards.length !== 1 ? "s" : ""} redeemed
        </span>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {/* Expanded history */}
      {expanded && (
        <div className="border-t divide-y bg-card">
          {sortedVisits.length > 0 && (
            <div className="p-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Visit History
              </p>
              {sortedVisits.map((visit) => (
                <div key={visit.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-foreground">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    {new Date(visit.visited_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    +{visit.stamps_earned} stamp{visit.stamps_earned !== 1 ? "s" : ""}
                  </Badge>
                </div>
              ))}
            </div>
          )}

          {sortedRewards.length > 0 && (
            <div className="p-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Redeemed Rewards
              </p>
              {sortedRewards.map((reward) => (
                <div key={reward.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-foreground">
                    <Gift className="w-3.5 h-3.5 text-amber-500" />
                    {reward.reward_description}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(reward.redeemed_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}

          {card.visits.length === 0 && card.rewards.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">No activity yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Unified activity feed ─────────────────────────────────────────────────────

const ActivityFeed = ({ cards }: { cards: LoyaltyCard[] }) => {
  const items: ActivityItem[] = [];

  for (const card of cards) {
    const accent = card.restaurant.card_accent_color || "#e94560";
    const textColor = card.restaurant.card_text_color || "#ffffff";

    for (const visit of card.visits) {
      items.push({
        type: "visit",
        date: visit.visited_at,
        stamps_earned: visit.stamps_earned,
        restaurant_name: card.restaurant.name,
        restaurant_logo: card.restaurant.logo_url,
        accent,
        text_color: textColor,
      });
    }

    for (const reward of card.rewards) {
      items.push({
        type: "reward",
        date: reward.redeemed_at,
        reward_description: reward.reward_description,
        restaurant_name: card.restaurant.name,
        restaurant_logo: card.restaurant.logo_url,
        accent,
        text_color: textColor,
      });
    }
  }

  items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (items.length === 0) {
    return (
      <div className="py-16 text-center space-y-3">
        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto">
          <LayoutList className="w-7 h-7 text-muted-foreground" />
        </div>
        <p className="font-medium text-foreground">No activity yet</p>
        <p className="text-sm text-muted-foreground">
          Your visits and redeemed rewards will appear here.
        </p>
      </div>
    );
  }

  // Group by date label
  const grouped: { label: string; items: ActivityItem[] }[] = [];
  for (const item of items) {
    const d = new Date(item.date);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    let label: string;
    if (d.toDateString() === today.toDateString()) {
      label = "Today";
    } else if (d.toDateString() === yesterday.toDateString()) {
      label = "Yesterday";
    } else {
      label = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    }

    const last = grouped[grouped.length - 1];
    if (last && last.label === label) {
      last.items.push(item);
    } else {
      grouped.push({ label, items: [item] });
    }
  }

  return (
    <div className="space-y-6">
      {grouped.map((group) => (
        <div key={group.label}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            {group.label}
          </p>
          <div className="space-y-2">
            {group.items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 bg-card border rounded-xl px-4 py-3"
              >
                <RestaurantAvatar
                  name={item.restaurant_name}
                  logoUrl={item.restaurant_logo}
                  accent={item.accent}
                  textColor={item.text_color}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {item.restaurant_name}
                  </p>
                  {item.type === "visit" ? (
                    <p className="text-xs text-muted-foreground">
                      Visited &middot; +{item.stamps_earned} stamp
                      {item.stamps_earned !== 1 ? "s" : ""}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Reward redeemed &middot; {item.reward_description}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  {item.type === "visit" ? (
                    <Badge variant="secondary" className="text-xs">
                      <Coffee className="w-3 h-3 mr-1" />
                      Visit
                    </Badge>
                  ) : (
                    <Badge className="text-xs bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200">
                      <Gift className="w-3 h-3 mr-1" />
                      Reward
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {new Date(item.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Explore restaurants ──────────────────────────────────────────────────────

interface RestaurantListing {
  id: string;
  name: string;
  logo_url: string | null;
  card_bg_color: string | null;
  card_accent_color: string | null;
  card_text_color: string | null;
  loyalty_programs: {
    program_name: string;
    stamps_required: number;
    reward_description: string;
  }[];
}

const ExploreTab = ({ myCardRestaurantIds }: { myCardRestaurantIds: string[] }) => {
  const { data: restaurants, isLoading } = useQuery({
    queryKey: ["explore-restaurants"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("restaurants")
        .select(`
          id,
          name,
          logo_url,
          card_bg_color,
          card_accent_color,
          card_text_color,
          loyalty_programs (
            program_name,
            stamps_required,
            reward_description
          )
        `)
        .eq("is_active", true)
        .order("name", { ascending: true });
      if (error) throw error;
      return data as unknown as RestaurantListing[];
    },
  });

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Loading restaurants...</p>
      </div>
    );
  }

  if (!restaurants?.length) {
    return (
      <div className="py-16 text-center space-y-3">
        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto">
          <Store className="w-7 h-7 text-muted-foreground" />
        </div>
        <p className="font-medium text-foreground">No restaurants yet</p>
        <p className="text-sm text-muted-foreground">Check back soon.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {restaurants.map((r) => {
        const bg = r.card_bg_color || "#1a1a2e";
        const accent = r.card_accent_color || "#e94560";
        const text = r.card_text_color || "#ffffff";
        const program = r.loyalty_programs?.[0];
        const alreadyJoined = myCardRestaurantIds.includes(r.id);

        return (
          <div key={r.id} className="rounded-2xl overflow-hidden border shadow-sm">
            {/* Coloured header strip */}
            <div className="px-5 py-4 flex items-center gap-3" style={{ backgroundColor: bg, color: text }}>
              {r.logo_url ? (
                <img src={r.logo_url} alt={r.name} className="w-11 h-11 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div
                  className="w-11 h-11 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0"
                  style={{ backgroundColor: accent, color: text }}
                >
                  {r.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-base leading-tight">{r.name}</p>
                {program && (
                  <p className="text-xs opacity-70">{program.program_name}</p>
                )}
              </div>
              {alreadyJoined && (
                <span
                  className="text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0"
                  style={{ backgroundColor: accent, color: text }}
                >
                  Joined
                </span>
              )}
            </div>

            {/* Program details */}
            {program && (
              <div className="px-5 py-3 bg-card flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Gift className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <span>Free {program.reward_description}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-shrink-0">
                  <Coffee className="w-3.5 h-3.5" />
                  {program.stamps_required} stamps
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ─── Main page ─────────────────────────────────────────────────────────────────

const CustomerDashboard = () => {
  const { profile, signOut } = useAuth();

  const { data: cards, isLoading } = useQuery({
    queryKey: ["customer-cards", profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customer_cards")
        .select(`
          id,
          stamp_count,
          is_reward_ready,
          created_at,
          program:loyalty_programs (
            id,
            program_name,
            stamps_required,
            reward_description
          ),
          restaurant:restaurants (
            id,
            name,
            logo_url,
            card_bg_color,
            card_accent_color,
            card_text_color
          ),
          visits:customer_visits (
            id,
            stamps_earned,
            visited_at
          ),
          rewards:customer_rewards (
            id,
            reward_description,
            redeemed_at
          )
        `)
        .eq("customer_id", profile!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as unknown as LoyaltyCard[];
    },
  });

  const totalStamps = cards?.reduce((sum, c) => sum + c.stamp_count, 0) ?? 0;
  const totalVisits = cards?.reduce((sum, c) => sum + c.visits.length, 0) ?? 0;
  const totalRewards = cards?.reduce((sum, c) => sum + c.rewards.length, 0) ?? 0;
  const readyCards = cards?.filter((c) => c.is_reward_ready).length ?? 0;

  const displayName = profile?.full_name || profile?.email || "there";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              Hey, {displayName.split(" ")[0]} 👋
            </h1>
            <p className="text-xs text-muted-foreground">Your loyalty cards</p>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-1" />
            Sign Out
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        {/* Stats */}
        {(cards?.length ?? 0) > 0 && (
          <div className="grid grid-cols-4 gap-3">
            <div className="rounded-xl bg-card border p-3 text-center">
              <p className="text-2xl font-bold text-foreground">{cards!.length}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Card{cards!.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="rounded-xl bg-card border p-3 text-center">
              <p className="text-2xl font-bold text-foreground">{totalVisits}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Visits</p>
            </div>
            <div className="rounded-xl bg-card border p-3 text-center">
              <p className="text-2xl font-bold text-foreground">{totalStamps}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Stamps</p>
            </div>
            <div className="rounded-xl bg-card border p-3 text-center">
              <p className="text-2xl font-bold text-amber-500">{totalRewards}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Rewards</p>
            </div>
          </div>
        )}

        {/* Reward ready banner */}
        {readyCards > 0 && (
          <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center flex-shrink-0">
              <Gift className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="font-medium text-amber-900 dark:text-amber-200 text-sm">
                You have {readyCards} reward{readyCards !== 1 ? "s" : ""} ready to claim!
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Show this to the staff at the restaurant.
              </p>
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Loading your cards...</p>
          </div>
        ) : cards?.length === 0 ? (
          <Tabs defaultValue="explore">
            <TabsList className="w-full">
              <TabsTrigger value="cards" className="flex-1 gap-1.5">
                <CreditCard className="w-4 h-4" />
                My Cards
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex-1 gap-1.5">
                <LayoutList className="w-4 h-4" />
                Activity
              </TabsTrigger>
              <TabsTrigger value="explore" className="flex-1 gap-1.5">
                <Store className="w-4 h-4" />
                Explore
              </TabsTrigger>
            </TabsList>
            <TabsContent value="cards" className="mt-4">
              <div className="py-16 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto">
                  <Coffee className="w-7 h-7 text-muted-foreground" />
                </div>
                <p className="font-medium text-foreground">No loyalty cards yet</p>
                <p className="text-sm text-muted-foreground">
                  Visit a participating restaurant and ask staff to add you.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="activity" className="mt-4">
              <div className="py-16 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto">
                  <LayoutList className="w-7 h-7 text-muted-foreground" />
                </div>
                <p className="font-medium text-foreground">No activity yet</p>
                <p className="text-sm text-muted-foreground">Your visits and rewards will appear here.</p>
              </div>
            </TabsContent>
            <TabsContent value="explore" className="mt-4">
              <ExploreTab myCardRestaurantIds={[]} />
            </TabsContent>
          </Tabs>
        ) : (
          <Tabs defaultValue="cards">
            <TabsList className="w-full">
              <TabsTrigger value="cards" className="flex-1 gap-1.5">
                <CreditCard className="w-4 h-4" />
                My Cards
                <Badge variant="secondary" className="ml-1 text-xs px-1.5">
                  {cards!.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex-1 gap-1.5">
                <LayoutList className="w-4 h-4" />
                Activity
                <Badge variant="secondary" className="ml-1 text-xs px-1.5">
                  {totalVisits + totalRewards}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="explore" className="flex-1 gap-1.5">
                <Store className="w-4 h-4" />
                Explore
              </TabsTrigger>
            </TabsList>

            <TabsContent value="cards" className="mt-4 space-y-4">
              {cards!.map((card) => (
                <LoyaltyCardView key={card.id} card={card} />
              ))}
            </TabsContent>

            <TabsContent value="activity" className="mt-4">
              <ActivityFeed cards={cards!} />
            </TabsContent>

            <TabsContent value="explore" className="mt-4">
              <ExploreTab myCardRestaurantIds={cards!.map((c) => c.restaurant.id)} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
