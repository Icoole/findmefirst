import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMe } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/Field";

export const Route = createFileRoute("/_authenticated/assessments")({
  head: () => ({ meta: [{ title: "Tests — Findme" }] }),
  component: Assessments,
});

type DraftQ = { prompt: string; options: string[]; correct: number };
const blankQ = (): DraftQ => ({ prompt: "", options: ["", "", "", ""], correct: 0 });

function Assessments() {
  const { data: me } = useMe();
  const uid = me?.user?.id;
  const qc = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [duration, setDuration] = useState(30);
  const [pass, setPass] = useState(50);
  const [qs, setQs] = useState<DraftQ[]>([blankQ()]);

  const { data: list = [] } = useQuery({
    queryKey: ["assessments", uid],
    enabled: !!uid,
    queryFn: async () => (await supabase.from("assessments").select("*, questions(count)").eq("employer_id", uid!).order("created_at", { ascending: false })).data ?? [],
  });

  const upd = (i: number, patch: Partial<DraftQ>) => setQs((s) => s.map((q, j) => (j === i ? { ...q, ...patch } : q)));

  async function save() {
    const valid = qs.filter((q) => q.prompt && q.options.filter(Boolean).length >= 2);
    if (!title || !valid.length) return toast.error("Add a title and at least one question with 2+ options");
    const { data: a, error } = await supabase.from("assessments").insert({ employer_id: uid!, title, description: desc, duration_minutes: duration, pass_mark: pass }).select().single();
    if (error) return toast.error(error.message);
    const rows = valid.map((q, i) => {
      const opts = q.options.filter(Boolean);
      const correctText = q.options[q.correct] ?? "";
      return { assessment_id: a.id, position: i, prompt: q.prompt, options: opts, correct_index: Math.max(0, opts.indexOf(correctText)) };
    });
    const { error: e2 } = await supabase.from("questions").insert(rows);
    if (e2) return toast.error(e2.message);
    toast.success("Test created");
    setCreating(false); setTitle(""); setDesc(""); setQs([blankQ()]);
    qc.invalidateQueries({ queryKey: ["assessments"] });
  }

  async function remove(id: string) {
    await supabase.from("assessments").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["assessments"] });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tests</h1>
          <p className="text-muted-foreground">Timed, auto-marked multiple-choice tests with tab-switch and copy monitoring.</p>
        </div>
        {!creating && <Button onClick={() => setCreating(true)}><Plus /> New test</Button>}
      </div>

      {creating && (
        <div className="space-y-4 rounded-xl border bg-card p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title"><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Aptitude test" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Minutes"><Input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} /></Field>
              <Field label="Pass mark %"><Input type="number" value={pass} onChange={(e) => setPass(Number(e.target.value))} /></Field>
            </div>
            <div className="sm:col-span-2"><Field label="Instructions"><Textarea value={desc} onChange={(e) => setDesc(e.target.value)} /></Field></div>
          </div>
          {qs.map((q, i) => (
            <div key={i} className="space-y-2 rounded-lg border p-4">
              <div className="flex items-center justify-between"><span className="text-sm font-semibold">Question {i + 1}</span>
                {qs.length > 1 && <Button size="icon" variant="ghost" onClick={() => setQs(qs.filter((_, j) => j !== i))}><Trash2 /></Button>}
              </div>
              <Input value={q.prompt} onChange={(e) => upd(i, { prompt: e.target.value })} placeholder="Question" />
              {q.options.map((o, oi) => (
                <label key={oi} className="flex items-center gap-2">
                  <input type="radio" name={`c${i}`} checked={q.correct === oi} onChange={() => upd(i, { correct: oi })} aria-label="Correct answer" />
                  <Input value={o} onChange={(e) => upd(i, { options: q.options.map((x, k) => (k === oi ? e.target.value : x)) })} placeholder={`Option ${oi + 1}`} />
                </label>
              ))}
              <p className="text-xs text-muted-foreground">Select the circle next to the correct answer.</p>
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setQs([...qs, blankQ()])}><Plus /> Add question</Button>
            <Button onClick={save}>Save test</Button>
            <Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {list.map((a) => (
          <div key={a.id} className="rounded-xl border bg-card p-5">
            <div className="flex justify-between gap-2">
              <h2 className="font-semibold">{a.title}</h2>
              <Button size="icon" variant="ghost" onClick={() => remove(a.id)} aria-label="Delete"><Trash2 /></Button>
            </div>
            <p className="text-sm text-muted-foreground">{(a.questions as unknown as { count: number }[])[0]?.count ?? 0} questions · {a.duration_minutes} min · pass {a.pass_mark}%</p>
          </div>
        ))}
        {!creating && list.length === 0 && <p className="text-muted-foreground">No tests yet.</p>}
      </div>
    </div>
  );
}
