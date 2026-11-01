create table email_subscriptions (
  address text primary key references users (address),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and length(email) <= 254),
  joined boolean not null default true,
  first_trade boolean not null default true,
  unlock boolean not null default true,
  boost boolean not null default true,
  weekly_only boolean not null default false,
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table email_events (
  address text not null references users (address),
  event_key text not null,
  kind text not null check (kind in ('joined', 'first_trade', 'unlock', 'boost', 'weekly')),
  delivery text not null check (delivery in ('immediate', 'batched', 'skipped')),
  payload jsonb not null default '{}',
  created_at timestamptz not null default now(),
  summarized_at timestamptz,
  primary key (address, event_key)
);

create index email_events_pending on email_events (address) where delivery = 'batched' and summarized_at is null;

create table email_outbox (
  id bigint generated always as identity primary key,
  address text references users (address),
  to_email text not null,
  kind text not null,
  subject text not null,
  html text not null,
  text text not null,
  status text not null check (status in ('sent', 'recorded', 'failed')),
  provider_id text,
  error text,
  created_at timestamptz not null default now()
);

alter table email_subscriptions enable row level security;
alter table email_events enable row level security;
alter table email_outbox enable row level security;
