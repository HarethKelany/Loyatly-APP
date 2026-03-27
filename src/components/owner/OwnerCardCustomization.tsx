import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Palette, Save, Coffee, Gift } from "lucide-react";

const OwnerCardCustomization = ({ restaurantId }: { restaurantId: string }) => {
  const queryClient = useQueryClient();

  const { data: restaurant } = useQuery({
    queryKey: ["restaurant", restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("restaurants")
        .select("*")
        .eq("id", restaurantId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const [cardBg, setCardBg] = useState("#6b3a1f");
  const [cardAccent, setCardAccent] = useState("#d4722a");
  const [cardText, setCardText] = useState("#faf5f0");

  useEffect(() => {
    if (restaurant) {
      setCardBg(restaurant.card_bg_color || "#6b3a1f");
      setCardAccent(restaurant.card_accent_color || "#d4722a");
      setCardText(restaurant.card_text_color || "#faf5f0");
    }
  }, [restaurant]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("restaurants")
        .update({ card_bg_color: cardBg, card_accent_color: cardAccent, card_text_color: cardText })
        .eq("id", restaurantId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurant", restaurantId] });
      toast.success("Card design saved!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const stamps = [true, true, true, false, false, false, false];

  return (
    <div className="space-y-6 max-w-2xl">
      <Card className="border-0 surface-warm">
        <CardHeader>
          <CardTitle className="font-serif text-lg flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" /> Card Design
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Background", value: cardBg, set: setCardBg },
              { label: "Accent", value: cardAccent, set: setCardAccent },
              { label: "Text", value: cardText, set: setCardText },
            ].map(({ label, value, set }) => (
              <div key={label} className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">{label} Color</Label>
                <div className="flex items-center gap-2">
                  <input type="color" value={value} onChange={(e) => set(e.target.value)} className="w-10 h-10 rounded-lg border border-border cursor-pointer" />
                  <Input value={value} onChange={(e) => set(e.target.value)} className="font-mono text-xs" />
                </div>
              </div>
            ))}
          </div>

          {/* Live Preview */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Live Preview</p>
            <div className="rounded-2xl p-6 shadow-lg max-w-sm mx-auto" style={{ backgroundColor: cardBg, color: cardText }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: cardAccent }}>
                  <Coffee className="w-5 h-5" style={{ color: cardText }} />
                </div>
                <div>
                  <p className="font-serif text-lg font-semibold">{restaurant?.name || "Restaurant"}</p>
                  <p className="text-xs opacity-70">Loyalty Card</p>
                </div>
              </div>
              <p className="text-sm mb-1 opacity-80">Customer Name</p>
              <p className="font-mono text-xs mb-4 opacity-60">#12345</p>
              <div className="flex items-center gap-2">
                {stamps.map((filled, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: filled ? cardAccent : "rgba(255,255,255,0.15)",
                      border: filled ? "none" : "2px dashed rgba(255,255,255,0.3)",
                    }}
                  >
                    {i < 6 ? (
                      filled ? <Coffee className="w-4 h-4" style={{ color: cardText }} /> : <span className="text-xs" style={{ color: cardText, opacity: 0.5 }}>{i + 1}</span>
                    ) : (
                      <Gift className="w-4 h-4" style={{ color: cardText, opacity: filled ? 1 : 0.5 }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            <Save className="w-4 h-4 mr-1" /> {saveMutation.isPending ? "Saving..." : "Save Design"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default OwnerCardCustomization;
