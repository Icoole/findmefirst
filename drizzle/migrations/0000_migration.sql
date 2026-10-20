
create type public.app_role as enum ('admin','employer','graduate');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- employers
create table public.employers (
  user_id uuid primary key,
  company_name text not null default '',
  industry text,
  website text,
  address text,
  contact_name text,
  contact_phone text,
  rc_number text,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.employers to authenticated;
grant all on public.employers to service_role;
alter table public.employers enable row level security;

create or replace function public.is_approved_employer(_uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.employers where user_id = _uid and approved)
$$;

create policy "employer reads own" on public.employers for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'graduate'));
create policy "employer inserts own" on public.employers for insert to authenticated
  with check (user_id = auth.uid() and approved = false and public.has_role(auth.uid(),'employer'));
create policy "employer updates own" on public.employers for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "admin updates" on public.employers for update to authenticated
  using (public.has_role(auth.uid(),'admin'));

-- prevent employers self-approving
create or replace function public.guard_employer_approval()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.approved is distinct from old.approved and not public.has_role(auth.uid(),'admin') then
    new.approved := old.approved;
  end if;
  return new;
end $$;
create trigger trg_guard_employer before update on public.employers
  for each row execute function public.guard_employer_approval();

-- graduate profiles
create table public.graduate_profiles (
  user_id uuid primary key,
  full_name text not null default '',
  email text,
  phone text,
  date_of_birth date,
  gender text,
  state_of_residence text,
  preferred_location text,
  institution text,
  institution_type text,
  faculty text,
  course text,
  qualification text,
  degree_class text,
  cgpa numeric(3,2),
  graduation_year int,
  nysc_status text,
  skills text[] not null default '{}',
  bio text,
  available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.graduate_profiles to authenticated;
grant all on public.graduate_profiles to service_role;
alter table public.graduate_profiles enable row level security;
create policy "grad own" on public.graduate_profiles for select to authenticated
  using (user_id = auth.uid() or public.is_approved_employer(auth.uid()) or public.has_role(auth.uid(),'admin'));
create policy "grad insert own" on public.graduate_profiles for insert to authenticated
  with check (user_id = auth.uid() and public.has_role(auth.uid(),'graduate'));
create policy "grad update own" on public.graduate_profiles for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- documents
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  kind text not null,
  name text not null,
  path text not null,
  created_at timestamptz not null default now()
);
grant select, insert, delete on public.documents to authenticated;
grant all on public.documents to service_role;
alter table public.documents enable row level security;
create policy "docs read" on public.documents for select to authenticated
  using (user_id = auth.uid() or public.is_approved_employer(auth.uid()) or public.has_role(auth.uid(),'admin'));
create policy "docs insert" on public.documents for insert to authenticated with check (user_id = auth.uid());
create policy "docs delete" on public.documents for delete to authenticated using (user_id = auth.uid());

-- assessments
create table public.assessments (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null,
  title text not null,
  description text,
  duration_minutes int not null default 30,
  pass_mark int not null default 50,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.assessments to authenticated;
grant all on public.assessments to service_role;
alter table public.assessments enable row level security;

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  position int not null default 0,
  prompt text not null,
  options jsonb not null default '[]',
  correct_index int not null default 0
);
grant select, insert, update, delete on public.questions to authenticated;
grant all on public.questions to service_role;
alter table public.questions enable row level security;
create policy "q employer" on public.questions for all to authenticated
  using (exists (select 1 from public.assessments a where a.id = assessment_id and a.employer_id = auth.uid()))
  with check (exists (select 1 from public.assessments a where a.id = assessment_id and a.employer_id = auth.uid()));

-- invitations
create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null,
  graduate_id uuid not null,
  kind text not null default 'interview',
  title text not null,
  message text,
  assessment_id uuid references public.assessments(id) on delete set null,
  scheduled_at timestamptz,
  location text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);
grant select, insert, update on public.invitations to authenticated;
grant all on public.invitations to service_role;
alter table public.invitations enable row level security;
create policy "inv read" on public.invitations for select to authenticated
  using (employer_id = auth.uid() or graduate_id = auth.uid());
create policy "inv insert" on public.invitations for insert to authenticated
  with check (employer_id = auth.uid() and public.is_approved_employer(auth.uid()));
create policy "inv update" on public.invitations for update to authenticated
  using (employer_id = auth.uid() or graduate_id = auth.uid());

