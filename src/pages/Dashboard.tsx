import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import StampProgress from "@/components/StampProgress";
import CustomerProfile from "@/components/CustomerProfile";
import RewardConfigPanel from "@/components/RewardConfigPanel";
import AnalyticsPanel from "@/components/AnalyticsPanel";
import CustomerManagementPanel from "@/components/CustomerManagementPanel";
import SystemSettingsPanel from "@/components/SystemSettingsPanel";
import { Search, Users, Gift, Coffee, LogOut, BarChart3, Settings, UserCog } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

type TabId = "customers" | "rewards" | "analytics" | "manage" | "settings";

const Dashboard = () => {
  const [search, setSearch] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("customers");
  const queryClient = useQueryClient();
  const { signOut, user } = useAuth();
  const staffEmail = user?.email || "staff";

  const { data: customers, isLoading } = useQuery({
    queryKey: ["customers", search],
    queryFn: async () => {
      let query = supabase.from("customers").select("*, passes(*)").order("created_at", { ascending: false });
      if (search) query = query.or(`code.ilike.%${search}%,name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
      const { data, error } = await query.limit(50);
      if (error) throw error;
      return data;
    },
  });

  const logVisitMutation = useMutation({
    mutationFn: async (customerId: string) => {
      const { error: visitError } = await supabase.from("visits").insert({ customer_id: customerId, method: "MANUAL" as const, logged_by: staffEmail });
      if (visitError) throw visitError;
      const { data: pass, error: passError } = await supabase.from("passes").select("*").eq("customer_id", customerId).single();
      if (passError) throw passError;
      const newCount = pass.stamp_count + 1;
      const isRewardReady = newCount >= 7;
      const { error: updateError } = await supabase.from("passes").update({ stamp_count: newCount, is_reward_ready: isRewardReady }).eq("customer_id", customerId);
      if (updateError) throw updateError;
      return { newCount, isRewardReady };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      if (data.isRewardReady) toast.success("🎉 Customer earned a free reward!");
      else toast.success(`Visit logged! ${data.newCount}/7 stamps`);
    },
    onError: (error: any) => toast.error(error.message),
  });

  if (selectedCustomerId) return <CustomerProfile customerId={selectedCustomerId} onBack={() => setSelectedCustomerId(null)} />;

  const tabs = [
    { id: "customers" as TabId, label: "Customers", icon: Users },
    { id: "rewards" as TabId, label: "Rewards", icon: Gift },
    { id: "analytics" as TabId, label: "Analytics", icon: BarChart3 },
    { id: "manage" as TabId, label: "Manage", icon: UserCog },
    { id: "settings" as TabId, label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-20">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "hsl(var(--coral))" }}>
              <Coffee className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-foreground leading-none">BAKEBAR</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Staff Dashboard</p>
            </div>
          </div>
          <button onClick={signOut} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ background: "hsl(var(--coral-light))", color: "hsl(var(--coral))" }}>
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
        <div className="flex border-t border-border overflow-x-auto">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)} className={`flex-1 flex flex-col items-center gap-0.5 py-2 px-1 text-[10px] font-medium whitespace-nowrap relative min-w-0 ${activeTab === id ? "font-semibold" : "text-muted-foreground"}`} style={activeTab === id ? { color: "hsl(var(--coral))" } : undefined}>
              {activeTab === id && <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full" style={{ background: "hsl(var(--coral))" }} />}
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </div>
      </header>
      <div className="px-4 py-4 space-y-3">
        {activeTab === "rewards" && <RewardConfigPanel />}
        {activeTab === "analytics" && <AnalyticsPanel />}
        {activeTab === "manage" && <CustomerManagementPanel />}
        {activeTab === "settings" && <SystemSettingsPanel />}
        {activeTab === "customers" && (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input className="pl-10 h-11 rounded-xl bg-card border border-border text-sm" placeholder="Search by code, name, phone, or email…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="space-y-2.5">
              {isLoading ? <p className="text-center text-muted-foreground py-8 text-sm">Loading customers…</p>
                : customers?.length === 0 ? <p className="text-center text-muted-foreground py-8 text-sm">No customers found</p>
                : customers?.map((customer) => {
                  const pass = customer.passes?.[0];
                  return (
                    <div key={customer.id} className="bg-card rounded-2xl border border-border p-3 cursor-pointer transition-all hover:shadow-md" onClick={() => setSelectedCustomerId(customer.id)}>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-[10px] font-bold"
                            style={pass?.is_reward_ready ? { background: "hsl(var(--yellow-light))", color: "hsl(var(--accent-foreground))" } : { background: "hsl(var(--coral-light))", color: "hsl(var(--coral))" }}>
                            {customer.code}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-foreground truncate">{customer.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{customer.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {pass?.is_reward_ready
                            ? <Badge className="text-[10px] font-bold px-2 py-0.5" style={{ background: "hsl(var(--yellow))", color: "hsl(var(--accent-foreground))", border: "none" }}>🎉 Reward Ready!</Badge>
                            : <StampProgress stampCount={pass?.stamp_count || 0} />}
                          <button className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 active:scale-95 disabled:opacity-40"
                            style={pass?.is_reward_ready ? { background: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" } : { background: "hsl(var(--coral))", color: "white" }}
                            onClick={(e) => { e.stopPropagation(); logVisitMutation.mutate(customer.id); }}
                            disabled={pass?.is_reward_ready}>
                            <Coffee className="w-3 h-3" /> Log Visit
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
