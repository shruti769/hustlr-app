-- HUSTLR pipeline schedule. Run once in the SQL Editor after deploying the
-- collect-listings and score-listings functions.
--
-- Before running, replace the two placeholders:
--   <PROJECT_REF>      e.g. cnsgjnukraycrxlkkdrc
--   <PIPELINE_SECRET>  the same value you set with
--                      `supabase secrets set PIPELINE_SECRET=...`
--
-- Safe to re-run: existing jobs and secrets are replaced.

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Keep the URL and secret in Vault rather than in the job text.
select vault.create_secret('https://<PROJECT_REF>.supabase.co', 'hustlr_project_url')
where not exists (select 1 from vault.secrets where name = 'hustlr_project_url');
select vault.create_secret('<PIPELINE_SECRET>', 'hustlr_pipeline_secret')
where not exists (select 1 from vault.secrets where name = 'hustlr_pipeline_secret');

create or replace function public._call_pipeline(fn text) returns bigint
language sql security definer set search_path = public as $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'hustlr_project_url') || '/functions/v1/' || fn,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-pipeline-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'hustlr_pipeline_secret')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 120000
  );
$$;
revoke execute on function public._call_pipeline(text) from public, anon, authenticated;

select cron.unschedule(jobname) from cron.job where jobname in ('hustlr-collect', 'hustlr-score', 'hustlr-track');

-- New listings every 5 minutes; the queue is worked through every minute.
select cron.schedule('hustlr-collect', '*/5 * * * *', $$ select public._call_pipeline('collect-listings') $$);
select cron.schedule('hustlr-score', '* * * * *', $$ select public._call_pipeline('score-listings') $$);
-- Watched items' prices every 30 minutes.
select cron.schedule('hustlr-track', '*/30 * * * *', $$ select public._call_pipeline('track-prices') $$);

-- To pause:   select cron.unschedule('hustlr-collect'); select cron.unschedule('hustlr-score');
-- Recent runs: select * from pipeline_runs order by id desc limit 20;