create policy "a employer" on public.assessments for all to authenticated
  using (employer_id = auth.uid()) with check (employer_id = auth.uid());
create policy "a invited read" on public.assessments for select to authenticated
  using (exists (select 1 from public.invitations i where i.assessment_id = id and i.graduate_id = auth.uid()));

-- attempts
create table public.attempts (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null unique references public.invitations(id) on delete cascade,
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  graduate_id uuid not null,
  employer_id uuid not null,
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  answers jsonb not null default '{}',
  score int,
  total int,
  tab_switches int not null default 0,
  copy_events int not null default 0,
  events jsonb not null default '[]'
);
grant select on public.attempts to authenticated;
grant all on public.attempts to service_role;
alter table public.attempts enable row level security;
create policy "att read" on public.attempts for select to authenticated
  using (graduate_id = auth.uid() or employer_id = auth.uid());

-- RPCs
create or replace function public.set_my_role(_role app_role)
returns void language plpgsql security definer set search_path = public as $$
begin
  if _role = 'admin' then raise exception 'not allowed'; end if;
  if exists (select 1 from user_roles where user_id = auth.uid()) then raise exception 'role already set'; end if;
  insert into user_roles(user_id, role) values (auth.uid(), _role);
  if _role = 'graduate' then
    insert into graduate_profiles(user_id, email) values (auth.uid(), (select email from auth.users where id = auth.uid()));
  else
    insert into employers(user_id) values (auth.uid());
  end if;
end $$;

create or replace function public.start_attempt(_invitation_id uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare inv invitations; att_id uuid;
begin
  select * into inv from invitations where id = _invitation_id and graduate_id = auth.uid();
  if inv.id is null or inv.assessment_id is null then raise exception 'invalid invitation'; end if;
  select id into att_id from attempts where invitation_id = _invitation_id;
  if att_id is not null then return att_id; end if;
  insert into attempts(invitation_id, assessment_id, graduate_id, employer_id)
    values (inv.id, inv.assessment_id, auth.uid(), inv.employer_id) returning id into att_id;
  update invitations set status = 'accepted' where id = inv.id and status = 'pending';
  return att_id;
end $$;

create or replace function public.get_attempt_questions(_attempt_id uuid)
returns table(id uuid, prompt text, options jsonb, q_position int) language sql stable security definer set search_path = public as $$
  select q.id, q.prompt, q.options, q.position from questions q
  join attempts a on a.assessment_id = q.assessment_id
  where a.id = _attempt_id and a.graduate_id = auth.uid() and a.submitted_at is null
  order by q.position
$$;

create or replace function public.log_attempt_event(_attempt_id uuid, _kind text)
returns void language plpgsql security definer set search_path = public as $$
begin
  update attempts set
    tab_switches = tab_switches + case when _kind = 'tab_switch' then 1 else 0 end,
    copy_events = copy_events + case when _kind in ('copy','paste') then 1 else 0 end,
    events = events || jsonb_build_array(jsonb_build_object('kind', _kind, 'at', now()))
  where id = _attempt_id and graduate_id = auth.uid() and submitted_at is null;
end $$;

create or replace function public.submit_attempt(_attempt_id uuid, _answers jsonb)
returns int language plpgsql security definer set search_path = public as $$
declare a attempts; s int; t int;
begin
  select * into a from attempts where id = _attempt_id and graduate_id = auth.uid();
  if a.id is null then raise exception 'not found'; end if;
  if a.submitted_at is not null then return a.score; end if;
  select count(*) filter (where (_answers ->> q.id::text)::int = q.correct_index), count(*)
    into s, t from questions q where q.assessment_id = a.assessment_id;
  update attempts set answers = _answers, score = s, total = t, submitted_at = now() where id = a.id;
  update invitations set status = 'completed' where id = a.invitation_id;
  return s;
end $$;

grant execute on function public.set_my_role, public.start_attempt, public.get_attempt_questions, public.log_attempt_event, public.submit_attempt to authenticated;

-- storage policies for 'documents' bucket
create policy "doc upload own" on storage.objects for insert to authenticated
  with check (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "doc read" on storage.objects for select to authenticated
  using (bucket_id = 'documents' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_approved_employer(auth.uid()) or public.has_role(auth.uid(),'admin')));
create policy "doc delete own" on storage.objects for delete to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);
