import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Gift, Save, Plus, Trash2, Award } from "lucide-react";

type RewardTypeEnum = "free_item" | "percentage_discount" | "fixed_discount" | "custom";
type ResetPolicyEnum = "never" | "after_redemption" | "after_inactivity";

type RewardTier = {
  id?: string;
  visits_required: number;
  reward_type: RewardTypeEnum;
  reward_name: string;
  reward_value: number | null;
  sort_order: number;
};

const REWARD_TYPE_LABELS: Record<string, string> = {
  free_item: "Free Item",
  percentage_discount: "% Discount",
  fixed_discount: "Fixed Amount Off",
  custom: "Custom",
};

const LoyaltySettings = ({ restaurantId }: { restaurantId: string }) => {
  const queryClient = useQueryClient();

  const { data: program, isLoading } = useQuery({
    queryKey: ["loyalty-program", restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("loyalty_programs")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: existingTiers } = useQuery({
    queryKey: ["reward-tiers", program?.id],
    queryFn: async () => {
      if (!program) return [];
      const { data, error } = await supabase
        .from("reward_tiers")
        .select("*")
        .eq("loyalty_program_id", program.id)
        .order("visits_required", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!program,
  });

  const [programName, setProgramName] = useState("");
  const [stampsRequired, setStampsRequired] = useState("7");
  const [rewardDescription, setRewardDescription] = useState("");
  const [expiryDays, setExpiryDays] = useState("");
  const [maxStampsPerVisit, setMaxStampsPerVisit] = useState("1");
  const [resetPolicy, setResetPolicy] = useState<ResetPolicyEnum>("never");
  const [inactivityDays, setInactivityDays] = useState("");
  const [tiers, setTiers] = useState<RewardTier[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (program && !initialized) {
      setProgramName(program.program_name);
      setStampsRequired(String(program.stamps_required));
      setRewardDescription(program.reward_description);
      setExpiryDays(program.expiry_days ? String(program.expiry_days) : "");
      setMaxStampsPerVisit(String(program.max_stamps_per_visit));
      setResetPolicy(((program as any).visit_reset_policy as ResetPolicyEnum) || "never");
      setInactivityDays((program as any).inactivity_days ? String((program as any).inactivity_days) : "");
      setInitialized(true);
    }
  }, [program, initialized]);

  useEffect(() => {
    if (existingTiers && existingTiers.length > 0) {
      setTiers(existingTiers.map((t: any) => ({
        id: t.id,
        visits_required: t.visits_required,
        reward_type: t.reward_type,
        reward_name: t.reward_name,
        reward_value: t.reward_value,
        sort_order: t.sort_order,
      })));
    }
  }, [existingTiers]);

  const addTier = () => {
    setTiers([...tiers, {
      visits_required: 5,
      reward_type: "free_item",
      reward_name: "",
      reward_value: null,
      sort_order: tiers.length,
    }]);
  };

  const removeTier = (index: number) => {
    setTiers(tiers.filter((_, i) => i !== index));
  };

  const updateTier = (index: number, field: keyof RewardTier, value: any) => {
    const updated = [...tiers];
    (updated[index] as any)[field] = value;
    setTiers(updated);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        restaurant_id: restaurantId,
        program_name: programName || "Loyalty Program",
        stamps_required: parseInt(stampsRequired) || 7,
        reward_description: rewardDescription || "Free Item",
        expiry_days: expiryDays ? parseInt(expiryDays) : null,
        max_stamps_per_visit: parseInt(maxStampsPerVisit) || 1,
        visit_reset_policy: resetPolicy,
        inactivity_days: resetPolicy === "after_inactivity" && inactivityDays ? parseInt(inactivityDays) : null,
        is_active: true,
      };

      let programId: string;

      if (program) {
        const { error } = await supabase
          .from("loyalty_programs")
          .update(payload)
          .eq("id", program.id);
        if (error) throw error;
        programId = program.id;
      } else {
        const { data, error } = await supabase
          .from("loyalty_programs")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw error;
        programId = data.id;
      }

      // Sync tiers: delete removed, upsert existing/new
      const existingIds = existingTiers?.map((t: any) => t.id) || [];
      const currentIds = tiers.filter(t => t.id).map(t => t.id!);
      const deletedIds = existingIds.filter((id: string) => !currentIds.includes(id));

      if (deletedIds.length > 0) {
        const { error } = await supabase
          .from("reward_tiers")
          .delete()
          .in("id", deletedIds);
        if (error) throw error;
      }

      for (let i = 0; i < tiers.length; i++) {
        const tier = tiers[i];
        const tierPayload = {
          loyalty_program_id: programId,
          visits_required: tier.visits_required,
          reward_type: tier.reward_type,
          reward_name: tier.reward_name || "Reward",
          reward_value: tier.reward_value,
          sort_order: i,
        };

        if (tier.id) {
          const { error } = await supabase
            .from("reward_tiers")
            .update(tierPayload)
            .eq("id", tier.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("reward_tiers")
            .insert(tierPayload);
          if (error) throw error;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loyalty-program", restaurantId] });
      queryClient.invalidateQueries({ queryKey: ["reward-tiers"] });
      toast.success("Loyalty program saved! Changes apply to new visits only.");
    },
    onError: (e: any) => toast.error(e.message),
  });

  if (isLoading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* General Settings */}
      <Card className="border-0 surface-warm">
        <CardHeader>
          <CardTitle className="font-serif text-lg flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" /> Program Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Program Name</Label>
            <Input value={programName} onChange={(e) => setProgramName(e.target.value)} placeholder="Loyalty Program" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Default Visits for Reward</Label>
              <Input type="number" min="1" value={stampsRequired} onChange={(e) => setStampsRequired(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Max Stamps per Visit</Label>
              <Input type="number" min="1" value={maxStampsPerVisit} onChange={(e) => setMaxStampsPerVisit(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Default Reward Description</Label>
            <Input value={rewardDescription} onChange={(e) => setRewardDescription(e.target.value)} placeholder="Free Coffee" />
          </div>
        </CardContent>
      </Card>

      {/* Visit Reset Policy */}
      <Card className="border-0 surface-warm">
        <CardHeader>
          <CardTitle className="font-serif text-lg">Visit Count Reset Policy</CardTitle>
          <p className="text-xs text-muted-foreground">Controls when a customer's visit count resets. Changes only affect new visits.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Reset Policy</Label>
            <Select value={resetPolicy} onValueChange={(v) => setResetPolicy(v as ResetPolicyEnum)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="never">Never — visits accumulate forever</SelectItem>
                <SelectItem value="after_redemption">After reward is redeemed</SelectItem>
                <SelectItem value="after_inactivity">After period of inactivity</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {resetPolicy === "after_inactivity" && (
            <div className="space-y-2">
              <Label>Days of inactivity before reset</Label>
              <Input type="number" min="1" value={inactivityDays} onChange={(e) => setInactivityDays(e.target.value)} placeholder="e.g. 90" />
            </div>
          )}
          <div className="space-y-2">
            <Label>Card Expiry Days (optional)</Label>
            <Input type="number" min="1" value={expiryDays} onChange={(e) => setExpiryDays(e.target.value)} placeholder="No expiry" />
          </div>
        </CardContent>
      </Card>

      {/* Reward Tiers */}
      <Card className="border-0 surface-warm">
        <CardHeader>
          <CardTitle className="font-serif text-lg flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" /> Reward Tiers
          </CardTitle>
          <p className="text-xs text-muted-foreground">Set up multiple rewards at different visit milestones. If no tiers are set, the default reward above is used.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {tiers.map((tier, i) => (
            <div key={i} className="p-4 rounded-lg border border-border bg-background space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Tier {i + 1}</span>
                <Button variant="ghost" size="sm" onClick={() => removeTier(i)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Visits Required</Label>
                  <Input
                    type="number"
                    min="1"
                    value={tier.visits_required}
                    onChange={(e) => updateTier(i, "visits_required", parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Reward Type</Label>
                  <Select value={tier.reward_type} onValueChange={(v) => updateTier(i, "reward_type", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(REWARD_TYPE_LABELS).map(([val, label]) => (
                        <SelectItem key={val} value={val}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Reward Name</Label>
                  <Input
                    value={tier.reward_name}
                    onChange={(e) => updateTier(i, "reward_name", e.target.value)}
                    placeholder="e.g. Free Dessert"
                  />
                </div>
                {(tier.reward_type === "percentage_discount" || tier.reward_type === "fixed_discount") && (
                  <div className="space-y-1">
                    <Label className="text-xs">
                      {tier.reward_type === "percentage_discount" ? "Discount %" : "Amount Off"}
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      value={tier.reward_value ?? ""}
                      onChange={(e) => updateTier(i, "reward_value", e.target.value ? parseFloat(e.target.value) : null)}
                      placeholder={tier.reward_type === "percentage_discount" ? "e.g. 10" : "e.g. 5.00"}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
          <Button variant="outline" onClick={addTier} className="w-full">
            <Plus className="w-4 h-4 mr-1" /> Add Reward Tier
          </Button>
        </CardContent>
      </Card>

      {/* Save */}
      <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} size="lg" className="w-full">
        <Save className="w-4 h-4 mr-2" /> {saveMutation.isPending ? "Saving..." : "Save All Settings"}
      </Button>
      <p className="text-xs text-muted-foreground text-center">Changes only apply to new visits — existing customer progress is preserved.</p>
    </div>
  );
};

export default LoyaltySettings;
