create table market_programs (
  coin text primary key check (coin like 'io:%'),
  boost_rate numeric not null default 0.75 check (boost_rate >= 0 and boost_rate <= 1),
  boost_until timestamptz,
  updated_at timestamptz not null default now()
);

create table market_unlocks (
  address text not null references users (address),
  coin text not null check (coin like 'io:%'),
  unlocked_at timestamptz not null default now(),
  primary key (address, coin)
);

alter table market_programs enable row level security;
alter table market_unlocks enable row level security;
