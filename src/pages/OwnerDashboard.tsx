import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
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
  const { signOut, user, restaurantId } = useAuth();

  const { data: restaurant } = useQuery({
    queryKey: ["restaurant", restaurantId],
    queryFn: async () => {
      if (!restaurantId) return null;
      const { data, error } = await supabase
        .from("restaurants")
        .select("*")
        .eq("id", restaurantId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!restaurantId,
  });

  const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "loyalty", label: "Loyalty Program", icon: Gift },
    { id: "customize", label: "Card Design", icon: Settings },
    { id: "customers", label: "Customers", icon: Users },
    { id: "qr", label: "QR Code", icon: QrCode },
  ];

  if (!restaurantId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-muted-foreground">No restaurant assigned to your account.</p>
          <Button variant="outline" onClick={signOut}>Sign Out</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-serif text-foreground">{restaurant?.name || "Restaurant"}</h1>
              <p className="text-xs text-muted-foreground">Owner Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:inline">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-1" /> Sign Out
            </Button>
          </div>
        </div>
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto pb-0">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${
                  activeTab === id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
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
