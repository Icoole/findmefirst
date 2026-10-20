import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FileText, Trash2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useMe } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Field, PickOne } from "@/components/Field";
import { DEGREE_CLASSES, DOC_KINDS, INSTITUTION_TYPES, NG_STATES, NYSC_STATUS, QUALIFICATIONS } from "@/lib/constants";

type Profile = Database["public"]["Tables"]["graduate_profiles"]["Row"];

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "My profile — Recruiter" }] }),
  component: ProfilePage,
});

const REQUIRED: (keyof Profile)[] = ["full_name", "phone", "date_of_birth", "state_of_residence", "institution", "institution_type", "course", "qualification", "degree_class", "graduation_year"];

function ProfilePage() {
  const { data: me } = useMe();
  const uid = me?.user?.id;
  const qc = useQueryClient();
  const { data: profile } = useQuery({
    queryKey: ["grad", uid],
    enabled: !!uid,
    queryFn: async () => (await supabase.from("graduate_profiles").select("*").eq("user_id", uid!).maybeSingle()).data,
  });
  const [p, setP] = useState<Partial<Profile>>({});
  const [skills, setSkills] = useState("");
  useEffect(() => {
    if (profile) { setP(profile); setSkills(profile.skills.join(", ")); }
  }, [profile]);

  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => setP((s) => ({ ...s, [k]: v }));
  const done = REQUIRED.filter((k) => p[k] !== null && p[k] !== undefined && p[k] !== "").length;
  const pct = Math.round((done / REQUIRED.length) * 100);

  async function save() {
    const { user_id: _u, created_at: _c, ...rest } = p as Profile;
    const { error } = await supabase.from("graduate_profiles").update({
      ...rest,
      skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
      updated_at: new Date().toISOString(),
    }).eq("user_id", uid!);
    if (error) return toast.error(error.message);
    toast.success("Profile saved");
    qc.invalidateQueries({ queryKey: ["grad", uid] });
  }

  if (!profile) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My profile</h1>
          <p className="text-muted-foreground">Employers find you by these details. Keep them accurate.</p>
        </div>
        <div className="w-56">
          <p className="mb-1 text-sm font-medium">Profile {pct}% complete</p>
          <Progress value={pct} />
        </div>
      </div>

      <Section title="Personal details">
        <Field label="Full name"><Input value={p.full_name ?? ""} onChange={(e) => set("full_name", e.target.value)} /></Field>
        <Field label="Phone"><Input value={p.phone ?? ""} onChange={(e) => set("phone", e.target.value)} placeholder="080..." /></Field>
        <Field label="Date of birth"><Input type="date" value={p.date_of_birth ?? ""} onChange={(e) => set("date_of_birth", e.target.value || null)} /></Field>
        <Field label="Gender"><PickOne value={p.gender} onChange={(v) => set("gender", v)} options={["Female", "Male", "Prefer not to say"]} /></Field>
        <Field label="State of residence"><PickOne value={p.state_of_residence} onChange={(v) => set("state_of_residence", v)} options={NG_STATES} /></Field>
        <Field label="Preferred work location"><PickOne value={p.preferred_location} onChange={(v) => set("preferred_location", v)} options={["Anywhere", "Remote", ...NG_STATES]} /></Field>
      </Section>

      <Section title="School & degree">
        <Field label="Institution"><Input value={p.institution ?? ""} onChange={(e) => set("institution", e.target.value)} placeholder="e.g. University of Lagos" /></Field>
        <Field label="Institution type"><PickOne value={p.institution_type} onChange={(v) => set("institution_type", v)} options={INSTITUTION_TYPES} /></Field>
        <Field label="Faculty"><Input value={p.faculty ?? ""} onChange={(e) => set("faculty", e.target.value)} /></Field>
        <Field label="Course of study"><Input value={p.course ?? ""} onChange={(e) => set("course", e.target.value)} placeholder="e.g. Computer Science" /></Field>
        <Field label="Qualification"><PickOne value={p.qualification} onChange={(v) => set("qualification", v)} options={QUALIFICATIONS} /></Field>
        <Field label="Class of degree"><PickOne value={p.degree_class} onChange={(v) => set("degree_class", v)} options={DEGREE_CLASSES} /></Field>
        <Field label="CGPA"><Input type="number" step="0.01" min={0} max={5} value={p.cgpa ?? ""} onChange={(e) => set("cgpa", e.target.value ? Number(e.target.value) : null)} /></Field>
        <Field label="Year of graduation"><Input type="number" min={1980} max={2035} value={p.graduation_year ?? ""} onChange={(e) => set("graduation_year", e.target.value ? Number(e.target.value) : null)} /></Field>
        <Field label="NYSC status"><PickOne value={p.nysc_status} onChange={(v) => set("nysc_status", v)} options={NYSC_STATUS} /></Field>
      </Section>

      <Section title="Skills & summary">
        <Field label="Skills (comma separated)"><Input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Excel, Python, Customer service" /></Field>
        <div className="flex items-center gap-3 pt-6"><Switch checked={p.available ?? true} onCheckedChange={(v) => set("available", v)} /><span className="text-sm">Open to opportunities</span></div>
        <div className="sm:col-span-2"><Field label="Short bio"><Textarea rows={4} value={p.bio ?? ""} onChange={(e) => set("bio", e.target.value)} /></Field></div>
      </Section>

      <Button size="lg" onClick={save}>Save profile</Button>

      {uid && <Documents uid={uid} />}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border bg-card p-6">
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
  );
}

