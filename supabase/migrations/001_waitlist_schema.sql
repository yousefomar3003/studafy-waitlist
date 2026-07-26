-- Studafy waitlist schema.
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query).

-- Normalisation function
create or replace function public.normalize_school(p_school text)
returns text
language sql
immutable
strict
as $$
  select lower(btrim(regexp_replace(p_school, '\s+', ' ', 'g')))
$$;

-- Waitlist table
create table public.waitlist (
  id                uuid primary key default gen_random_uuid(),
  signup_no         bigint generated always as identity,
  school            text not null,
  school_normalized text generated always as (public.normalize_school(school)) stored,
  country           text not null,
  location          text not null,
  frameworks        text[] not null,
  phone             text not null,
  name              text,
  email             text,
  ip_hash           text,
  created_at        timestamptz not null default now(),

  constraint waitlist_school_len    check (char_length(btrim(school))   between 1 and 200),
  constraint waitlist_location_len check (char_length(btrim(location)) between 1 and 120),
  constraint waitlist_name_len     check (name is null or char_length(name) <= 120),
  constraint waitlist_email_ok     check (
    email is null or (
      char_length(email) <= 254
      and email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
    )
  ),
  constraint waitlist_phone_e164   check (phone ~ '^\+[1-9][0-9]{5,19}$'),
  constraint waitlist_frameworks_ok check (
    array_length(frameworks, 1) >= 1
    and frameworks <@ array[
      'Arabic National','IGCSE','IB','American / SAT','French','Other'
    ]::text[]
  ),
  constraint waitlist_country_ok check (
    country = any (array[
      'Argentina','Australia','Austria','Bahrain','Bangladesh',
      'Belgium','Brazil','Canada','Chile','China',
      'Colombia','Denmark','Egypt','Finland','France',
      'Germany','Ghana','Greece','India','Indonesia',
      'Ireland','Italy','Japan','Jordan','Kenya',
      'Kuwait','Lebanon','Malaysia','Mexico','Morocco',
      'Netherlands','New Zealand','Nigeria','Norway','Oman',
      'Pakistan','Peru','Philippines','Poland','Portugal',
      'Qatar','Romania','Saudi Arabia','Singapore','South Africa',
      'South Korea','Spain','Sweden','Switzerland','Thailand',
      'Tunisia','Turkey','United Arab Emirates','United Kingdom',
      'United States','Vietnam'
    ]::text[])
  )
);

comment on table  public.waitlist       is 'Studafy waitlist signups. Contains PII.';
comment on column public.waitlist.phone is 'PII: contact phone number, E.164.';
comment on column public.waitlist.email is 'PII: optional contact email.';
comment on column public.waitlist.name  is 'PII: optional contact name.';

create unique index waitlist_school_country_uniq
  on public.waitlist (school_normalized, country);

-- RLS — deny-all posture (anon can read/write nothing)
alter table public.waitlist enable row level security;
alter table public.waitlist force row level security;
