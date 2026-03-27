import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, Building2, Plus, AlertTriangle, BarChart3, Shield } from "lucide-react";
import AdminRestaurants from "@/components/admin/AdminRestaurants";
import AdminAddRestaurant from "@/components/admin/AdminAddRestaurant";
import AdminActivityLog from "@/components/admin/AdminActivityLog";
import AdminPlatformStats from "@/components/admin/AdminPlatformStats";

type TabId = "restaurants" | "add" | "logs" | "stats";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<TabId>("restaurants");
  const { signOut, user } = useAuth();

  const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: "restaurants", label: "All Restaurants", icon: Building2 },
    { id: "add", label: "Add Restaurant", icon: Plus },
    { id: "logs", label: "Activity Log", icon: AlertTriangle },
    { id: "stats", label: "Platform Stats", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-destructive text-destructive-foreground flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-serif text-foreground">Super Admin</h1>
              <p className="text-xs text-muted-foreground">Platform Control Panel</p>
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
        {activeTab === "restaurants" && <AdminRestaurants />}
        {activeTab === "add" && <AdminAddRestaurant onCreated={() => setActiveTab("restaurants")} />}
        {activeTab === "logs" && <AdminActivityLog />}
        {activeTab === "stats" && <AdminPlatformStats />}
      </div>
    </div>
  );
};

export default AdminDashboard;
