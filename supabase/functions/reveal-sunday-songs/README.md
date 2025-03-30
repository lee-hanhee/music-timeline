# Reveal Sunday Songs Edge Function

This Supabase Edge Function automatically reveals songs in the database every Sunday at 12 PM UTC.

## Purpose

The function supports the weekly song reveal functionality where:

- Songs are initially hidden (`revealed = false`) when added to the database
- On Sundays at 12 PM EST (5 PM UTC), songs are automatically revealed (`revealed = true`)
- Only revealed songs appear in the main timeline

## Implementation Details

- Uses Deno's CRON functionality with schedule: `0 17 * * 0` (every Sunday at 12 PM EST / 5 PM UTC)
- Connects to the Supabase database using the service role key
- Updates all songs where `revealed = false` to `revealed = true`
- Logs the number of songs revealed and handles errors

## Environment Variables

The function requires the following environment variables:

- `SUPABASE_URL`: The URL of your Supabase project
- `SUPABASE_SERVICE_ROLE_KEY`: The service role key for admin privileges

## Deployment

Deploy this function to your Supabase project:

```bash
supabase functions deploy reveal-sunday-songs --project-ref your-project-ref
```

## Testing

You can test this function locally using:

```bash
supabase functions serve reveal-sunday-songs --env-file .env.local --no-verify-jwt
```

## Monitoring

Monitor function execution in the Supabase Dashboard under:

- Edge Functions > reveal-sunday-songs > Invocations
- Logs are available in the function's logs tab
