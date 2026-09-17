# Supabase and Codex setup

The official Supabase plugin for Codex was installed from
`supabase-community/supabase-plugin` on 2026-09-18. The installer was invoked
with project scope, but the current Windows environment did not expose a Codex
binary on `PATH`; consequently the plugin cache and enabled entry were written
to the local Codex user configuration under `C:\Users\Jules\.codex`. No
repository secrets or generated runtime files were added.

It includes:

- the `supabase` Agent Skill;
- the `supabase-postgres-best-practices` Agent Skill;
- the Supabase MCP app integration.

The installer cached the plugin under the local Codex plugin directory and
enabled `supabase@plugins-cli` in the Codex configuration. Codex must be
restarted once after installation so the new app and skills are loaded into a
session. If the team later needs repository-versioned plugin configuration,
the installation should be repeated from an environment where the Codex
binary is discoverable and the generated project files should be reviewed
before committing them.

## MCP authentication and scope

The hosted MCP endpoint is:

`https://mcp.supabase.com/mcp?features=docs%2Caccount%2Cdatabase%2Cdebugging%2Cdevelopment%2Cfunctions%2Cbranching`

The endpoint was checked locally and returned HTTP `401`, which confirms that
the service is reachable and requires OAuth authentication. Supabase's hosted
MCP flow opens the browser for Supabase sign-in and organization authorization;
it does not require a personal access token for interactive use.

After restarting Codex, authenticate the Supabase connection if Codex presents
the OAuth prompt. Then verify access with an MCP read operation such as listing
projects or tables. The project must be scoped to the ChapterPrep Supabase
project before write operations are performed.

## Project application configuration

The application uses the publishable Supabase key in `.env.local`:

```text
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

The Gemini key belongs only in the Edge Function secret store as
`GEMINI_API_KEY`. It must never be placed in frontend environment variables or
committed to Git.

## Verification state

- Official Supabase plugin: installed locally and manifest verified; enabled
  in the local Codex configuration.
- Agent Skills: both bundled skill files verified locally.
- MCP network endpoint: reachable; unauthenticated response is HTTP `401`.
- Authenticated MCP tool call: pending Codex restart and OAuth authorization.
- Supabase project/database access: not claimed until an authenticated MCP
  query succeeds.

Once access is active, Supabase MCP is the preferred interface for project
inspection, SQL, migrations, RLS review, Edge Functions, logs and generated
types. Keep migration files in `supabase/migrations/` under version control and
run the relevant tests and advisors before merging schema changes.
