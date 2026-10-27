-- Lets the login screen tell "no account yet" apart from "wrong password".
--
-- Supabase Auth deliberately returns the same error for both. This trades a
-- little privacy (anyone can ask whether an email is registered) for a
-- clearer sign-in; drop the function to go back to the generic message.

create function public.account_exists(p_email text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from auth.users where lower(email) = lower(trim(p_email))
  )
$$;

revoke execute on function public.account_exists(text) from public;
grant execute on function public.account_exists(text) to anon, authenticated;
