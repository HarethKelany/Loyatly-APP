import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, Gift, Coffee, ChevronDown, ChevronUp, Star, Clock } from "lucide-react";

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

const LoyaltyCardView = ({ card }: { card: LoyaltyCard }) => {
  const [expanded, setExpanded] = useState(false);

  const bg = card.restaurant.card_bg_color || "#1a1a2e";
  const accent = card.restaurant.card_accent_color || "#e94560";
  const text = card.restaurant.card_text_color || "#ffffff";

  const stampsLeft = card.program.stamps_required - card.stamp_count;

  return (
    <div className="rounded-2xl overflow-hidden shadow-lg">
      {/* Card face */}
      <div
        className="p-5 relative"
        style={{ backgroundColor: bg, color: text }}
      >
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
          {card.restaurant.logo_url ? (
            <img
              src={card.restaurant.logo_url}
              alt={card.restaurant.name}
              className="w-10 h-10 rounded-lg object-cover"
            />
          ) : (
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm"
              style={{ backgroundColor: accent, color: text }}
            >
              {card.restaurant.name.slice(0, 2).toUpperCase()}
            </div>
          )}
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
          {/* Visits */}
          {card.visits.length > 0 && (
            <div className="p-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Visit History
              </p>
              {card.visits.map((visit) => (
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

          {/* Rewards */}
          {card.rewards.length > 0 && (
            <div className="p-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Redeemed Rewards
              </p>
              {card.rewards.map((reward) => (
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
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-card border p-3 text-center">
              <p className="text-2xl font-bold text-foreground">{cards!.length}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Card{cards!.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="rounded-xl bg-card border p-3 text-center">
              <p className="text-2xl font-bold text-foreground">{totalStamps}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Total Stamps</p>
            </div>
            <div className="rounded-xl bg-card border p-3 text-center">
              <p className="text-2xl font-bold text-amber-500">{totalRewards}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Rewards Won</p>
            </div>
          </div>
        )}

        {/* Reward ready banner */}
        {readyCards > 0 && (
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Gift className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-medium text-amber-900 text-sm">
                You have {readyCards} reward{readyCards !== 1 ? "s" : ""} ready to claim!
              </p>
              <p className="text-xs text-amber-700">Show this to the staff at the restaurant.</p>
            </div>
          </div>
        )}

        {/* Cards list */}
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Loading your cards...</p>
          </div>
        ) : cards?.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
              <Coffee className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="font-medium text-foreground">No loyalty cards yet</p>
            <p className="text-sm text-muted-foreground">
              Visit a participating restaurant and ask staff to add you to their loyalty program.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {cards!.map((card) => (
              <LoyaltyCardView key={card.id} card={card} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
