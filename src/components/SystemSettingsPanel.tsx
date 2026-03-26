import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Database, Users, Coffee, Gift, FileText } from "lucide-react";
import { format } from "date-fns";

const SystemSettingsPanel = () => {
  const { data: stats } = useQuery({
    queryKey: ["system-stats"],
    queryFn: async () => {
      const [customers, visits, rewards, configs] = await Promise.all([
        supabase.from("customers").select("id", { count: "exact", head: true }),
        supabase.from("visits").select("id", { count: "exact", head: true }),
        supabase.from("rewards").select("id", { count: "exact", head: true }),
        supabase.from("reward_configs").select("*").eq("is_active", true).maybeSingle(),
      ]);
      return {
        totalCustomers: customers.count || 0,
        totalVisits: visits.count || 0,
        totalRedemptions: rewards.count || 0,
        activeReward: configs.data,
      };
    },
  });

  const { data: recentCustomers } = useQuery({
    queryKey: ["recent-customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("name, code, created_at")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  const { data: recentRedemptions } = useQuery({
    queryKey: ["recent-redemptions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rewards")
        .select("item_name, redeemed_at, redeemed_by, customer_id")
        .order("redeemed_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      {/* System Info */}
      <Card className="reward-card border-0">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-6 h-6 text-primary-foreground" />
            <h3 className="text-lg font-serif text-primary-foreground">System Overview</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-primary-foreground/70">Stamp Threshold</p>
              <p className="text-2xl font-serif text-primary-foreground">7 visits</p>
            </div>
            <div>
              <p className="text-sm text-primary-foreground/70">Active Reward</p>
              <p className="text-xl font-serif text-primary-foreground">{stats?.activeReward?.item_name || "Not set"}</p>
            </div>
            <div>
              <p className="text-sm text-primary-foreground/70">Total Customers</p>
              <p className="text-2xl font-serif text-primary-foreground">{stats?.totalCustomers || 0}</p>
            </div>
            <div>
              <p className="text-sm text-primary-foreground/70">Total Visits</p>
              <p className="text-2xl font-serif text-primary-foreground">{stats?.totalVisits || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Signups */}
        <Card className="border-0 surface-warm">
          <CardHeader>
            <CardTitle className="font-serif text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" /> Recent Signups
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentCustomers?.length === 0 ? (
              <p className="text-sm text-muted-foreground">No customers yet</p>
            ) : (
              <div className="space-y-3">
                {recentCustomers?.map((c, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-primary bg-primary/10 px-2 py-1 rounded">{c.code}</span>
                      <span className="text-sm text-foreground">{c.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{format(new Date(c.created_at), "MMM d, yyyy")}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Redemptions */}
        <Card className="border-0 surface-warm">
          <CardHeader>
            <CardTitle className="font-serif text-lg flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary" /> Recent Redemptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentRedemptions?.length === 0 ? (
              <p className="text-sm text-muted-foreground">No redemptions yet</p>
            ) : (
              <div className="space-y-3">
                {recentRedemptions?.map((r, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm text-foreground">{r.item_name}</p>
                      <p className="text-xs text-muted-foreground">by {r.redeemed_by}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{format(new Date(r.redeemed_at), "MMM d, yyyy")}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Configuration Info */}
      <Card className="border-0 surface-warm">
        <CardHeader>
          <CardTitle className="font-serif text-lg flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" /> System Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Business Name</span>
              <span className="text-sm font-medium text-foreground">BAKEBAR</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Loyalty Program</span>
              <Badge className="bg-success text-success-foreground">Active</Badge>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Stamps per Reward</span>
              <span className="text-sm font-medium text-foreground">7</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Current Reward Item</span>
              <span className="text-sm font-medium text-foreground">{stats?.activeReward?.item_name || "Not configured"}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">Stamp Expiry</span>
              <span className="text-sm font-medium text-foreground">Never</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemSettingsPanel;
