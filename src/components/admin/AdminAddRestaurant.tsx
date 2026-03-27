import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus, Save } from "lucide-react";

const AdminAddRestaurant = ({ onCreated }: { onCreated: () => void }) => {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!name) throw new Error("Restaurant name is required");

      // Create restaurant (owner_id will be linked later when owner logs in)
      const { data: restaurant, error: rError } = await supabase
        .from("restaurants")
        .insert({ name })
        .select()
        .single();
      if (rError) throw rError;

      // If owner email provided, check if they have a profile and update it
      if (ownerEmail) {
        // Find user by email in profiles
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("id")
          .ilike("email", ownerEmail.toLowerCase())
          .maybeSingle();

        if (existingProfile) {
          // Update existing profile
          await supabase
            .from("profiles")
            .update({ role: "RESTAURANT_OWNER", restaurant_id: restaurant.id })
            .eq("id", existingProfile.id);

          // Update restaurant owner_id
          await supabase
            .from("restaurants")
            .update({ owner_id: existingProfile.id })
            .eq("id", restaurant.id);
        }
        // If no profile yet, it will be created when they sign up
      }

      return restaurant;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-restaurants"] });
      toast.success("Restaurant created!");
      setName("");
      setOwnerEmail("");
      onCreated();
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <Card className="border-0 surface-warm max-w-lg">
      <CardHeader>
        <CardTitle className="font-serif text-lg flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary" /> Add Restaurant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Restaurant Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. BakeBar" />
        </div>
        <div className="space-y-2">
          <Label>Owner Email (optional)</Label>
          <Input type="email" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} placeholder="owner@restaurant.com" />
          <p className="text-xs text-muted-foreground">If the owner already has an account, their role will be updated automatically.</p>
        </div>
        <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
          <Save className="w-4 h-4 mr-1" /> {createMutation.isPending ? "Creating..." : "Create Restaurant"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AdminAddRestaurant;
