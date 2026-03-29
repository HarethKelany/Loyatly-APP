import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, Coffee, Gift } from "lucide-react";

const OwnerOverview = ({ restaurantId }: { restaurantId: string }) => {
  const { data: stats } = useQuery({
    queryKey: ["owner-stats", restaurantId],
    queryFn: async () => {
      const [customers, visits, rewards] = await Promise.all([
        supabase.from("customers").select("id", { count: "exact", head: true }),
        supabase.from("visits").select("id", { count: "exact", head: true }),
        supabase.from("rewards").select("id", { count: "exact", head: true }),
      ]);
      return { totalCustomers: customers.count || 0, totalVisits: visits.count || 0, totalRewards: rewards.count || 0 };
    },
  });

  const cards = [
    { label: "Total Customers", value: stats?.totalCustomers || 0, icon: Users, bg: "hsl(var(--teal-light))", color: "hsl(var(--teal))" },
    { label: "Total Visits", value: stats?.totalVisits || 0, icon: Coffee, bg: "hsl(var(--yellow-light))", color: "hsl(var(--accent-foreground))" },
    { label: "Rewards Redeemed", value: stats?.totalRewards || 0, icon: Gift, bg: "hsl(var(--coral-light))", color: "hsl(var(--coral))" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {cards.map(({ label, value, icon: Icon, bg, color }) => (
          <div key={label} className="bg-card rounded-2xl border border-border p-3 flex flex-col gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: bg }}>
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <p className="text-xl font-extrabold text-foreground leading-none">{value}</p>
            <p className="text-[10px] text-muted-foreground leading-snug">{label}</p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl p-4 flex items-center justify-between" style={{ background: "linear-gradient(135deg, hsl(var(--teal)), hsl(190 80% 45%))" }}>
        <div>
          <p className="text-sm font-bold text-white">Your QR Code is Ready</p>
          <p className="text-xs text-white/80 mt-0.5">Customers scan to join your loyalty program</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
          <Gift className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
};

export default OwnerOverview;
