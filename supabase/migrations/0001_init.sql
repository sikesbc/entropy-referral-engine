create extension if not exists pg_cron;
create extension if not exists pg_net;

create table users (
  address text primary key check (address ~ '^0x[0-9a-f]{40}$'),
  signer_address text not null check (signer_address ~ '^0x[0-9a-f]{40}$'),
  privy_user_id text not null unique,
  signup_code text,
  signup_outcome text not null check (signup_outcome in ('attributed', 'no_code', 'unknown_code', 'self_referral', 'existing_trader')),
  created_at timestamptz not null default now()
);

create table referral_codes (
  code text primary key check (code ~ '^[a-z]+-[a-z]+-[0-9]{1,3}$'),
  address text not null references users (address),
  is_current boolean not null default true,
  created_at timestamptz not null default now()
);

create unique index referral_codes_one_current on referral_codes (address) where is_current;

create table attributions (
  referee text primary key references users (address),
  referrer text not null references users (address),
  code text not null references referral_codes (code),
  attributed_at timestamptz not null default now(),
  check (referee <> referrer)
);

create index attributions_referrer on attributions (referrer);

create table fills (
  address text not null references users (address),
  tid bigint not null,
  trader_address text not null,
  coin text not null,
  time timestamptz not null,
  px numeric not null,
  sz numeric not null,
  side text not null,
  fee numeric not null,
  builder_fee numeric not null default 0,
  fee_token text not null,
  hash text,
  source text not null check (source in ('hyperliquid', 'simulated')),
  inserted_at timestamptz not null default now(),
  primary key (address, tid)
);

create table earnings (
  referee text not null,
  tid bigint not null,
  referrer text not null references users (address),
  net_fee numeric not null,
  deployer_share numeric not null,
  referrer_rate numeric not null,
  entropy_earned numeric not null,
  referrer_earned numeric not null check (referrer_earned >= 0),
  created_at timestamptz not null default now(),
  primary key (referee, tid),
  foreign key (referee, tid) references fills (address, tid)
);

create index earnings_referrer on earnings (referrer);

create table sync_state (
  address text primary key references users (address),
  cursor_ms bigint not null,
  last_synced_at timestamptz,
  gap_suspected boolean not null default false,
  last_error text
);

create table program_config (
  id boolean primary key default true check (id),
  referrer_rate numeric not null default 0.5,
  deployer_fee_scale numeric not null default 1.0,
  updated_at timestamptz not null default now()
);

insert into program_config default values;

alter table users enable row level security;
alter table referral_codes enable row level security;
alter table attributions enable row level security;
alter table fills enable row level security;
alter table earnings enable row level security;
alter table sync_state enable row level security;
alter table program_config enable row level security;
