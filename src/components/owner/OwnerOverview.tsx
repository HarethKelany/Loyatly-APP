import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Coffee, Gift, TrendingUp } from "lucide-react";

const OwnerOverview = ({ restaurantId }: { restaurantId: string }) => {
  const { data: stats } = useQuery({
    queryKey: ["owner-stats", restaurantId],
    queryFn: async () => {
      const [customers, visits, rewards] = await Promise.all([
        supabase.from("customers").select("id", { count: "exact", head: true }),
        supabase.from("visits").select("id", { count: "exact", head: true }),
        supabase.from("rewards").select("id", { count: "exact", head: true }),
      ]);
      return {
        totalCustomers: customers.count || 0,
        totalVisits: visits.count || 0,
        totalRewards: rewards.count || 0,
      };
    },
  });

  const statCards = [
    { label: "Total Customers", value: stats?.totalCustomers || 0, icon: Users, color: "text-primary" },
    { label: "Total Visits", value: stats?.totalVisits || 0, icon: Coffee, color: "text-accent" },
    { label: "Rewards Redeemed", value: stats?.totalRewards || 0, icon: Gift, color: "text-success" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="border-0 surface-warm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="text-3xl font-serif text-foreground mt-1">{value}</p>
                </div>
                <Icon className={`w-8 h-8 ${color} opacity-60`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default OwnerOverview;
