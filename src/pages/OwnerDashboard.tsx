import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, BarChart3, Settings, Users, Gift, QrCode, Coffee } from "lucide-react";
import OwnerOverview from "@/components/owner/OwnerOverview";
import LoyaltySettings from "@/components/owner/LoyaltySettings";
import OwnerCardCustomization from "@/components/owner/OwnerCardCustomization";
import OwnerCustomers from "@/components/owner/OwnerCustomers";
import OwnerQRCode from "@/components/owner/OwnerQRCode";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type TabId = "overview" | "loyalty" | "customize" | "customers" | "qr";

const OwnerDashboard = () => {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const { signOut, restaurantId } = useAuth();
  const { data: restaurant } = useQuery({
    queryKey: ["restaurant", restaurantId],
    queryFn: async () => {
      if (!restaurantId) return null;
      const { data, error } = await supabase.from("restaurants").select("*").eq("id", restaurantId).single();
      if (error) throw error;
      return data;
    },
    enabled: !!restaurantId,
  });

  const tabs = [
    { id: "overview" as TabId, label: "Overview", icon: BarChart3 },
    { id: "loyalty" as TabId, label: "Loyalty", icon: Gift },
    { id: "customize" as TabId, label: "Card", icon: Settings },
    { id: "customers" as TabId, label: "Customers", icon: Users },
    { id: "qr" as TabId, label: "QR Code", icon: QrCode },
  ];

  if (!restaurantId) return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="text-center space-y-4">
        <p className="text-sm text-muted-foreground">No restaurant assigned to your account.</p>
        <button onClick={signOut} className="text-sm font-semibold px-4 py-2 rounded-xl border border-border text-muted-foreground">Sign Out</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-card border-b border-border sticky top-0 z-20">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "hsl(var(--teal))" }}>
              <Coffee className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-foreground leading-none">{restaurant?.name || "Restaurant"}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Owner Dashboard</p>
            </div>
          </div>
          <button onClick={signOut} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ background: "hsl(var(--teal-light))", color: "hsl(var(--teal))" }}>
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
        <div className="flex border-t border-border overflow-x-auto">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)} className={`flex-1 flex flex-col items-center gap-0.5 py-2 px-1 text-[10px] font-medium whitespace-nowrap relative min-w-0 ${activeTab === id ? "font-semibold" : "text-muted-foreground"}`} style={activeTab === id ? { color: "hsl(var(--teal))" } : undefined}>
              {activeTab === id && <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full" style={{ background: "hsl(var(--teal))" }} />}
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </div>
      </header>
      <div className="flex-1 px-4 py-4">
        {activeTab === "overview" && <OwnerOverview restaurantId={restaurantId} />}
        {activeTab === "loyalty" && <LoyaltySettings restaurantId={restaurantId} />}
        {activeTab === "customize" && <OwnerCardCustomization restaurantId={restaurantId} />}
        {activeTab === "customers" && <OwnerCustomers restaurantId={restaurantId} />}
        {activeTab === "qr" && <OwnerQRCode restaurantId={restaurantId} restaurantName={restaurant?.name || "Restaurant"} />}
      </div>
    </div>
  );
};

export default OwnerDashboard;
