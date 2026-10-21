import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — Recruiter" }] }),
  component: Admin,
});

function Admin() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["all-employers"],
    queryFn: async () => (await supabase.from("employers").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  async function setApproved(id: string, approved: boolean) {
    const { error } = await supabase.from("employers").update({ approved }).eq("user_id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["all-employers"] });
  }
  return (
    <div>
      <h1 className="text-3xl font-bold">Employer verification</h1>
      <div className="mt-6 space-y-3">
        {data.map((e) => (
          <div key={e.user_id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4">
            <div>
              <p className="font-semibold">{e.company_name || "Unnamed company"} <Badge variant={e.approved ? "default" : "secondary"}>{e.approved ? "Approved" : "Pending"}</Badge></p>
              <p className="text-sm text-muted-foreground">{[e.industry, e.rc_number && `RC ${e.rc_number}`, e.website, e.contact_name, e.contact_phone].filter(Boolean).join(" · ")}</p>
            </div>
            {e.approved ? <Button variant="outline" onClick={() => setApproved(e.user_id, false)}>Suspend</Button> : <Button onClick={() => setApproved(e.user_id, true)}>Approve</Button>}
          </div>
        ))}
        {data.length === 0 && <p className="text-muted-foreground">No employers yet.</p>}
      </div>
    </div>
  );
}
