# ADR 0001: Use a pnpm monorepo

- Status: Accepted
- Date: 2026-11-18

## Context

The project contains a desktop client, public website, administration console, and API, all using TypeScript. A single contributor benefits from one dependency-management and quality-check workflow.

## Decision

Use pnpm workspaces in one repository. Keep each application independently buildable and deployable. Add shared packages only for stable contracts and real reuse.

## Consequences

- One pull request can coordinate cross-application changes.
- Tooling and dependency versions are easier to align.
- CI may later be optimized with task caching if build times justify it.
- Cloud and deployment choices remain open.
