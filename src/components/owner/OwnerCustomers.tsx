import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Users } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const OwnerCustomers = ({ restaurantId }: { restaurantId: string }) => {
  const [search, setSearch] = useState("");

  const { data: customers, isLoading } = useQuery({
    queryKey: ["owner-customers", restaurantId, search],
    queryFn: async () => {
      let query = supabase
        .from("customers")
        .select("*, passes(*)")
        .order("created_at", { ascending: false });
      if (search) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%,code.ilike.%${search}%`);
      }
      const { data, error } = await query.limit(100);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input className="pl-10" placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card className="border-0 surface-warm">
        <CardHeader>
          <CardTitle className="font-serif text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" /> Customers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-sm">Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Stamps</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers?.map((c) => {
                  const pass = c.passes?.[0];
                  return (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono text-primary">{c.code}</TableCell>
                      <TableCell>{c.name}</TableCell>
                      <TableCell className="text-muted-foreground">{c.phone}</TableCell>
                      <TableCell>{pass?.stamp_count || 0}/7</TableCell>
                      <TableCell>
                        {pass?.is_reward_ready ? (
                          <Badge className="bg-success text-success-foreground">Reward Ready</Badge>
                        ) : (
                          <Badge variant="outline">Active</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {customers?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">No customers found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OwnerCustomers;
