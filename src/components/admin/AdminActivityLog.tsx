import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

const AdminActivityLog = () => {
  const queryClient = useQueryClient();

  const { data: logs, isLoading } = useQuery({
    queryKey: ["activity-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  const resolveMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("activity_logs")
        .update({ is_resolved: true })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activity-logs"] });
      toast.success("Log marked as resolved");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const severityColor = (s: string) => {
    if (s === "error") return "bg-destructive text-destructive-foreground";
    if (s === "warning") return "bg-accent text-accent-foreground";
    return "bg-muted text-muted-foreground";
  };

  return (
    <Card className="border-0 surface-warm">
      <CardHeader>
        <CardTitle className="font-serif text-lg flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-primary" /> Activity Log
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-muted-foreground text-sm">Loading...</p>
        ) : logs?.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">No activity logs yet</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Severity</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs?.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <Badge className={severityColor(log.severity)}>{log.severity}</Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{log.message}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(log.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {log.is_resolved ? (
                      <Badge variant="outline" className="text-success"><CheckCircle className="w-3 h-3 mr-1" />Resolved</Badge>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => resolveMutation.mutate(log.id)}>
                        Resolve
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminActivityLog;