function Documents({ uid }: { uid: string }) {
  const qc = useQueryClient();
  const [kind, setKind] = useState<string>(DOC_KINDS[0]);
  const [busy, setBusy] = useState(false);
  const { data: docs = [] } = useQuery({
    queryKey: ["docs", uid],
    queryFn: async () => (await supabase.from("documents").select("*").eq("user_id", uid).order("created_at", { ascending: false })).data ?? [],
  });

  async function upload(file: File) {
    setBusy(true);
    const path = `${uid}/${crypto.randomUUID()}-${file.name}`;
    const { error } = await supabase.storage.from("documents").upload(path, file);
    if (!error) await supabase.from("documents").insert({ user_id: uid, kind, name: file.name, path });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Uploaded");
    qc.invalidateQueries({ queryKey: ["docs", uid] });
  }
  async function remove(id: string, path: string) {
    await supabase.storage.from("documents").remove([path]);
    await supabase.from("documents").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["docs", uid] });
  }
  async function open(path: string) {
    const { data } = await supabase.storage.from("documents").createSignedUrl(path, 120);
    if (data) window.open(data.signedUrl, "_blank");
  }

  return (
    <section className="rounded-xl border bg-card p-6">
      <h2 className="text-lg font-semibold">Certificates & documents</h2>
      <p className="text-sm text-muted-foreground">PDF or image, up to 10MB. Visible only to approved employers.</p>
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div className="w-56"><PickOne value={kind} onChange={setKind} options={DOC_KINDS} /></div>
        <Button asChild variant="outline" disabled={busy}>
          <label className="cursor-pointer">
            <Upload /> {busy ? "Uploading…" : "Upload file"}
            <input type="file" className="hidden" accept=".pdf,image/*,.doc,.docx" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
          </label>
        </Button>
      </div>
      <ul className="mt-4 divide-y">
        {docs.map((d) => (
          <li key={d.id} className="flex items-center gap-3 py-3">
            <FileText className="h-5 w-5 text-primary" />
            <button onClick={() => open(d.path)} className="flex-1 text-left">
              <p className="text-sm font-medium">{d.name}</p>
              <p className="text-xs text-muted-foreground">{d.kind}</p>
            </button>
            <Button size="icon" variant="ghost" onClick={() => remove(d.id, d.path)} aria-label="Delete"><Trash2 /></Button>
          </li>
        ))}
        {docs.length === 0 && <li className="py-3 text-sm text-muted-foreground">No documents yet.</li>}
      </ul>
    </section>
  );
}
