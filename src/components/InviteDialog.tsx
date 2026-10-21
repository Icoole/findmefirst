import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, PickOne } from "@/components/Field";

export function InviteDialog({ employerId, graduateIds, trigger, onSent }: { employerId: string; graduateIds: string[]; trigger: React.ReactNode; onSent?: () => void }) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState("Interview");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [when, setWhen] = useState("");
  const [location, setLocation] = useState("");
  const [assessment, setAssessment] = useState<string>("");
  const { data: tests = [] } = useQuery({
    queryKey: ["assessments", employerId],
    queryFn: async () => (await supabase.from("assessments").select("id, title").eq("employer_id", employerId)).data ?? [],
  });

  async function send() {
    const isTest = kind === "Assessment";
    const testId = tests.find((t) => t.title === assessment)?.id ?? null;
    if (!title) return toast.error("Add a title");
    if (isTest && !testId) return toast.error("Choose a test");
    const rows = graduateIds.map((g) => ({
      employer_id: employerId, graduate_id: g, kind: isTest ? "assessment" : "interview", title, message,
      scheduled_at: when ? new Date(when).toISOString() : null, location: location || null, assessment_id: isTest ? testId : null,
    }));
    const { error } = await supabase.from("invitations").insert(rows);
    if (error) return toast.error(error.message);
    toast.success(`Invitation sent to ${graduateIds.length} candidate${graduateIds.length > 1 ? "s" : ""}`);
    setOpen(false);
    onSent?.();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Invite {graduateIds.length} candidate{graduateIds.length > 1 ? "s" : ""}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <Field label="Type"><PickOne value={kind} onChange={setKind} options={["Interview", "Assessment"]} /></Field>
          {kind === "Assessment" && (
            <Field label="Test">{tests.length ? <PickOne value={assessment} onChange={setAssessment} options={tests.map((t) => t.title)} /> : <p className="text-sm text-muted-foreground">Create a test first under “Tests”.</p>}</Field>
          )}
          <Field label="Title"><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Graduate Trainee 2026" /></Field>
          <Field label="Message"><Textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} /></Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={kind === "Assessment" ? "Deadline" : "Date & time"}><Input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} /></Field>
            {kind === "Interview" && <Field label="Location / link"><Input value={location} onChange={(e) => setLocation(e.target.value)} /></Field>}
          </div>
          <Button className="w-full" onClick={send}>Send invitation</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
