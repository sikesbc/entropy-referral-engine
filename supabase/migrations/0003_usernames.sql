truncate earnings, fills, attributions, sync_state, referral_codes, users;

alter table users add column username text not null check (username ~ '^[A-Za-z0-9_]{3,30}$');
create unique index users_username_lower on users (lower(username));

alter table referral_codes drop constraint referral_codes_code_check;
alter table referral_codes add constraint referral_codes_code_check check (code ~ '^[a-z0-9_]{3,30}$');
