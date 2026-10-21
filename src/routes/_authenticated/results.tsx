import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMe } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/results")({
  head: () => ({ meta: [{ title: "Invites & results — Recruiter" }] }),
  component: Results,
});

function Results() {
  const { data: me } = useMe();
  const uid = me?.user?.id;
  const { data = [], isLoading } = useQuery({
    queryKey: ["sent", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data: inv } = await supabase.from("invitations").select("*, assessments(title, pass_mark)").eq("employer_id", uid!).order("created_at", { ascending: false });
      const gids = [...new Set((inv ?? []).map((i) => i.graduate_id))];
      const [{ data: grads }, { data: atts }] = await Promise.all([
        gids.length ? supabase.from("graduate_profiles").select("user_id, full_name, institution, degree_class").in("user_id", gids) : Promise.resolve({ data: [] }),
        supabase.from("attempts").select("*").eq("employer_id", uid!),
      ]);
      return (inv ?? []).map((i) => ({ ...i, grad: grads?.find((g) => g.user_id === i.graduate_id), att: atts?.find((a) => a.invitation_id === i.id) }));
    },
  });

  return (
    <div>
      <h1 className="text-3xl font-bold">Invites & results</h1>
      <p className="text-muted-foreground">Track responses and monitored test scores.</p>
      <div className="mt-6 overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
            <tr><th className="p-3">Candidate</th><th className="p-3">Invite</th><th className="p-3">Status</th><th className="p-3">Score</th><th className="p-3">Integrity flags</th></tr>
          </thead>
          <tbody className="divide-y">
            {data.map((r) => {
              const pct = r.att?.total ? Math.round(((r.att.score ?? 0) / r.att.total) * 100) : null;
              const passed = pct != null && r.assessments && pct >= r.assessments.pass_mark;
              const flags = (r.att?.tab_switches ?? 0) + (r.att?.copy_events ?? 0);
              return (
                <tr key={r.id}>
                  <td className="p-3">
                    <Link to="/candidates/$id" params={{ id: r.graduate_id }} className="font-medium hover:text-primary">{r.grad?.full_name || "Graduate"}</Link>
                    <p className="text-xs text-muted-foreground">{r.grad?.institution} · {r.grad?.degree_class}</p>
                  </td>
                  <td className="p-3">{r.title}<p className="text-xs capitalize text-muted-foreground">{r.kind}{r.assessments ? ` · ${r.assessments.title}` : ""}</p></td>
                  <td className="p-3"><Badge variant={r.status === "declined" ? "destructive" : "secondary"} className="capitalize">{r.status}</Badge></td>
                  <td className="p-3">{pct != null && r.att?.submitted_at ? <span className={passed ? "font-semibold text-primary" : "text-destructive"}>{r.att.score}/{r.att.total} ({pct}%)</span> : r.att ? "In progress" : "—"}</td>
                  <td className="p-3">
                    {r.att ? (flags > 0 ? (
                      <span className="flex items-center gap-1 text-destructive" title="Flags are signals, not proof of cheating"><AlertTriangle className="h-4 w-4" />{r.att.tab_switches} tab · {r.att.copy_events} copy</span>
                    ) : <span className="text-primary">Clean</span>) : "—"}
                  </td>
                </tr>
              );
            })}
            {!isLoading && data.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No invitations sent yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
