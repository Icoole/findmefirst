import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, FileCheck2, MonitorCheck, Send, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Findme — Connect Nigerian graduates with employers" },
      { name: "description", content: "Graduates list their school, degree class and certificates. Employers filter by school, class of degree and age, invite candidates and run monitored job tests." },
      { property: "og:title", content: "Findme — Graduate recruitment & assessment" },
      { property: "og:description", content: "Search, shortlist, invite and test Nigerian graduates — no job post needed." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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
      <header className="border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/"><Logo className="h-9" /></Link>
          <Button asChild><Link to="/auth">Sign in</Link></Button>
        </div>
      </header>
      <section className="relative overflow-hidden bg-hero text-primary-foreground">
        <div className="hero-glow pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pb-20 pt-14 md:grid-cols-2 md:pb-28">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/25 bg-primary-foreground/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-highlight">
              Graduate talent, sorted
            </p>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] md:text-6xl">
              Skip the job board. Find the graduate, invite them, test them.
            </h1>
            <p className="mt-6 max-w-lg text-lg text-primary-foreground/80">
              Graduates fill in their school and degree details once. Employers filter by school, class of degree and age — then invite and test the best.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild variant="hero" size="lg" className="group">
                <Link to="/auth">I'm a graduate <ArrowRight className="transition-transform group-hover:translate-x-0.5" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                <Link to="/auth">I'm hiring</Link>
              </Button>
            </div>
          </div>
          <img src={hero} alt="Nigerian graduates" width={1280} height={960} className="rounded-2xl shadow-elegant ring-1 ring-primary-foreground/15" />
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="max-w-2xl text-3xl font-bold md:text-4xl">Not another social network. A shortlist machine.</h2>
        <p className="mt-3 max-w-xl text-muted-foreground">Everything you need between "I need to hire" and "when can you start".</p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border bg-card p-6 transition hover:-translate-y-0.5 hover:shadow-elegant">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-secondary">
                <f.icon className="h-6 w-6 text-primary" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">© {new Date().getFullYear()} Findme</footer>
    </div>
  );
}
