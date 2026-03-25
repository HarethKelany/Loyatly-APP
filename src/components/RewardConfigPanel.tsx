import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Gift, Plus, Check } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";

const RewardConfigPanel = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [newItemName, setNewItemName] = useState("");
  const [showForm, setShowForm] = useState(false);

  const { data: rewardConfigs } = useQuery({
    queryKey: ["reward-configs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reward_configs")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (itemName: string) => {
      // Deactivate current active
      await supabase
        .from("reward_configs")
        .update({ is_active: false, active_until: new Date().toISOString() })
        .eq("is_active", true);

      // Create new
      const { error } = await supabase.from("reward_configs").insert({
        item_name: itemName,
        is_active: true,
        active_from: new Date().toISOString(),
        created_by: user?.email || "admin",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reward-configs"] });
      queryClient.invalidateQueries({ queryKey: ["active-reward"] });
      setNewItemName("");
      setShowForm(false);
      toast.success("Reward item updated!");
    },
    onError: (error: any) => toast.error(error.message),
  });

  const activateMutation = useMutation({
    mutationFn: async (configId: string) => {
      await supabase
        .from("reward_configs")
        .update({ is_active: false, active_until: new Date().toISOString() })
        .eq("is_active", true);

      const { error } = await supabase
        .from("reward_configs")
        .update({ is_active: true, active_until: null })
        .eq("id", configId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reward-configs"] });
      queryClient.invalidateQueries({ queryKey: ["active-reward"] });
      toast.success("Reward activated!");
    },
  });

  const activeConfig = rewardConfigs?.find((c) => c.is_active);

  return (
    <div className="space-y-6">
      {/* Current Active Reward */}
      <Card className="reward-card border-0">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-2">
            <Gift className="w-6 h-6 text-primary-foreground" />
            <h3 className="text-lg font-serif text-primary-foreground">Current Free Item</h3>
          </div>
          {activeConfig ? (
            <p className="text-2xl font-serif text-primary-foreground">{activeConfig.item_name}</p>
          ) : (
            <p className="text-primary-foreground/70">No active reward configured</p>
          )}
          {activeConfig && (
            <p className="text-sm text-primary-foreground/60 mt-1">
              Active since {format(new Date(activeConfig.active_from), "MMM d, yyyy")}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Add New */}
      {showForm ? (
        <Card className="border-0 surface-warm">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>New Free Item Name</Label>
                <Input
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="e.g. Cappuccino, Croissant, Matcha Latte..."
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => createMutation.mutate(newItemName)}
                  disabled={!newItemName || createMutation.isPending}
                >
                  <Check className="w-4 h-4 mr-1" /> Set as Active
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-1" /> New Reward Item
        </Button>
      )}

      {/* History */}
      <Card className="border-0 surface-warm">
        <CardHeader>
          <CardTitle className="font-serif text-lg">Reward History</CardTitle>
        </CardHeader>
        <CardContent>
          {rewardConfigs?.length === 0 ? (
            <p className="text-sm text-muted-foreground">No rewards configured yet</p>
          ) : (
            <div className="space-y-3">
              {rewardConfigs?.map((config) => (
                <div
                  key={config.id}
                  className="flex items-center justify-between py-3 border-b border-border last:border-0"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{config.item_name}</p>
                      {config.is_active && (
                        <Badge className="bg-success text-success-foreground text-xs">Active</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(config.active_from), "MMM d, yyyy")}
                      {config.active_until && ` — ${format(new Date(config.active_until), "MMM d, yyyy")}`}
                    </p>
                  </div>
                  {!config.is_active && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => activateMutation.mutate(config.id)}
                    >
                      Reactivate
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RewardConfigPanel;
