import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import LoyaltyCard from "./LoyaltyCard";
import { ArrowLeft, Coffee, Gift, Clock, Mail, Phone } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";

interface CustomerProfileProps {
  customerId: string;
  onBack: () => void;
}

const CustomerProfile = ({ customerId, onBack }: CustomerProfileProps) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const staffEmail = user?.email || "staff";

  const { data: customer } = useQuery({
    queryKey: ["customer", customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("*, passes(*)")
        .eq("id", customerId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: visits } = useQuery({
    queryKey: ["visits", customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("visits")
        .select("*")
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: rewards } = useQuery({
    queryKey: ["rewards", customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rewards")
        .select("*")
        .eq("customer_id", customerId)
        .order("redeemed_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: activeReward } = useQuery({
    queryKey: ["active-reward"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reward_configs")
        .select("*")
        .eq("is_active", true)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
  });

  const redeemMutation = useMutation({
    mutationFn: async () => {
      if (!activeReward) throw new Error("No active reward configured");

      // Create reward record
      const { error: rewardError } = await supabase.from("rewards").insert({
        customer_id: customerId,
        item_name: activeReward.item_name,
        reward_config_id: activeReward.id,
        redeemed_by: staffEmail,
      });
      if (rewardError) throw rewardError;

      // Reset pass
      const { error: passError } = await supabase
        .from("passes")
        .update({ stamp_count: 0, is_reward_ready: false })
        .eq("customer_id", customerId);
      if (passError) throw passError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer", customerId] });
      queryClient.invalidateQueries({ queryKey: ["rewards", customerId] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Reward redeemed! Card reset to 0 stamps.");
    },
    onError: (error: any) => toast.error(error.message),
  });

  const logVisitMutation = useMutation({
    mutationFn: async () => {
      const { error: visitError } = await supabase.from("visits").insert({
        customer_id: customerId,
        method: "MANUAL" as const,
        logged_by: staffEmail,
      });
      if (visitError) throw visitError;

      const pass = customer?.passes?.[0];
      if (!pass) return;

      const newCount = pass.stamp_count + 1;
      const { error: updateError } = await supabase
        .from("passes")
        .update({ stamp_count: newCount, is_reward_ready: newCount >= 7 })
        .eq("customer_id", customerId);
      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer", customerId] });
      queryClient.invalidateQueries({ queryKey: ["visits", customerId] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Visit logged!");
    },
    onError: (error: any) => toast.error(error.message),
  });

  if (!customer) return null;

  const pass = customer.passes?.[0];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Customers
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        {/* Loyalty Card */}
        <LoyaltyCard
          customerName={customer.name}
          customerCode={customer.code}
          stampCount={pass?.stamp_count || 0}
          isRewardReady={pass?.is_reward_ready || false}
          rewardItem={activeReward?.item_name}
        />

        {/* Actions */}
        <div className="flex gap-3">
          {pass?.is_reward_ready ? (
            <Button className="flex-1" onClick={() => redeemMutation.mutate()} disabled={redeemMutation.isPending}>
              <Gift className="w-4 h-4 mr-2" /> Redeem Reward
            </Button>
          ) : (
            <Button className="flex-1" onClick={() => logVisitMutation.mutate()} disabled={logVisitMutation.isPending}>
              <Coffee className="w-4 h-4 mr-2" /> Log Visit
            </Button>
          )}
        </div>

        {/* Customer Info */}
        <Card className="border-0 surface-warm">
          <CardHeader>
            <CardTitle className="font-serif text-lg">Customer Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground">{customer.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground">{customer.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Member since {format(new Date(customer.created_at), "MMM d, yyyy")}</span>
            </div>
          </CardContent>
        </Card>

        {/* Past Rewards */}
        {rewards && rewards.length > 0 && (
          <Card className="border-0 surface-warm">
            <CardHeader>
              <CardTitle className="font-serif text-lg">Redeemed Rewards</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {rewards.map((reward) => (
                <div key={reward.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-primary" />
                    <span className="text-sm text-foreground">{reward.item_name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{format(new Date(reward.redeemed_at), "MMM d, yyyy")}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Visit History */}
        <Card className="border-0 surface-warm">
          <CardHeader>
            <CardTitle className="font-serif text-lg">Visit History</CardTitle>
          </CardHeader>
          <CardContent>
            {visits?.length === 0 ? (
              <p className="text-sm text-muted-foreground">No visits yet</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {visits?.map((visit) => (
                  <div key={visit.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="flex items-center gap-2">
                      <Coffee className="w-4 h-4 text-primary" />
                      <span className="text-sm text-foreground">Visit</span>
                      <Badge variant="secondary" className="text-xs">
                        {visit.method === "AUTO" ? "Auto" : "Manual"}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(visit.created_at), "MMM d, yyyy 'at' h:mm a")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerProfile;
