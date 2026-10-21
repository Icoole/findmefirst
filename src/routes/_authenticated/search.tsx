import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Send, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Field, PickOne } from "@/components/Field";
import { InviteDialog } from "@/components/InviteDialog";
import { useEmployer } from "./company";
import { DEGREE_CLASSES, INSTITUTION_TYPES, NG_STATES, ageFromDob, dobForAge } from "@/lib/constants";

export const Route = createFileRoute("/_authenticated/search")({
  head: () => ({ meta: [{ title: "Find graduates — Recruiter" }] }),
  component: SearchPage,
});

type F = { institution: string; type: string; course: string; classes: string[]; minAge: string; maxAge: string; yearFrom: string; yearTo: string; state: string; minCgpa: string; skill: string };
const EMPTY: F = { institution: "", type: "", course: "", classes: [], minAge: "", maxAge: "", yearFrom: "", yearTo: "", state: "", minCgpa: "", skill: "" };

function SearchPage() {
  const { data: emp } = useEmployer();
  const [f, setF] = useState<F>(EMPTY);
  const [selected, setSelected] = useState<string[]>([]);
  const set = (k: keyof F, v: string) => setF((s) => ({ ...s, [k]: v }));

  const { data: results = [], isFetching } = useQuery({
    queryKey: ["search", f],
    enabled: !!emp?.approved,
    queryFn: async () => {
      let q = supabase.from("graduate_profiles").select("*").neq("full_name", "").order("updated_at", { ascending: false }).limit(200);
      if (f.institution) q = q.ilike("institution", `%${f.institution}%`);
      if (f.course) q = q.ilike("course", `%${f.course}%`);
      if (f.type) q = q.eq("institution_type", f.type);
      if (f.classes.length) q = q.in("degree_class", f.classes);
      if (f.state) q = q.eq("state_of_residence", f.state);
      if (f.yearFrom) q = q.gte("graduation_year", Number(f.yearFrom));
      if (f.yearTo) q = q.lte("graduation_year", Number(f.yearTo));
      if (f.minCgpa) q = q.gte("cgpa", Number(f.minCgpa));
      if (f.skill) q = q.contains("skills", [f.skill]);
      if (f.maxAge) q = q.gt("date_of_birth", dobForAge(Number(f.maxAge) + 1));
      if (f.minAge) q = q.lte("date_of_birth", dobForAge(Number(f.minAge)));
      return (await q).data ?? [];
    },
  });

  if (emp && !emp.approved)
    return (
      <div className="mx-auto max-w-lg rounded-xl border bg-card p-8 text-center">
        <h1 className="text-2xl font-bold">Awaiting verification</h1>
        <p className="mt-2 text-muted-foreground">Your company must be approved before you can search graduates. Make sure your company profile is complete.</p>
        <Button asChild className="mt-6"><Link to="/company">Complete company profile</Link></Button>
      </div>
    );

  const toggleClass = (c: string) => setF((s) => ({ ...s, classes: s.classes.includes(c) ? s.classes.filter((x) => x !== c) : [...s.classes, c] }));
  const toggleSel = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      <aside className="h-fit space-y-4 rounded-xl border bg-card p-5 lg:sticky lg:top-20">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Filters</h2>
          <button className="text-xs text-primary" onClick={() => setF(EMPTY)}>Clear</button>
        </div>
        <div>
          <p className="mb-2 text-sm font-medium">Class of degree</p>
          <div className="space-y-2">
            {DEGREE_CLASSES.slice(0, 5).map((c) => (
              <label key={c} className="flex items-center gap-2 text-sm"><Checkbox checked={f.classes.includes(c)} onCheckedChange={() => toggleClass(c)} />{c}</label>
            ))}
          </div>
        </div>
        <Field label="School"><Input value={f.institution} onChange={(e) => set("institution", e.target.value)} placeholder="e.g. Covenant" /></Field>
        <Field label="Institution type"><PickOne value={f.type} onChange={(v) => set("type", v)} options={INSTITUTION_TYPES} placeholder="Any" /></Field>
        <Field label="Course"><Input value={f.course} onChange={(e) => set("course", e.target.value)} /></Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Min age"><Input type="number" value={f.minAge} onChange={(e) => set("minAge", e.target.value)} /></Field>
          <Field label="Max age"><Input type="number" value={f.maxAge} onChange={(e) => set("maxAge", e.target.value)} /></Field>
          <Field label="Grad. from"><Input type="number" value={f.yearFrom} onChange={(e) => set("yearFrom", e.target.value)} /></Field>
          <Field label="Grad. to"><Input type="number" value={f.yearTo} onChange={(e) => set("yearTo", e.target.value)} /></Field>
        </div>
        <Field label="Min CGPA"><Input type="number" step="0.1" value={f.minCgpa} onChange={(e) => set("minCgpa", e.target.value)} /></Field>
        <Field label="State of residence"><PickOne value={f.state} onChange={(v) => set("state", v)} options={NG_STATES} placeholder="Any" /></Field>
        <Field label="Skill (exact)"><Input value={f.skill} onChange={(e) => set("skill", e.target.value)} /></Field>
      </aside>

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Graduates</h1>
            <p className="text-sm text-muted-foreground">{isFetching ? "Searching…" : `${results.length} match${results.length === 1 ? "" : "es"}`}</p>
          </div>
          {selected.length > 0 && emp && (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setSelected([])}><X /> Clear</Button>
              <InviteDialog employerId={emp.user_id} graduateIds={selected} onSent={() => setSelected([])} trigger={<Button variant="hero"><Send /> Invite {selected.length}</Button>} />
            </div>
          )}
        </div>
        <div className="space-y-3">
          {results.map((g) => (
            <div key={g.user_id} className="flex gap-4 rounded-xl border bg-card p-4">
              <Checkbox className="mt-1" checked={selected.includes(g.user_id)} onCheckedChange={() => toggleSel(g.user_id)} aria-label="Select" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link to="/candidates/$id" params={{ id: g.user_id }} className="font-semibold hover:text-primary">{g.full_name}</Link>
                  {g.degree_class && <Badge variant={g.degree_class === "First Class" ? "default" : "secondary"}>{g.degree_class}</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">{[g.qualification, g.course].filter(Boolean).join(" ")} · {g.institution} {g.graduation_year && `· ${g.graduation_year}`}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {[ageFromDob(g.date_of_birth) != null && `${ageFromDob(g.date_of_birth)} yrs`, g.cgpa && `CGPA ${g.cgpa}`, g.state_of_residence, g.nysc_status && `NYSC: ${g.nysc_status}`].filter(Boolean).join(" · ")}
                </p>
              </div>
            </div>
          ))}
          {!isFetching && results.length === 0 && <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">No graduates match these filters.</div>}
        </div>
      </section>
    </div>
  );
}
