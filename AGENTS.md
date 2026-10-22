<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- Roles live in `public.user_roles`; users pick graduate/employer once via `set_my_role` RPC (admin is assigned manually). Why: prevents privilege escalation.
- Test answers (`questions.correct_index`) are never readable by graduates; tests run through security-definer RPCs (`start_attempt`, `get_attempt_questions`, `log_attempt_event`, `submit_attempt`). Why: server-side scoring and tamper-proof monitoring.
- Employers see graduates/documents only when `employers.approved`; a trigger blocks self-approval.
