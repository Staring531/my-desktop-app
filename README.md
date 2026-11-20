# My Desktop App

A cross-platform desktop application with a public website, an administration console, and a backend API.

## Project status
The Version 1 PRD, Technical Design, Implementation Plan, and UI/UX package are accepted. Application implementation was authorized on 2026-11-20 and is underway. The current main commit has passing typecheck, lint, Vitest, and electron-vite build checks. Real Electron runtime verification, packaged-installer testing, final independent UI review, and runtime screenshot comparison remain outstanding. Deployment is not authorized.

## Development lifecycle
- Mandatory agent instructions: [DEVELOPMENT_WORKFLOW.md](DEVELOPMENT_WORKFLOW.md)
- Lifecycle diagram: [agent.md](agent.md)
- Chinese workflow: [DEVELOPMENT_WORKFLOW-zh.md](DEVELOPMENT_WORKFLOW-zh.md)

1. Product Discovery — approved PRD.
2. Technical Design — approved architecture and technical contracts.
3. Implementation Planning — sequenced tasks; not coding authorization.
4. UI/UX Design — accepted package and handoff.
5. Implementation Readiness — accepted plan delta IMP-022 and explicit coding authorization recorded.
6. Coding & Testing — implementation underway; desktop runtime and visual verification remain open.
7. Implementation Review & Delivery — acceptance evidence and any final review; deployment/release requires separate authorization.

## Workflow documents
- [Product Discovery](PRODUCT_DISCOVERY.md)
- [Technical Design](TECHNICAL_DESIGN.md)
- [UI/UX Design](UI_UX_DESIGN.md)
- [Agent development lifecycle](agent.md)
- [Chinese README](README-zh.md)
- [Chinese lifecycle diagram](agent-zh.md)

UI/UX English source documents and Chinese translations live in [docs/ui-ux/](docs/ui-ux/). Start with [design requirements](docs/ui-ux/00-design-requirements.md) or [中文设计需求](docs/ui-ux/00-design-requirements-zh.md).

## Scope and authorization
The approved PRD remains the product scope authority. UI/UX Design must not add authentication, multi-team, cross-device sync, reminders, recurring/all-day events, theme preferences, or other excluded behavior. UI/UX approval does not authorize application code. Coding requires separate explicit user authorization.
