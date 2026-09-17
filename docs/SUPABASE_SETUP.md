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

The two Supabase plugin mentions can load the bundled Skills, but they do not
prove that the MCP connection is available in the current chat. A chat is
verified only when it exposes and successfully executes a read-only MCP
operation such as `list_projects` or `list_organizations`.

For the next chat, include one Supabase plugin mention and send:

```text
Use Supabase MCP. Verify the OAuth connection and list my organizations and
projects. Do not create or modify anything yet.
```

If no Supabase MCP tool is exposed after starting a new chat, use the ChatGPT
desktop app or Codex CLI rather than the IDE extension, then connect Supabase
from the plugin details and start another session. The project must be scoped
to the ChapterPrep Supabase project before write operations are performed.

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
- MCP tool exposure in this chat: not verified; no `list_projects`,
  `list_tables` or `execute_sql` tool is currently available.
- CLI fallback: not authenticated; `npx supabase projects list` returned
  `LegacyPlatformAuthRequiredError` because no access token is configured.
- Supabase project/database access: not claimed until an authenticated MCP
  query succeeds in a supported Codex session.

## Handoff for a new chat

The repository is ChapterPrep at
`D:\code\saas\new_chapter_prep`. The frontend and backend foundation are in
Git. The next safe sequence is:

1. Verify the Supabase MCP connection with a read-only project/organization
   listing.
2. Choose or create the Supabase organization and create a project named
   `ChapterPrep` in a European region close to the users.
3. Record the project reference and public project URL without committing
   secrets.
4. Apply the checked-in initial migration through MCP, run security/performance
   advisors, and verify the resulting tables and RLS policies.
5. Configure and deploy the Edge Function, setting `GEMINI_API_KEY` only as a
   server-side secret.
6. Generate the publishable frontend configuration and run the application and
   integration checks.

Do not use a service-role key in the browser, do not claim live behavior before
the read/write verification succeeds, and do not paste passwords or access
tokens into chat.

Once access is active, Supabase MCP is the preferred interface for project
inspection, SQL, migrations, RLS review, Edge Functions, logs and generated
types. Keep migration files in `supabase/migrations/` under version control and
run the relevant tests and advisors before merging schema changes.
