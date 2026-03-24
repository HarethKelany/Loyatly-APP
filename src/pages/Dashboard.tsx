import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import StampProgress from "@/components/StampProgress";
import CustomerProfile from "@/components/CustomerProfile";
import RewardConfigPanel from "@/components/RewardConfigPanel";
import { Search, Users, Gift, TrendingUp, Coffee } from "lucide-react";

const Dashboard = () => {
  const [search, setSearch] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"customers" | "rewards">("customers");
  const queryClient = useQueryClient();

  const { data: customers, isLoading } = useQuery({
    queryKey: ["customers", search],
    queryFn: async () => {
      let query = supabase
        .from("customers")
        .select("*, passes(*)")
        .order("created_at", { ascending: false });

      if (search) {
        query = query.or(`code.ilike.%${search}%,name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;
      return data;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [customersRes, visitsRes, rewardsRes] = await Promise.all([
        supabase.from("customers").select("id", { count: "exact", head: true }),
        supabase.from("visits").select("id", { count: "exact", head: true }),
        supabase.from("rewards").select("id", { count: "exact", head: true }),
      ]);
      return {
        totalCustomers: customersRes.count || 0,
        totalVisits: visitsRes.count || 0,
        totalRedemptions: rewardsRes.count || 0,
      };
    },
  });

  const logVisitMutation = useMutation({
    mutationFn: async (customerId: string) => {
      // Create visit
      const { error: visitError } = await supabase.from("visits").insert({
        customer_id: customerId,
        method: "MANUAL" as const,
        logged_by: "staff",
      });
      if (visitError) throw visitError;

      // Get current pass
      const { data: pass, error: passError } = await supabase
        .from("passes")
        .select("*")
        .eq("customer_id", customerId)
        .single();
      if (passError) throw passError;

      const newCount = pass.stamp_count + 1;
      const isRewardReady = newCount >= 7;

      // Update pass
      const { error: updateError } = await supabase
        .from("passes")
        .update({ stamp_count: newCount, is_reward_ready: isRewardReady })
        .eq("customer_id", customerId);
      if (updateError) throw updateError;

      return { newCount, isRewardReady };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      if (data.isRewardReady) {
        toast.success("🎉 Customer has earned a free reward!");
      } else {
        toast.success(`Visit logged! ${data.newCount}/7 stamps`);
      }
    },
    onError: (error: any) => toast.error(error.message),
  });

  if (selectedCustomerId) {
    return (
      <CustomerProfile
        customerId={selectedCustomerId}
        onBack={() => setSelectedCustomerId(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-serif text-foreground">BAKEBAR</h1>
              <p className="text-xs text-muted-foreground">Staff Dashboard</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={activeTab === "customers" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("customers")}
            >
              <Users className="w-4 h-4 mr-1" /> Customers
            </Button>
            <Button
              variant={activeTab === "rewards" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("rewards")}
            >
              <Gift className="w-4 h-4 mr-1" /> Rewards
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {activeTab === "rewards" ? (
          <RewardConfigPanel />
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="surface-warm border-0">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Customers</p>
                      <p className="text-3xl font-serif text-foreground">{stats?.totalCustomers || 0}</p>
                    </div>
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card className="surface-warm border-0">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Visits</p>
                      <p className="text-3xl font-serif text-foreground">{stats?.totalVisits || 0}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card className="surface-warm border-0">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Rewards Redeemed</p>
                      <p className="text-3xl font-serif text-foreground">{stats?.totalRedemptions || 0}</p>
                    </div>
                    <Gift className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                className="pl-10"
                placeholder="Search by code, name, phone, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Customer List */}
            <div className="space-y-3">
              {isLoading ? (
                <p className="text-center text-muted-foreground py-8">Loading customers...</p>
              ) : customers?.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No customers found</p>
              ) : (
                customers?.map((customer) => {
                  const pass = customer.passes?.[0];
                  return (
                    <Card
                      key={customer.id}
                      className="cursor-pointer hover:shadow-md transition-shadow border-0 surface-warm"
                      onClick={() => setSelectedCustomerId(customer.id)}
                    >
                      <CardContent className="py-4">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                              <span className="font-mono font-bold text-primary text-sm">{customer.code}</span>
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{customer.name}</p>
                              <p className="text-sm text-muted-foreground">{customer.phone}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {pass?.is_reward_ready ? (
                              <Badge className="bg-success text-success-foreground">Reward Ready!</Badge>
                            ) : (
                              <StampProgress stampCount={pass?.stamp_count || 0} />
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                logVisitMutation.mutate(customer.id);
                              }}
                              disabled={pass?.is_reward_ready}
                            >
                              <Coffee className="w-4 h-4 mr-1" /> Log Visit
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
