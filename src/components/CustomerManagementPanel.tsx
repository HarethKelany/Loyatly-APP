import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Search, Pencil, Trash2, Mail, Phone, Calendar } from "lucide-react";
import { format } from "date-fns";

const CustomerManagementPanel = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [editCustomer, setEditCustomer] = useState<any>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");

  const { data: customers, isLoading } = useQuery({
    queryKey: ["admin-customers", search],
    queryFn: async () => {
      let query = supabase
        .from("customers")
        .select("*, passes(*)")
        .order("created_at", { ascending: false });
      if (search) {
        query = query.or(`code.ilike.%${search}%,name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
      }
      const { data, error } = await query.limit(100);
      if (error) throw error;
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, name, phone, email }: { id: string; name: string; phone: string; email: string }) => {
      const { error } = await supabase
        .from("customers")
        .update({ name, phone, email })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-customers"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setEditCustomer(null);
      toast.success("Customer updated!");
    },
    onError: (error: any) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // Delete pass first (dependent), then customer
      await supabase.from("passes").delete().eq("customer_id", id);
      await supabase.from("visits").delete().eq("customer_id", id);
      await supabase.from("rewards").delete().eq("customer_id", id);
      const { error } = await supabase.from("customers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-customers"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Customer deleted");
    },
    onError: (error: any) => toast.error(error.message),
  });

  const openEdit = (customer: any) => {
    setEditCustomer(customer);
    setEditName(customer.name);
    setEditPhone(customer.phone);
    setEditEmail(customer.email);
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          className="pl-10"
          placeholder="Search customers by code, name, phone, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Customer List */}
      <div className="space-y-3">
        {isLoading ? (
          <p className="text-center text-muted-foreground py-8">Loading customers...</p>
        ) : customers?.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No customers found</p>
        ) : (
          customers?.map((customer) => {
            const pass = customer.passes?.[0];
            return (
              <Card key={customer.id} className="border-0 surface-warm">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="font-mono font-bold text-primary text-sm">{customer.code}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">{customer.name}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{customer.phone}</span>
                          <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{customer.email}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          Joined {format(new Date(customer.created_at), "MMM d, yyyy")}
                          {" · "}{pass?.stamp_count || 0}/7 stamps
                          {pass?.is_reward_ready && <Badge className="ml-2 bg-success text-success-foreground text-[10px]">Reward Ready</Badge>}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Edit Dialog */}
                      <Dialog open={editCustomer?.id === customer.id} onOpenChange={(open) => !open && setEditCustomer(null)}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => openEdit(customer)}>
                            <Pencil className="w-3 h-3 mr-1" /> Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle className="font-serif">Edit Customer</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label>Name</Label>
                              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                              <Label>Phone</Label>
                              <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                              <Label>Email</Label>
                              <Input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
                            </div>
                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button
                              onClick={() => updateMutation.mutate({ id: customer.id, name: editName, phone: editPhone, email: editEmail })}
                              disabled={updateMutation.isPending}
                            >
                              Save Changes
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      {/* Delete */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="font-serif">Delete Customer</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete <strong>{customer.name}</strong> ({customer.code}) and all their visit history and rewards. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => deleteMutation.mutate(customer.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CustomerManagementPanel;
