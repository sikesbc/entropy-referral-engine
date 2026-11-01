select cron.schedule(
  'sync-fills',
  '* * * * *',
  $$
  select net.http_post(
    url := 'https://SITE_URL/api/cron/sync-fills',
    headers := jsonb_build_object('Authorization', 'Bearer CRON_SECRET'),
    timeout_milliseconds := 55000
  );
  $$
);
