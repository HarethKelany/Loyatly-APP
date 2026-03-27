import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Gift, Save } from "lucide-react";

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

  const [programName, setProgramName] = useState("");
  const [stampsRequired, setStampsRequired] = useState("7");
  const [rewardDescription, setRewardDescription] = useState("");
  const [expiryDays, setExpiryDays] = useState("");
  const [maxStampsPerVisit, setMaxStampsPerVisit] = useState("1");

  // Sync state when data loads
  const isInitialized = program !== undefined;
  if (isInitialized && programName === "" && program) {
    setProgramName(program.program_name);
    setStampsRequired(String(program.stamps_required));
    setRewardDescription(program.reward_description);
    setExpiryDays(program.expiry_days ? String(program.expiry_days) : "");
    setMaxStampsPerVisit(String(program.max_stamps_per_visit));
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        restaurant_id: restaurantId,
        program_name: programName || "Loyalty Program",
        stamps_required: parseInt(stampsRequired) || 7,
        reward_description: rewardDescription || "Free Item",
        expiry_days: expiryDays ? parseInt(expiryDays) : null,
        max_stamps_per_visit: parseInt(maxStampsPerVisit) || 1,
        is_active: true,
      };

      if (program) {
        const { error } = await supabase
          .from("loyalty_programs")
          .update(payload)
          .eq("id", program.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("loyalty_programs")
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loyalty-program", restaurantId] });
      toast.success("Loyalty program saved!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  if (isLoading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <Card className="border-0 surface-warm max-w-2xl">
      <CardHeader>
        <CardTitle className="font-serif text-lg flex items-center gap-2">
          <Gift className="w-5 h-5 text-primary" /> Loyalty Program Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Program Name</Label>
          <Input value={programName} onChange={(e) => setProgramName(e.target.value)} placeholder="Loyalty Program" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Stamps Required for Reward</Label>
            <Input type="number" min="1" value={stampsRequired} onChange={(e) => setStampsRequired(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Max Stamps per Visit</Label>
            <Input type="number" min="1" value={maxStampsPerVisit} onChange={(e) => setMaxStampsPerVisit(e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Reward Description</Label>
          <Input value={rewardDescription} onChange={(e) => setRewardDescription(e.target.value)} placeholder="Free Coffee" />
        </div>
        <div className="space-y-2">
          <Label>Expiry Days (leave blank for no expiry)</Label>
          <Input type="number" min="1" value={expiryDays} onChange={(e) => setExpiryDays(e.target.value)} placeholder="No expiry" />
        </div>
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
          <Save className="w-4 h-4 mr-1" /> {saveMutation.isPending ? "Saving..." : "Save Settings"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default LoyaltySettings;
