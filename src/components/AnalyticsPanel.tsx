import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, Gift, Calendar } from "lucide-react";
import { format, subDays, startOfDay } from "date-fns";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const AnalyticsPanel = () => {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
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

  const { data: signupTrend } = useQuery({
    queryKey: ["signup-trend"],
    queryFn: async () => {
      const since = subDays(new Date(), 30).toISOString();
      const { data, error } = await supabase
        .from("customers")
        .select("created_at")
        .gte("created_at", since)
        .order("created_at", { ascending: true });
      if (error) throw error;

      const grouped: Record<string, number> = {};
      for (let i = 0; i < 30; i++) {
        const day = format(subDays(new Date(), 29 - i), "MMM d");
        grouped[day] = 0;
      }
      data?.forEach((c) => {
        const day = format(new Date(c.created_at), "MMM d");
        if (grouped[day] !== undefined) grouped[day]++;
      });
      return Object.entries(grouped).map(([date, count]) => ({ date, count }));
    },
  });

  const { data: visitTrend } = useQuery({
    queryKey: ["visit-trend"],
    queryFn: async () => {
      const since = subDays(new Date(), 30).toISOString();
      const { data, error } = await supabase
        .from("visits")
        .select("created_at")
        .gte("created_at", since)
        .order("created_at", { ascending: true });
      if (error) throw error;

      const grouped: Record<string, number> = {};
      for (let i = 0; i < 30; i++) {
        const day = format(subDays(new Date(), 29 - i), "MMM d");
        grouped[day] = 0;
      }
      data?.forEach((v) => {
        const day = format(new Date(v.created_at), "MMM d");
        if (grouped[day] !== undefined) grouped[day]++;
      });
      return Object.entries(grouped).map(([date, count]) => ({ date, count }));
    },
  });

  const { data: redemptionTrend } = useQuery({
    queryKey: ["redemption-trend"],
    queryFn: async () => {
      const since = subDays(new Date(), 30).toISOString();
      const { data, error } = await supabase
        .from("rewards")
        .select("redeemed_at")
        .gte("redeemed_at", since)
        .order("redeemed_at", { ascending: true });
      if (error) throw error;

      const grouped: Record<string, number> = {};
      for (let i = 0; i < 30; i++) {
        const day = format(subDays(new Date(), 29 - i), "MMM d");
        grouped[day] = 0;
      }
      data?.forEach((r) => {
        const day = format(new Date(r.redeemed_at), "MMM d");
        if (grouped[day] !== undefined) grouped[day]++;
      });
      return Object.entries(grouped).map(([date, count]) => ({ date, count }));
    },
  });

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
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

      {/* Signup Trend */}
      <Card className="border-0 surface-warm">
        <CardHeader>
          <CardTitle className="font-serif text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" /> New Signups (30 days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={signupTrend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(30, 15%, 88%)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} interval="preserveStartEnd" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="count" name="Signups" stroke="hsl(25, 65%, 42%)" fill="hsl(25, 65%, 42%)" fillOpacity={0.15} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Visit Trend */}
      <Card className="border-0 surface-warm">
        <CardHeader>
          <CardTitle className="font-serif text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" /> Visits (30 days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={visitTrend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(30, 15%, 88%)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} interval="preserveStartEnd" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} tickLine={false} />
                <Tooltip />
                <Bar dataKey="count" name="Visits" fill="hsl(18, 75%, 55%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Redemption Trend */}
      <Card className="border-0 surface-warm">
        <CardHeader>
          <CardTitle className="font-serif text-lg flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" /> Redemptions (30 days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={redemptionTrend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(30, 15%, 88%)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} interval="preserveStartEnd" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="count" name="Redemptions" stroke="hsl(145, 60%, 40%)" fill="hsl(145, 60%, 40%)" fillOpacity={0.15} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsPanel;
