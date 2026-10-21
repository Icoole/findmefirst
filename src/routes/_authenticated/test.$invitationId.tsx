import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/test/$invitationId")({
  head: () => ({ meta: [{ title: "Assessment — Recruiter" }] }),
  component: TestPage,
});

type Q = { id: string; prompt: string; options: string[] };

function TestPage() {
  const { invitationId } = Route.useParams();
  const [stage, setStage] = useState<"intro" | "live" | "done">("intro");
  const [info, setInfo] = useState<{ title: string; description: string | null; duration_minutes: number } | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [qs, setQs] = useState<Q[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [left, setLeft] = useState(0);
  const [flags, setFlags] = useState(0);
  const [result, setResult] = useState<{ score: number; total: number } | null>(null);
  const submitted = useRef(false);

  useEffect(() => {
    supabase.from("invitations").select("assessments(title, description, duration_minutes)").eq("id", invitationId).maybeSingle()
      .then(({ data }) => data?.assessments && setInfo(data.assessments));
  }, [invitationId]);

  async function start() {
    const { data: id, error } = await supabase.rpc("start_attempt", { _invitation_id: invitationId });
    if (error || !id) return toast.error(error?.message ?? "Could not start");
    const { data: att } = await supabase.from("attempts").select("started_at, submitted_at").eq("id", id).single();
    if (att?.submitted_at) { setStage("done"); return; }
    const { data: q } = await supabase.rpc("get_attempt_questions", { _attempt_id: id });
    setQs((q ?? []).map((x) => ({ id: x.id, prompt: x.prompt, options: x.options as string[] })));
    const end = new Date(att!.started_at).getTime() + (info?.duration_minutes ?? 30) * 60000;
    setLeft(Math.max(0, Math.floor((end - Date.now()) / 1000)));
    setAttemptId(id);
    setStage("live");
    document.documentElement.requestFullscreen?.().catch(() => {});
  }

  async function submit() {
    if (!attemptId || submitted.current) return;
    submitted.current = true;
    const { data, error } = await supabase.rpc("submit_attempt", { _attempt_id: attemptId, _answers: answers });
    if (error) { submitted.current = false; return toast.error(error.message); }
    setResult({ score: data ?? 0, total: qs.length });
    setStage("done");
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  }

  // monitoring
  useEffect(() => {
    if (stage !== "live" || !attemptId) return;
    const log = (kind: string) => {
      setFlags((f) => f + 1);
      supabase.rpc("log_attempt_event", { _attempt_id: attemptId, _kind: kind });
    };
    const onVis = () => document.hidden && (log("tab_switch"), toast.warning("Leaving the test tab is recorded."));
    const onBlur = () => !document.hidden && log("tab_switch");
    const onCopy = (e: ClipboardEvent) => { e.preventDefault(); log(e.type); toast.warning("Copy/paste is disabled and recorded."); };
    const onCtx = (e: MouseEvent) => e.preventDefault();
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("blur", onBlur);
    document.addEventListener("copy", onCopy);
    document.addEventListener("paste", onCopy);
    document.addEventListener("contextmenu", onCtx);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("paste", onCopy);
      document.removeEventListener("contextmenu", onCtx);
    };
  }, [stage, attemptId]);

  // timer
  useEffect(() => {
    if (stage !== "live") return;
    if (left <= 0) { submit(); return; }
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  });

  if (stage === "done")
    return (
      <div className="mx-auto max-w-lg rounded-xl border bg-card p-8 text-center">
        <h1 className="text-2xl font-bold">Test submitted</h1>
        {result && <p className="mt-2 text-muted-foreground">You answered {result.score} of {result.total} correctly. The employer will review your result.</p>}
        <Button asChild className="mt-6"><Link to="/invitations">Back to invitations</Link></Button>
      </div>
    );

  if (stage === "intro")
    return (
      <div className="mx-auto max-w-lg rounded-xl border bg-card p-8">
        <h1 className="text-2xl font-bold">{info?.title ?? "Assessment"}</h1>
        {info?.description && <p className="mt-2 text-muted-foreground">{info.description}</p>}
        <ul className="mt-6 space-y-2 text-sm">
          <li className="flex gap-2"><Clock className="h-4 w-4 text-primary" /> {info?.duration_minutes ?? "—"} minutes. It submits automatically when time runs out.</li>
          <li className="flex gap-2"><AlertTriangle className="h-4 w-4 text-warning" /> This test is monitored. Switching tabs, leaving the window, copying or pasting are recorded and shared with the employer.</li>
        </ul>
        <Button variant="hero" size="lg" className="mt-8 w-full" onClick={start} disabled={!info}>I understand — start test</Button>
      </div>
    );

  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  return (
    <div className="mx-auto max-w-2xl select-none">
      <div className="sticky top-16 z-20 mb-6 flex items-center justify-between rounded-xl border bg-card p-4 shadow-elegant">
        <span className="font-semibold">{info?.title}</span>
        <div className="flex items-center gap-4 text-sm">
          {flags > 0 && <span className="text-destructive">{flags} flag{flags > 1 ? "s" : ""}</span>}
          <span className={`font-mono text-lg font-bold ${left < 60 ? "text-destructive" : "text-primary"}`}>{mm}:{ss}</span>
        </div>
      </div>
      <div className="space-y-5">
        {qs.map((q, i) => (
          <div key={q.id} className="rounded-xl border bg-card p-5">
            <p className="font-medium">{i + 1}. {q.prompt}</p>
            <div className="mt-3 space-y-2">
              {q.options.map((o, oi) => (
                <label key={oi} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm ${answers[q.id] === oi ? "border-primary bg-accent" : ""}`}>
                  <input type="radio" name={q.id} checked={answers[q.id] === oi} onChange={() => setAnswers((a) => ({ ...a, [q.id]: oi }))} />
                  {o}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      <Button size="lg" className="mt-6 w-full" onClick={submit}>Submit test ({Object.keys(answers).length}/{qs.length} answered)</Button>
    </div>
  );
}
