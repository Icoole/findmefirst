import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMe } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

const NAV = {
  graduate: [
    { to: "/profile", label: "My profile" },
    { to: "/invitations", label: "Invitations" },
  ],
  employer: [
    { to: "/search", label: "Find graduates" },
    { to: "/assessments", label: "Tests" },
    { to: "/results", label: "Invites & results" },
    { to: "/company", label: "Company" },
  ],
  admin: [{ to: "/admin", label: "Approve employers" }],
} as const;

export function AppShell() {
  const { data } = useMe();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const roles = data?.roles ?? [];
  const links = roles.flatMap((r) => NAV[r] ?? []);

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b bg-sidebar text-sidebar-foreground">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <Link to="/dashboard"><Logo /></Link>
          <nav className="flex flex-1 gap-1 overflow-x-auto">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="whitespace-nowrap rounded-md px-3 py-1.5 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent"
                activeProps={{ className: "bg-sidebar-accent text-sidebar-primary font-semibold" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <Button size="icon" variant="ghost" onClick={signOut} aria-label="Sign out" className="hover:bg-sidebar-accent hover:text-sidebar-foreground">
            <LogOut />
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
