# AGENTS.md

## Project Scope
- This repository is for the Comitor project.
- Documentation source of truth is under `docs/`, rendered by Zensical via `zensical.toml`.

## Mandatory Working Rules
1. Always create a detailed plan right after receiving a request.
2. Wait for user confirmation before implementation.
3. Only do what the requester explicitly asks.
4. Do not touch unrelated files, flows, or modules.
5. When writing code, add a concise comment that explains each function's purpose in Vietnamese.

## Build and Test Rules
1. Build and test only the parts where code was changed.
2. Do not run full-repo build/tests unless the user explicitly asks for it.
3. Only report fully complete when the required build/test scope passes.
4. If verification fails, report incomplete status and list remaining failures.

## Documentation Rules
1. Project documentation must be written in Vietnamese.
2. Update or add markdown docs only when the new work is related to business flow or code that truly needs documentation.
3. The agent must self-assess whether documentation is necessary for the requested change.
4. Avoid duplicate content. Always review existing docs first and update existing pages when equivalent sections already exist.
5. Create a new docs file only when existing files cannot be extended cleanly without reducing clarity.
6. New docs file naming must follow `slug-YYYYMMDD.md`.
7. When adding a new docs file, update:
   - `docs/index.md`
   - `zensical.toml` navigation
8. Do not place project documentation files at repo root (except governance files like `AGENTS.md`).

## Docs Verification
- Run docs build only when docs were changed:
  - `./.venv/bin/zensical build -f zensical.toml`
  - If `.venv` is not available, use: `zensical build -f zensical.toml`

## Delivery Workflow
1. Receive request -> write detailed plan.
2. Wait for user confirmation.
3. Implement strictly within requested scope.
4. Update docs only if needed by the documentation rules.
5. Build/test only changed code parts.
6. Report exact completion status based on required verification.
