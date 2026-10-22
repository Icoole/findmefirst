import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useMe } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Findme" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { data, isLoading } = useMe();
  if (isLoading || !data) return <p className="text-muted-foreground">Loading…</p>;
  const r = data.roles;
  if (r.includes("admin")) return <Navigate to="/admin" replace />;
  if (r.includes("employer")) return <Navigate to="/search" replace />;
  if (r.includes("graduate")) return <Navigate to="/profile" replace />;
  return <Navigate to="/onboarding" replace />;
}
