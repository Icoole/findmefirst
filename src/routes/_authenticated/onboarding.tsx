import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { GraduationCap, Building2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({ meta: [{ title: "Choose account type — Recruiter" }] }),
  component: Onboarding,
});

function Onboarding() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  async function pick(role: "graduate" | "employer") {
    const { error } = await supabase.rpc("set_my_role", { _role: role });
    if (error) return toast.error(error.message);
    await qc.invalidateQueries({ queryKey: ["me"] });
    navigate({ to: role === "graduate" ? "/profile" : "/company" });
  }
  const opts = [
    { role: "graduate" as const, icon: GraduationCap, title: "I'm a graduate", body: "Build your academic profile, upload certificates and get invited by employers." },
    { role: "employer" as const, icon: Building2, title: "I'm an employer", body: "Search graduates by school, class of degree and age, then invite and test them." },
  ];
  return (
    <div className="mx-auto max-w-2xl text-center">
      <h1 className="text-3xl font-bold">Welcome to Recruiter</h1>
      <p className="mt-2 text-muted-foreground">How will you use the platform?</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {opts.map((o) => (
          <button key={o.role} onClick={() => pick(o.role)} className="rounded-xl border bg-card p-6 text-left transition hover:border-primary hover:shadow-elegant">
            <o.icon className="h-8 w-8 text-primary" />
            <h2 className="mt-4 text-xl font-semibold">{o.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{o.body}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
