import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Role = "admin" | "employer" | "graduate";

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const user = u.user;
      if (!user) return { user: null, roles: [] as Role[] };
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      return { user, roles: (data ?? []).map((r) => r.role as Role) };
    },
  });
}
