import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, ClipboardCheck, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMe } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/invitations")({
  head: () => ({ meta: [{ title: "Invitations — Findme" }] }),
  component: Invitations,
});

function Invitations() {
  const { data: me } = useMe();
  const uid = me?.user?.id;
  const qc = useQueryClient();
  const { data: invites = [], isLoading } = useQuery({
    queryKey: ["my-invites", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data: inv } = await supabase.from("invitations").select("*, assessments(title, duration_minutes)").eq("graduate_id", uid!).order("created_at", { ascending: false });
      const ids = [...new Set((inv ?? []).map((i) => i.employer_id))];
      const { data: emps } = ids.length ? await supabase.from("employers").select("user_id, company_name").in("user_id", ids) : { data: [] };
      const { data: atts } = await supabase.from("attempts").select("invitation_id, score, total, submitted_at").eq("graduate_id", uid!);
      return (inv ?? []).map((i) => ({
        ...i,
        company: emps?.find((e) => e.user_id === i.employer_id)?.company_name || "An employer",
        attempt: atts?.find((a) => a.invitation_id === i.id),
      }));
    },
  });

  async function respond(id: string, status: "accepted" | "declined") {
    await supabase.from("invitations").update({ status }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["my-invites", uid] });
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">Invitations</h1>
      <p className="text-muted-foreground">Interview and assessment invites from employers.</p>
      <div className="mt-6 space-y-4">
        {isLoading && <p className="text-muted-foreground">Loading…</p>}
        {!isLoading && invites.length === 0 && (
          <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">No invitations yet. A complete profile gets found faster.</div>
        )}
        {invites.map((i) => (
          <div key={i.id} className="rounded-xl border bg-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-sm text-muted-foreground">{i.company}</p>
                <h2 className="text-lg font-semibold">{i.title}</h2>
              </div>
              <Badge variant={i.status === "declined" ? "destructive" : "secondary"} className="capitalize">{i.status}</Badge>
            </div>
            {i.message && <p className="mt-2 whitespace-pre-wrap text-sm">{i.message}</p>}
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
              {i.scheduled_at && <span className="flex items-center gap-1"><CalendarDays className="h-4 w-4" />{new Date(i.scheduled_at).toLocaleString()}</span>}
              {i.location && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{i.location}</span>}
              {i.assessments && <span className="flex items-center gap-1"><ClipboardCheck className="h-4 w-4" />{i.assessments.title} · {i.assessments.duration_minutes} min</span>}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {i.kind === "assessment" && i.assessment_id && !i.attempt?.submitted_at && i.status !== "declined" && (
                <Button asChild variant="hero"><Link to="/test/$invitationId" params={{ invitationId: i.id }}>Take test</Link></Button>
              )}
              {i.attempt?.submitted_at && <p className="text-sm font-medium text-primary">Test submitted</p>}
              {i.status === "pending" && (
                <>
                  {i.kind === "interview" && <Button onClick={() => respond(i.id, "accepted")}>Accept</Button>}
                  <Button variant="outline" onClick={() => respond(i.id, "declined")}>Decline</Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
