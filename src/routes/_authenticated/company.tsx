import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useMe } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Field } from "@/components/Field";

type Emp = Database["public"]["Tables"]["employers"]["Row"];

export const Route = createFileRoute("/_authenticated/company")({
  head: () => ({ meta: [{ title: "Company profile — Findme" }] }),
  component: Company,
});

export function useEmployer() {
  const { data: me } = useMe();
  const uid = me?.user?.id;
  return useQuery({
    queryKey: ["employer", uid],
    enabled: !!uid,
    queryFn: async () => (await supabase.from("employers").select("*").eq("user_id", uid!).maybeSingle()).data,
  });
}

function Company() {
  const { data: emp } = useEmployer();
  const qc = useQueryClient();
  const [e, setE] = useState<Partial<Emp>>({});
  useEffect(() => { if (emp) setE(emp); }, [emp]);
  const set = (k: keyof Emp, v: string) => setE((s) => ({ ...s, [k]: v }));

  async function save() {
    const n = (v: string | null | undefined) => v ?? null;
    const { error } = await supabase.from("employers").update({ company_name: e.company_name ?? "", industry: n(e.industry), website: n(e.website), address: n(e.address), contact_name: n(e.contact_name), contact_phone: n(e.contact_phone), rc_number: n(e.rc_number) }).eq("user_id", emp!.user_id);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    qc.invalidateQueries({ queryKey: ["employer"] });
  }
  if (!emp) return <p className="text-muted-foreground">Loading…</p>;
  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold">Company profile</h1>
        <Badge variant={emp.approved ? "default" : "secondary"}>{emp.approved ? "Approved" : "Awaiting approval"}</Badge>
      </div>
      {!emp.approved && <p className="rounded-lg bg-accent p-4 text-sm text-accent-foreground">Fill in your company details. Our team verifies every employer before they can search graduates and send invites.</p>}
      <div className="grid gap-4 rounded-xl border bg-card p-6 sm:grid-cols-2">
        <Field label="Company name"><Input value={e.company_name ?? ""} onChange={(x) => set("company_name", x.target.value)} /></Field>
        <Field label="Industry"><Input value={e.industry ?? ""} onChange={(x) => set("industry", x.target.value)} /></Field>
        <Field label="CAC / RC number"><Input value={e.rc_number ?? ""} onChange={(x) => set("rc_number", x.target.value)} /></Field>
        <Field label="Website"><Input value={e.website ?? ""} onChange={(x) => set("website", x.target.value)} /></Field>
        <Field label="Contact person"><Input value={e.contact_name ?? ""} onChange={(x) => set("contact_name", x.target.value)} /></Field>
        <Field label="Contact phone"><Input value={e.contact_phone ?? ""} onChange={(x) => set("contact_phone", x.target.value)} /></Field>
        <div className="sm:col-span-2"><Field label="Office address"><Input value={e.address ?? ""} onChange={(x) => set("address", x.target.value)} /></Field></div>
      </div>
      <Button size="lg" onClick={save}>Save</Button>
    </div>
  );
}
