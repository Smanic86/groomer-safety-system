-- =====================================================================
-- PHASE 2 / STEP 1: AUTH TRIGGER (AUTO-CREATE BUSINESS + PROFILE)
-- Target: Supabase (PostgreSQL 15+)
-- Scope: When a user signs up via Supabase Auth, automatically create
--        their business (if first user) and their profile row.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. FUNCTION: runs after a new row appears in auth.users
-- Expects signup to pass metadata:
--   { "business_name": "...", "full_name": "...", "role": "owner" }
-- If business_name is provided -> creates a new business (first user /
-- the owner signing up). If instead "business_id" is provided (staff
-- invited by an existing owner) -> attaches profile to that business.
-- ---------------------------------------------------------------------
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    new_business_id uuid;
    meta jsonb := new.raw_user_meta_data;
begin
    -- Case A: signing up as a brand-new business owner
    if meta ? 'business_name' then
        insert into businesses (name)
        values (meta->>'business_name')
        returning id into new_business_id;

        insert into profiles (id, business_id, full_name, role)
        values (
            new.id,
            new_business_id,
            coalesce(meta->>'full_name', new.email),
            'owner'
        );

    -- Case B: joining an existing business via invite (business_id + role passed)
    elsif meta ? 'business_id' then
        insert into profiles (id, business_id, full_name, role)
        values (
            new.id,
            (meta->>'business_id')::uuid,
            coalesce(meta->>'full_name', new.email),
            coalesce((meta->>'role')::user_role, 'groomer')
        );

    else
        raise exception 'Signup metadata must include business_name (new owner) or business_id (invited staff)';
    end if;

    return new;
end;
$$;

-- ---------------------------------------------------------------------
-- 2. TRIGGER: fires after every new auth.users row
-- ---------------------------------------------------------------------
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function handle_new_user();