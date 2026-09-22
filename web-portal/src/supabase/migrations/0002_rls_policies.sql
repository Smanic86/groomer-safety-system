-- =====================================================================
-- PHASE 1 / STEP 2: ROW LEVEL SECURITY (RLS) POLICIES
-- Target: Supabase (PostgreSQL 15+)
-- Scope: Enable RLS + business-scoped, role-aware policies for all tables.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0. HELPER FUNCTIONS
-- (security definer so they can read profiles without recursive RLS)
-- ---------------------------------------------------------------------

-- Returns the business_id of the currently logged-in user
create or replace function auth_business_id()
returns uuid
language sql
security definer
stable
as $$
    select business_id from profiles where id = auth.uid();
$$;

-- Returns the role of the currently logged-in user
create or replace function auth_role()
returns user_role
language sql
security definer
stable
as $$
    select role from profiles where id = auth.uid();
$$;

-- Convenience: true if current user is owner or manager
create or replace function auth_is_admin()
returns boolean
language sql
security definer
stable
as $$
    select auth_role() in ('owner', 'manager');
$$;

-- ---------------------------------------------------------------------
-- 1. ENABLE RLS ON ALL TABLES
-- ---------------------------------------------------------------------
alter table businesses enable row level security;
alter table profiles enable row level security;
alter table clients enable row level security;
alter table pets enable row level security;
alter table risk_assessments enable row level security;
alter table incident_reports enable row level security;

-- ---------------------------------------------------------------------
-- 2. BUSINESSES
-- Users can only see/update their own business. No inserts from client
-- (businesses are created via a signup server function in Phase 2).
-- ---------------------------------------------------------------------
create policy "businesses_select_own"
on businesses for select
using (id = auth_business_id());

create policy "businesses_update_own_admin"
on businesses for update
using (id = auth_business_id() and auth_is_admin());

-- ---------------------------------------------------------------------
-- 3. PROFILES
-- Everyone in a business can see their colleagues (needed for groomer
-- dropdowns etc). Only admins can change roles / deactivate staff.
-- Users can always update their own basic info (name, phone).
-- ---------------------------------------------------------------------
create policy "profiles_select_same_business"
on profiles for select
using (business_id = auth_business_id());

create policy "profiles_update_self"
on profiles for update
using (id = auth.uid())
with check (id = auth.uid());

create policy "profiles_update_admin"
on profiles for update
using (business_id = auth_business_id() and auth_is_admin());

create policy "profiles_insert_admin"
on profiles for insert
with check (business_id = auth_business_id() and auth_is_admin());

create policy "profiles_delete_admin"
on profiles for delete
using (business_id = auth_business_id() and auth_is_admin());

-- ---------------------------------------------------------------------
-- 4. CLIENTS
-- All staff (groomer/manager/owner) can view + create clients.
-- Only admins can delete.
-- ---------------------------------------------------------------------
create policy "clients_select_same_business"
on clients for select
using (business_id = auth_business_id());

create policy "clients_insert_same_business"
on clients for insert
with check (business_id = auth_business_id());

create policy "clients_update_same_business"
on clients for update
using (business_id = auth_business_id());

create policy "clients_delete_admin"
on clients for delete
using (business_id = auth_business_id() and auth_is_admin());

-- ---------------------------------------------------------------------
-- 5. PETS
-- Same pattern as clients: all staff read/write, only admins delete.
-- ---------------------------------------------------------------------
create policy "pets_select_same_business"
on pets for select
using (business_id = auth_business_id());

create policy "pets_insert_same_business"
on pets for insert
with check (business_id = auth_business_id());

create policy "pets_update_same_business"
on pets for update
using (business_id = auth_business_id());

create policy "pets_delete_admin"
on pets for delete
using (business_id = auth_business_id() and auth_is_admin());

-- ---------------------------------------------------------------------
-- 6. RISK ASSESSMENTS
-- All staff can read + create (groomers fill these out pre-groom).
-- Only the groomer who created it, or an admin, can edit/delete.
-- ---------------------------------------------------------------------
create policy "risk_assessments_select_same_business"
on risk_assessments for select
using (business_id = auth_business_id());

create policy "risk_assessments_insert_same_business"
on risk_assessments for insert
with check (business_id = auth_business_id() and groomer_id = auth.uid());

create policy "risk_assessments_update_own_or_admin"
on risk_assessments for update
using (
    business_id = auth_business_id()
    and (groomer_id = auth.uid() or auth_is_admin())
);

create policy "risk_assessments_delete_admin"
on risk_assessments for delete
using (business_id = auth_business_id() and auth_is_admin());

-- ---------------------------------------------------------------------
-- 7. INCIDENT REPORTS
-- All staff can read + create. Only the reporting groomer or an admin
-- can edit. Deletes restricted to admins (insurance/audit trail).
-- ---------------------------------------------------------------------
create policy "incident_reports_select_same_business"
on incident_reports for select
using (business_id = auth_business_id());

create policy "incident_reports_insert_same_business"
on incident_reports for insert
with check (business_id = auth_business_id() and groomer_id = auth.uid());

create policy "incident_reports_update_own_or_admin"
on incident_reports for update
using (
    business_id = auth_business_id()
    and (groomer_id = auth.uid() or auth_is_admin())
);

create policy "incident_reports_delete_admin"
on incident_reports for delete
using (business_id = auth_business_id() and auth_is_admin());