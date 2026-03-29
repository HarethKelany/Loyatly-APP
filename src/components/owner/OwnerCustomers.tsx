import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Search, Users } from "lucide-react";

const OwnerCustomers = ({ restaurantId }: { restaurantId: string }) => {
  const [search, setSearch] = useState("");
  const { data: customers, isLoading } = useQuery({
    queryKey: ["owner-customers", restaurantId, search],
    queryFn: async () => {
      let query = supabase.from("customers").select("*, passes(*)").order("created_at", { ascending: false });
      if (search) query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%,code.ilike.%${search}%`);
      const { data, error } = await query.limit(100);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-2xl border border-border p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "hsl(var(--teal-light))" }}>
          <Users className="w-5 h-5" style={{ color: "hsl(var(--teal))" }} />
        </div>
        <div>
          <p className="text-xl font-extrabold text-foreground leading-none">{customers?.length ?? "—"}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Total customers</p>
        </div>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input className="pl-10 h-11 rounded-xl bg-card border border-border text-sm" placeholder="Search customers…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div className="space-y-2.5">
        {isLoading ? <p className="text-center text-muted-foreground text-sm py-8">Loading…</p>
          : customers?.map((c) => {
            const pass = c.passes?.[0];
            const isReady = pass?.is_reward_ready;
            return (
              <div key={c.id} className="bg-card rounded-2xl border border-border p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                  style={isReady ? { background: "hsl(var(--yellow-light))", color: "hsl(var(--accent-foreground))" } : { background: "hsl(var(--teal-light))", color: "hsl(var(--teal))" }}>
                  {c.code}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{c.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{c.phone || c.email}</p>
                </div>
                <div className="flex-shrink-0 text-right">
                  {isReady
                    ? <span className="text-[10px] font-bold px-2 py-1 rounded-lg" style={{ background: "hsl(var(--yellow))", color: "hsl(var(--accent-foreground))" }}>🎉 Ready</span>
                    : <><p className="text-sm font-extrabold text-foreground">{pass?.stamp_count || 0}/7</p><p className="text-[10px] text-muted-foreground">stamps</p></>}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default OwnerCustomers;
