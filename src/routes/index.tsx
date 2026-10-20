import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, FileCheck2, MonitorCheck, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Recruiter — Connect Nigerian graduates with employers" },
      { name: "description", content: "Graduates list their school, degree class and certificates. Employers filter by school, class of degree and age, invite candidates and run monitored job tests." },
      { property: "og:title", content: "Recruiter — Graduate recruitment & assessment" },
      { property: "og:description", content: "Search, shortlist, invite and test Nigerian graduates — no job post needed." },
    ],
  }),
  component: Index,
});

const features = [
  { icon: FileCheck2, title: "Verified academic profiles", body: "School, course, class of degree, graduation year and uploaded certificates in one place." },
  { icon: Search, title: "Filter what matters", body: "First Class or 2:1? Specific universities? Under 26? Filter the database in seconds." },
  { icon: Send, title: "Invite directly", body: "Send interview or assessment invites to candidates — no vacancy post required." },
  { icon: MonitorCheck, title: "Monitored job tests", body: "Timed online tests that flag tab switching and copy-paste so you can trust the results." },
];

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <section className="bg-hero text-primary-foreground">
        <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
          <Logo />
          <Button asChild variant="hero" size="sm"><Link to="/auth">Sign in</Link></Button>
        </header>
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-8 md:grid-cols-2 md:pb-24">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-highlight">Graduate talent, sorted</p>
            <h1 className="mt-3 text-4xl font-extrabold leading-tight md:text-6xl">Where Nigerian graduates meet the employers looking for them.</h1>
            <p className="mt-5 max-w-lg text-lg text-primary-foreground/80">
              Graduates fill in their school and degree details once. Employers filter by school, class of degree and age — then invite and test the best.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="hero" size="lg"><Link to="/auth">I'm a graduate</Link></Button>
              <Button asChild size="lg" variant="outline" className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                <Link to="/auth">I'm hiring</Link>
              </Button>
            </div>
          </div>
          <img src={hero} alt="Nigerian graduates" width={1280} height={960} className="rounded-2xl shadow-elegant" />
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="max-w-xl text-3xl font-bold">Not another social network. A shortlist machine.</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl border bg-card p-6">
              <f.icon className="h-7 w-7 text-primary" />
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">© {new Date().getFullYear()} Recruiter</footer>
    </div>
  );
}
