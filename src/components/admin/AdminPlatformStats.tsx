import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Users, Coffee, Gift } from "lucide-react";

const AdminPlatformStats = () => {
  const { data: stats } = useQuery({
    queryKey: ["platform-stats"],
    queryFn: async () => {
      const [restaurants, customers, visits, rewards] = await Promise.all([
        supabase.from("restaurants").select("id", { count: "exact", head: true }),
        supabase.from("customers").select("id", { count: "exact", head: true }),
        supabase.from("visits").select("id", { count: "exact", head: true }),
        supabase.from("rewards").select("id", { count: "exact", head: true }),
      ]);
      return {
        totalRestaurants: restaurants.count || 0,
        totalCustomers: customers.count || 0,
        totalVisits: visits.count || 0,
        totalRewards: rewards.count || 0,
      };
    },
  });

  const cards = [
    { label: "Total Restaurants", value: stats?.totalRestaurants || 0, icon: Building2, color: "text-primary" },
    { label: "Total Customers", value: stats?.totalCustomers || 0, icon: Users, color: "text-accent" },
    { label: "Total Stamps Issued", value: stats?.totalVisits || 0, icon: Coffee, color: "text-success" },
    { label: "Total Rewards Redeemed", value: stats?.totalRewards || 0, icon: Gift, color: "text-destructive" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-serif text-foreground">Platform Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
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

export default AdminPlatformStats;
