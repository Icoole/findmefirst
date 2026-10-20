drop policy "a invited read" on public.assessments;
create policy "a invited read" on public.assessments for select to authenticated
  using (exists (select 1 from public.invitations i where i.assessment_id = assessments.id and i.graduate_id = auth.uid()));