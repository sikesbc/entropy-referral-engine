create table if not exists sync_lease (
  name text primary key,
  holder text,
  expires_at timestamptz not null default '-infinity'
);

insert into sync_lease (name) values ('entropy:sync-all') on conflict (name) do nothing;

alter table sync_lease enable row level security;

create index if not exists users_member_order on users (created_at, address) where not simulated;
create index if not exists fills_address_time on fills (address, time, tid);
create index if not exists attributions_attributed_at on attributions (attributed_at);
create index if not exists email_events_kind_key on email_events (kind, event_key);
create index if not exists referral_codes_address on referral_codes (address);
