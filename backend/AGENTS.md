# Rails AI Harness

This repository defines reusable guidance for AI coding agents working on Ruby on Rails backends.

## Read first

Before making changes, read the relevant documentation:

- `docs/stack.md` — preferred technology choices and dependency policy.
- `docs/conventions.md` — Ruby and Rails coding conventions.
- `docs/testing.md` — testing expectations and commands.
- `docs/architecture.md` — architectural principles and boundaries.
- `docs/security.md` — security boundaries and input/secret handling.
- `docs/performance.md` — database, request, caching, and background-job performance guidance.
- `docs/api.md` — typed OpenAPI contracts for the frontend and API compatibility rules.
- `docs/decision-making.md` — decision rules for choosing patterns, abstractions, and dependencies.

## General rules

- Prefer Rails conventions and built-in framework capabilities over unnecessary abstractions.
- Inspect the existing codebase before introducing a new pattern or dependency.
- Reuse an existing abstraction when its responsibility matches; do not force unrelated behavior into it.
- If Rails or Ruby solves the problem adequately, do not add a gem. If they do not, prefer a mature maintained gem over reimplementing substantial generic infrastructure.
- Keep changes scoped to the requested task.
- Preserve public behavior unless the task explicitly requires a change.
- Public API changes must include request/API coverage and an updated typed OpenAPI contract when the project exposes OpenAPI.
- For RSpec-based REST APIs, prefer rswag as the default OpenAPI integration unless the project already uses another established approach.
- Database schema changes must be made through migrations.
- Critical data invariants should use database constraints when applicable, in addition to application validations when useful for user-facing errors.
- Consider transactions and concurrency for multi-record business operations, counters, credits, ownership, state transitions, and uniqueness-sensitive behavior.
- Prefer RESTful routes over custom actions when normal resource semantics fit.
- Do not create a service object when the behavior naturally belongs to an existing model/domain object.
- Use service/use-case objects for non-trivial orchestration across multiple models or external systems, not as a default layer for every CRUD action.
- Avoid callbacks for cross-domain side effects or workflows that need explicit ordering; callbacks are acceptable for local model lifecycle concerns.
- Background jobs should be safe to retry or explicitly guard against duplicate effects.
- External HTTP calls must have explicit timeouts; retries require safe/idempotent semantics or deliberate duplicate protection.
- Use structured JSON logging through the project's logging stack. For Lograge projects, keep Lograge as the request logging format and add useful contextual/domain logs without logging secrets or tokens.
- Do not edit generated schema files manually.
- Run the narrowest relevant verification first, then broader checks when appropriate.
- Explain significant architectural or dependency decisions in the PR description.

## Rails generators

Prefer Rails generators for framework-managed files instead of creating them manually.

Typical commands:

```bash
bin/rails generate model Book title:string author:string
bin/rails generate migration AddStatusToBooks status:string
bin/rails generate controller Books index show create
bin/rails generate job ReindexBook
bin/rails generate mailer UserMailer
```

Always inspect generated output before modifying it. Do not invent migration timestamps or manually reproduce files Rails would generate unless there is a specific reason.

Plain Ruby objects such as domain objects, query objects, or use-case/service objects may be created manually when they are the appropriate abstraction.

## Skills

Use the relevant workflow from `.agents/skills/` when the task matches it:

- `rails-feature` — implementing application features.
- `rails-api-endpoint` — implementing or changing a public REST endpoint with request coverage and typed OpenAPI documentation.
- `rails-model` — creating or modifying Active Record models.
- `rails-migration` — changing the database schema safely.
- `rails-controller` — creating or modifying controllers and request handling.
- `rails-route` — adding or modifying RESTful routes and namespaces.
- `rails-job` — creating background jobs using Active Job.
- `rails-test` — adding or updating tests.
- `business-logic` — deciding where non-trivial application logic belongs.
- `debugging` — diagnosing and fixing failures systematically.
- `code-review` — reviewing changes for correctness and maintainability.

Project-specific repositories may extend or override this guidance with their own documentation and local `AGENTS.md` files.
