# My Desktop App

A cross-platform desktop application with a public website, an administration console, and a backend API.

## Project status
The approved Version 1 PRD, Technical Design, and Implementation Plan are recorded. UI/UX Design is the next design stage. Application implementation has not been authorized.

## Development lifecycle
See [agent.md](agent.md) for the lifecycle diagram and governance gates.

1. Product Discovery — approved PRD.
2. Technical Design — approved architecture and technical contracts.
3. Implementation Planning — sequenced tasks; not coding authorization.
4. UI/UX Design — readiness analysis, IA, flows, screens, wireframes, interaction/visual specs, independent review.
5. Implementation Readiness — traceability and plan alignment; explicit user approval.
6. Coding & Testing — only after separate explicit authorization.

## Workflow documents
- [Product Discovery](PRODUCT_DISCOVERY.md)
- [Technical Design](TECHNICAL_DESIGN.md)
- [UI/UX Design](UI_UX_DESIGN.md)
- [Agent development lifecycle](agent.md)
- [Chinese README](README-zh.md)
- [Chinese lifecycle diagram](agent-zh.md)

UI/UX English source documents and Chinese translations live in [docs/ui-ux/](docs/ui-ux/). Start with [design requirements](docs/ui-ux/00-design-requirements.md) or [中文设计需求](docs/ui-ux/00-design-requirements-zh.md).

## Scope and authorization
The approved PRD remains the product scope authority. UI/UX Design must not add authentication, multi-team, cross-device sync, reminders, recurring/all-day events, or other excluded behavior. UI/UX approval does not authorize application code. Coding requires separate explicit user authorization.
