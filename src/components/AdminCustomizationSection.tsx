import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ShieldCheck, ChevronDown, Upload, Palette, Coffee, Gift } from "lucide-react";

const AdminCustomizationSection = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [cardBg, setCardBg] = useState("#6b3a1f");
  const [cardAccent, setCardAccent] = useState("#d4722a");
  const [cardText, setCardText] = useState("#faf5f0");

  // Check if current user is admin via staff_users table
  const { data: staffUser, isLoading, isFetching } = useQuery({
    queryKey: ["staff-role", user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const email = user.email.toLowerCase();
      console.log("Fetching staff role for:", email);
      const { data, error } = await supabase
        .from("staff_users")
        .select("role")
        .ilike("email", email)
        .maybeSingle();
      console.log("Staff role response:", { data, error });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.email,
  });

  // Show nothing while loading — don't flash "Access Restricted"
  if (isLoading || isFetching) return null;

  if (!staffUser || staffUser.role !== "ADMIN") {
    return (
      <Card className="border-0 surface-warm">
        <CardContent className="py-6">
          <div className="flex items-center gap-3 text-muted-foreground">
            <ShieldCheck className="w-5 h-5" />
            <p className="text-sm">Admin Customization — Access Restricted</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLogoPreview(url);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setBannerPreview(url);
    }
  };

  const stamps = [true, true, true, false, false, false, false];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-0 surface-warm">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardTitle className="font-serif text-lg flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                Admin Customization
                <Badge variant="outline" className="ml-2 text-xs">Admin Only</Badge>
              </span>
              <ChevronDown
                className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-8 pt-0">
            {/* Logo Upload */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Upload className="w-4 h-4" /> Logo Upload
              </Label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-muted/30 overflow-hidden">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                  ) : (
                    <Coffee className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="max-w-xs"
                />
              </div>
            </div>

            {/* Banner Upload */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Upload className="w-4 h-4" /> Banner Upload
              </Label>
              <div className="space-y-2">
                <div className="w-full h-32 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-muted/30 overflow-hidden">
                  {bannerPreview ? (
                    <img src={bannerPreview} alt="Banner preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm text-muted-foreground">No banner selected</span>
                  )}
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerChange}
                  className="max-w-xs"
                />
              </div>
            </div>

            {/* Loyalty Card Designer */}
            <div className="space-y-4">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Palette className="w-4 h-4" /> Loyalty Card Designer
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Background Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={cardBg}
                      onChange={(e) => setCardBg(e.target.value)}
                      className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                    />
                    <Input
                      value={cardBg}
                      onChange={(e) => setCardBg(e.target.value)}
                      className="font-mono text-xs"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Accent Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={cardAccent}
                      onChange={(e) => setCardAccent(e.target.value)}
                      className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                    />
                    <Input
                      value={cardAccent}
                      onChange={(e) => setCardAccent(e.target.value)}
                      className="font-mono text-xs"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Text Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={cardText}
                      onChange={(e) => setCardText(e.target.value)}
                      className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                    />
                    <Input
                      value={cardText}
                      onChange={(e) => setCardText(e.target.value)}
                      className="font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="pt-2">
                <p className="text-xs text-muted-foreground mb-2">Live Preview</p>
                <div
                  className="rounded-2xl p-6 shadow-lg max-w-sm mx-auto"
                  style={{ backgroundColor: cardBg, color: cardText }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: cardAccent }}
                    >
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo" className="w-6 h-6 object-contain" />
                      ) : (
                        <Coffee className="w-5 h-5" style={{ color: cardText }} />
                      )}
                    </div>
                    <div>
                      <p className="font-serif text-lg font-semibold">BAKEBAR</p>
                      <p className="text-xs opacity-70">Loyalty Card</p>
                    </div>
                  </div>
                  <p className="text-sm mb-1 opacity-80">Customer Name</p>
                  <p className="font-mono text-xs mb-4 opacity-60">#12345</p>
                  <div className="flex items-center gap-2">
                    {stamps.map((filled, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                        style={{
                          backgroundColor: filled ? cardAccent : "rgba(255,255,255,0.15)",
                          border: filled ? "none" : "2px dashed rgba(255,255,255,0.3)",
                        }}
                      >
                        {i < 6 ? (
                          filled ? (
                            <Coffee className="w-4 h-4" style={{ color: cardText }} />
                          ) : (
                            <span className="text-xs" style={{ color: cardText, opacity: 0.5 }}>
                              {i + 1}
                            </span>
                          )
                        ) : (
                          <Gift className="w-4 h-4" style={{ color: cardText, opacity: filled ? 1 : 0.5 }} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

export default AdminCustomizationSection;
