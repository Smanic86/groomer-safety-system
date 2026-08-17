-- =====================================================================
-- PHASE 1 / STEP 1: CORE DATABASE SCHEMA
-- Target: Supabase (PostgreSQL 15+)
-- Scope: Tables, Enums, FKs, updated_at triggers. NO RLS yet (next step).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0. EXTENSIONS
-- ---------------------------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- 1. ENUM TYPES
-- ---------------------------------------------------------------------
create type user_role as enum ('owner', 'manager', 'groomer');
create type temperament_level as enum ('calm', 'nervous', 'reactive', 'aggressive', 'unknown');
create type risk_level as enum ('low', 'moderate', 'high', 'extreme');
create type incident_severity as enum ('minor', 'moderate', 'severe', 'critical');

-- ---------------------------------------------------------------------
-- 2. BUSINESSES (multi-tenant root — required for RBAC scoping later)
-- ---------------------------------------------------------------------
create table businesses (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    address text,
    phone text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 3. PROFILES (extends auth.users — 1:1)
-- ---------------------------------------------------------------------
create table profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    business_id uuid not null references businesses(id) on delete cascade,
    full_name text not null,
    role user_role not null default 'groomer',
    phone text,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index idx_profiles_business_id on profiles(business_id);
create index idx_profiles_role on profiles(role);

-- ---------------------------------------------------------------------
-- 4. CLIENTS (pet owners)
-- ---------------------------------------------------------------------
create table clients (
    id uuid primary key default gen_random_uuid(),
    business_id uuid not null references businesses(id) on delete cascade,
    full_name text not null,
    email text,
    phone text,
    address text,
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index idx_clients_business_id on clients(business_id);

-- ---------------------------------------------------------------------
-- 5. PETS
-- ---------------------------------------------------------------------
create table pets (
    id uuid primary key default gen_random_uuid(),
    business_id uuid not null references businesses(id) on delete cascade,
    client_id uuid not null references clients(id) on delete cascade,
    name text not null,
    breed text,
    date_of_birth date,
    weight_kg numeric(5,2),
    temperament_rating temperament_level not null default 'unknown',
    trigger_flags text[] not null default '{}',
    photo_url text,
    vet_notes text,
    is_archived boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index idx_pets_business_id on pets(business_id);
create index idx_pets_client_id on pets(client_id);
create index idx_pets_trigger_flags on pets using gin(trigger_flags);

-- ---------------------------------------------------------------------
-- 6. RISK ASSESSMENTS (pre-groom checklist)
-- ---------------------------------------------------------------------
create table risk_assessments (
    id uuid primary key default gen_random_uuid(),
    business_id uuid not null references businesses(id) on delete cascade,
    pet_id uuid not null references pets(id) on delete cascade,
    groomer_id uuid not null references profiles(id) on delete set null,
    assessment_date timestamptz not null default now(),

    is_muzzle_required boolean not null default false,
    reacts_to_handling boolean not null default false,
    reacts_to_dryer boolean not null default false,
    reacts_to_nail_trim boolean not null default false,
    reacts_to_ears boolean not null default false,
    shows_resource_guarding boolean not null default false,
    requires_two_person_handling boolean not null default false,

    checklist_extra jsonb not null default '{}'::jsonb,
    overall_risk_level risk_level not null default 'low',
    notes text,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index idx_risk_assessments_pet_id on risk_assessments(pet_id);
create index idx_risk_assessments_business_id on risk_assessments(business_id);
create index idx_risk_assessments_groomer_id on risk_assessments(groomer_id);

-- ---------------------------------------------------------------------
-- 7. INCIDENT REPORTS
-- ---------------------------------------------------------------------
create table incident_reports (
    id uuid primary key default gen_random_uuid(),
    business_id uuid not null references businesses(id) on delete cascade,
    pet_id uuid not null references pets(id) on delete cascade,
    groomer_id uuid not null references profiles(id) on delete set null,
    risk_assessment_id uuid references risk_assessments(id) on delete set null,

    incident_date timestamptz not null default now(),
    severity incident_severity not null,
    bite_occurred boolean not null default false,
    bite_location text,
    required_medical_attention boolean not null default false,

    description text not null,
    witness_names text[] default '{}',
    image_urls text[] not null default '{}',

    is_insurance_reported boolean not null default false,
    insurance_claim_ref text,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index idx_incident_reports_pet_id on incident_reports(pet_id);
create index idx_incident_reports_business_id on incident_reports(business_id);
create index idx_incident_reports_groomer_id on incident_reports(groomer_id);
create index idx_incident_reports_severity on incident_reports(severity);

-- ---------------------------------------------------------------------
-- 8. AUTO updated_at TRIGGER FUNCTION + BINDINGS
-- ---------------------------------------------------------------------
create or replace function trigger_set_timestamp()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger set_timestamp_businesses
before update on businesses
for each row execute function trigger_set_timestamp();

create trigger set_timestamp_profiles
before update on profiles
for each row execute function trigger_set_timestamp();

create trigger set_timestamp_clients
before update on clients
for each row execute function trigger_set_timestamp();

create trigger set_timestamp_pets
before update on pets
for each row execute function trigger_set_timestamp();

create trigger set_timestamp_risk_assessments
before update on risk_assessments
for each row execute function trigger_set_timestamp();

create trigger set_timestamp_incident_reports
before update on incident_reports
for each row execute function trigger_set_timestamp();