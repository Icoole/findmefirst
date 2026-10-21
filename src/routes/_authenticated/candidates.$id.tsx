import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, FileText, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InviteDialog } from "@/components/InviteDialog";
import { useEmployer } from "./company";
import { ageFromDob } from "@/lib/constants";

export const Route = createFileRoute("/_authenticated/candidates/$id")({
  head: () => ({ meta: [{ title: "Candidate — Recruiter" }] }),
  component: Candidate,
});

function Candidate() {
  const { id } = Route.useParams();
  const { data: emp } = useEmployer();
  const { data } = useQuery({
    queryKey: ["candidate", id],
    queryFn: async () => {
      const [{ data: g }, { data: docs }] = await Promise.all([
        supabase.from("graduate_profiles").select("*").eq("user_id", id).maybeSingle(),
        supabase.from("documents").select("*").eq("user_id", id),
      ]);
      return { g, docs: docs ?? [] };
    },
  });
  const g = data?.g;
  if (!data) return <p className="text-muted-foreground">Loading…</p>;
  if (!g) return <p>Candidate not found.</p>;

  async function open(path: string) {
    const { data } = await supabase.storage.from("documents").createSignedUrl(path, 120);
    if (data) window.open(data.signedUrl, "_blank");
  }
  const rows: [string, unknown][] = [
    ["Institution", g.institution], ["Type", g.institution_type], ["Faculty", g.faculty], ["Course", g.course],
    ["Qualification", g.qualification], ["Class of degree", g.degree_class], ["CGPA", g.cgpa], ["Graduated", g.graduation_year],
    ["Age", ageFromDob(g.date_of_birth)], ["Gender", g.gender], ["State", g.state_of_residence], ["Preferred location", g.preferred_location],
    ["NYSC", g.nysc_status], ["Email", g.email], ["Phone", g.phone],
  ];
  return (
    <div className="space-y-6">
      <Link to="/search" className="flex items-center gap-1 text-sm text-primary"><ArrowLeft className="h-4 w-4" /> Back to search</Link>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{g.full_name}</h1>
          <div className="mt-2 flex gap-2">
            {g.degree_class && <Badge>{g.degree_class}</Badge>}
            <Badge variant="secondary">{g.available ? "Open to opportunities" : "Not looking"}</Badge>
          </div>
        </div>
        {emp && <InviteDialog employerId={emp.user_id} graduateIds={[g.user_id]} trigger={<Button variant="hero"><Send /> Invite</Button>} />}
      </div>
      {g.bio && <p className="max-w-2xl text-muted-foreground">{g.bio}</p>}
      <dl className="grid gap-x-6 gap-y-3 rounded-xl border bg-card p-6 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map(([k, v]) => (
          <div key={k}><dt className="text-xs uppercase tracking-wide text-muted-foreground">{k}</dt><dd className="font-medium">{v == null || v === "" ? "—" : String(v)}</dd></div>
        ))}
      </dl>
      {g.skills.length > 0 && <div className="flex flex-wrap gap-2">{g.skills.map((s) => <Badge key={s} variant="outline">{s}</Badge>)}</div>}
      <div className="rounded-xl border bg-card p-6">
        <h2 className="font-semibold">Certificates & documents</h2>
        <ul className="mt-3 divide-y">
          {data.docs.map((d) => (
            <li key={d.id}><button onClick={() => open(d.path)} className="flex w-full items-center gap-3 py-3 text-left"><FileText className="h-5 w-5 text-primary" /><span className="flex-1 text-sm font-medium">{d.name}</span><span className="text-xs text-muted-foreground">{d.kind}</span></button></li>
          ))}
          {data.docs.length === 0 && <li className="py-3 text-sm text-muted-foreground">No documents uploaded.</li>}
        </ul>
      </div>
    </div>
  );
}
