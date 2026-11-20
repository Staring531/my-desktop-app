# UI/UX Design Requirements — Stage 0 Readiness Analysis

- Stage: 0 — Readiness Analysis
- Date: 2026-11-19
- Status: Stage 0 readiness record accepted by the user on 2026-11-20. This acceptance does not approve information architecture, screens, wireframes, or visual design. F-01 through F-09 remain proposals.
- Authority order: approved PRD → approved Technical Design → available Implementation Plan → this UI/UX analysis.
- Stage 1 structural baseline accepted by the user on 2026-11-20. Direction L and the Stage 3 token and component baseline were approved by the user on 2026-11-20. The user accepted the UI/UX design package on 2026-11-20: Stage 4 wireframes and page specifications, and Stage 5 high-fidelity and interaction specifications, including I-15. This acceptance does not authorize application code. Stage 6 validation is in `13-visual-validation.md`. The independent review is in `08-design-review.md`. Corrections made after the last re-review, including I-15, were part of the accepted package and have not had a further independent re-review. The Implementation Plan was not changed. Stage 9 handoff is in `14-handoff.md`. Its plan delta is proposed and not approved.

## 1. Principles

1. The approved PRD is the authority for user-visible behavior. This analysis adds no capability, actor, workflow, or business rule.
2. The approved Technical Design governs architecture, process boundaries, data ownership, persistence, and security.
3. Version 1 presentation is one desktop app and one local team record on one computer.
4. Website, Admin, and API are not Version 1 UI surfaces.
5. Do not introduce login, email verification, multi-team, cross-device sync, reminders, recurring events, all-day events, theme preferences, or other excluded behavior.
6. This document is analysis, not implementation authorization. It does not change application code, install dependencies, or edit the Implementation Plan.
7. Confirmed requirements, proposals, assumptions, and open questions stay separate. An unconfirmed proposal is not a user decision.
8. Later UI/UX documents may trace each accepted screen, component, and interaction to a PRD requirement and a technical contract. This stage only starts that map.
9. After this readiness review, the active workflow is System-First: structure, then an approved visual direction, then approved tokens and core components, then page design, then validation and review. This stage does not start that sequence.
10. Linear is a visual reference only. Do not copy its brand assets or add product-specific capabilities.

## 2. Approval and completeness check

### PRD

`docs/product/04-prd.md` is APPROVED, version 0.1 draft, by the user on 2026-11-19 (DEC-011). The requirements review and the PRD quality audit did not approve it.

Approved scope is section 2: one team, one maintainer, invitation and membership, single schedule events, team-visible and only-self visibility, and a per-member busy/free view that includes past events. Section 2 exclusions and the out-of-contract email-proof and device-transfer sentences stay out of UI scope. Section 9 records no open product questions inside that boundary. Actors are founder, member, maintainer, invitee, and removed member. Acceptance criteria AC-001 through AC-051 are present.

### Technical Design

`docs/technical/02-architecture.md` through `09-test-strategy.md`, and `docs/technical/technical-decisions/log.md`, are APPROVED by the user on 2026-11-19. That approval includes TD-001 through TD-004. TD-001 is one local record on one computer. TD-002 is session binding without inbox proof. TD-003 is one JSON document replaced atomically. TD-004 recommends `@js-temporal/polyfill`. Review findings TDR-REV-001 through TDR-REV-030 are recorded as addressed in the technical review reports. Those reports did not approve the design.

The design set required by `TECHNICAL_DESIGN.md` is present: repository analysis, technical requirements, architecture, domain, data, application, security, concurrency, errors, test strategy, technical decisions, and both review reports.

### Implementation Plan

`docs/technical/10-implementation-plan.md` exists. It has six epics and IMP-001 through IMP-021, and it names AC-001 through AC-051. Its own status is plan only. `DEVELOPMENT_WORKFLOW.md` treats plan-baseline confirmation as a separate user decision. This repository has no later record that the user confirmed that baseline. The plan is available, which is the UI/UX entry condition. On 2026-11-20 the user said this unconfirmed plan is a sequencing reference only. It is not a confirmed baseline and does not override the PRD or Technical Design.

UI-relevant tasks already named by the plan:

| Task | UI-relevant scope |
|---|---|
| IMP-016 | Ambiguous-time result: one field, `earlier` and `later`, no write until a later submit. |
| IMP-017 | The first process tells the operator that a writer already exists and focuses its window. |
| IMP-018 | The coordinator registers every window, including a macOS activate window. Default shell today is 1200×800. |
| IMP-019 | Preload exposes `bind`, `openSession`, `command`, and this window's projection. |
| IMP-020 | Renderer can bind, open another session, edit one event, choose an occurrence, and call `busyAt`. |
| IMP-021 | Acceptance command becomes `vitest run` without `--passWithNoTests`. |

IMP-020 does not name invite, accept, decline, cancel, designate, remove, dissolve, or custody edit as renderer tasks. Those commands exist in the approved application design and in IMP-019's command payload. A later screen set that makes those PRD flows operable may need an Implementation Plan delta. This stage does not write that delta.

## 3. Existing UI baseline

Observed on 2026-11-19. No application code was run.

| Surface | What exists |
|---|---|
| Desktop window | `apps/desktop/src/main/index.ts` creates one `BrowserWindow`, 1200×800. `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`. No single-instance lock. On macOS, `activate` creates a window when none are open, outside any coordinator. Other platforms quit when the last window closes. |
| Desktop renderer | `apps/desktop/src/renderer/src/main.tsx` renders one heading, "My Desktop App", and one sentence that the scaffold is ready. `index.html` sets `lang="en"` and the title "My Desktop App". |
| Preload | `apps/desktop/src/preload/index.ts` exposes `desktop.platform` only. |
| Website | `apps/website` is a Next.js scaffold. One page says the public website scaffold is ready. Not a Version 1 UI surface. |
| Admin | `apps/admin` is a Next.js scaffold. One page says the admin console is ready and that authentication is not configured. Not a Version 1 UI surface. |

There is no navigation, route table, session screen, team screen, event editor, busy/free board, dialog, or form.

`docs/ui-ux/01-information-architecture.md` through `08-design-review.md`, and their Chinese translations, already exist. `01` is marked proposed. `03` lists candidate surfaces UI-01 through UI-10. `04` through `08` are templates or gate instructions, not completed specifications. This Stage 0 analysis does not accept those candidates. They are not a user decision.

## 4. Frontend technology and constraints

Desktop UI stack, from `apps/desktop/package.json` and `electron.vite.config.ts`:

- Electron 35 and electron-vite 3.
- React 19 and React DOM 19, rendered by Vite 6.
- TypeScript 5.8.
- The renderer alias `@renderer` points at `apps/desktop/src/renderer/src`.
- No router, component library, CSS framework, icon package, or state library is installed.

Approved technical constraints the UI must keep:

- The renderer is untrusted. It does not send the actor email, the trusted zone, the generation, or a create-event id.
- `bind` may send only the requested email. `openSession` sends no email.
- Each window has one session assigned by the main process.
- The main process pushes that session's projection. The stored document is not rendered and then filtered locally.
- Every projection includes `record`: `absent`, `active`, or `dissolved`. Create-team is available to a bound session only when the record is absent or dissolved. Active plus `no-access` is not a create state.
- Visible events include `id`. Modify and delete use that id.
- The board calls domain `busyAt`. The renderer may import that function and no other domain export. Busy rows are computed for the instant being viewed, including a later "now", and are not frozen into the push.
- A clock field is sent only when the operator edited it, or when resubmitting an occurrence for the field just reported.
- The successful UI does not offer recurring or all-day modes.
- Result codes are shown to the session that issued the command. Other sessions do not see unsent fields.
- Canceling an edit, or dismissing an occurrence choice, does not write.
- Version 1 reads one OS IANA zone in the main process. The renderer does not supply that zone.

## 5. Existing reusable components and assets

None found for Version 1 UI.

- No CSS, SCSS, SVG, icon, font, or image files in the repository.
- No shared React components in `apps/desktop`, `packages/shared`, or `packages/api-client`.
- No design tokens.
- The only reusable presentation fact is the browser window size 1200×800 and the HTML language `en`.

Website and admin pages are scaffolds. They are not a component source for the desktop app.

## 6. Navigation, routing, window, and interaction today

- No client route and no in-app navigation structure.
- One window, one static page, no controls.
- No keyboard map beyond the browser default for a heading and paragraph.
- No accessibility pattern beyond `lang="en"` on the desktop and website documents.
- No minimum or maximum window size, and no resize rule.
- A second window is possible only by the current macOS activate behavior or by launching another process. The approved design replaces that with coordinator-owned windows and a single-instance lock. That behavior is not implemented.

## 7. Test framework and UI test capability

- `@app/desktop` test script is `vitest run --passWithNoTests`.
- No `describe` or `it` tests, and no Playwright, Testing Library, or component test dependency, were found.
- The approved test strategy puts board behavior on domain `busyAt`, not on a browser.
- IMP-020 names renderer interaction checks. Those tests do not exist yet.
- A passing run of the current script would not show that any screen works.

## 8. Preliminary screens and flows

These are identification labels for later design. They are PROPOSED. They are not an accepted information architecture and not a wireframe.

| Proposed flow | Actor, from the PRD | Capability the UI must be able to reach | Example criteria |
|---|---|---|---|
| F-01 Bind a session | Operator at this computer | Enter an email for this window. Open another window and session. | TD-002; supports AC-004, AC-015, AC-019 |
| F-02 Create the team | Bound email while the record is absent or dissolved | Submit create. See the resulting member context. | AC-001, AC-003, AC-050 |
| F-03 Invitation | Maintainer; invited email | Invite, cancel, accept, decline. Invitee sees only that invite. | AC-004 through AC-008, AC-030, AC-032 through AC-036 |
| F-04 Maintainer role | Maintainer; ordinary member | Designate another member. Reject the actions an ordinary member cannot take. | AC-009 through AC-011, AC-038, AC-039 |
| F-05 One event | Current member; maintainer only for a retained team-visible event | Enter visibility, title, location, description, start, and end. Modify, delete, cancel. Choose an occurrence when asked. | AC-012 through AC-015, AC-020, AC-021, AC-028, AC-029, AC-037, AC-043 through AC-051 |
| F-06 Busy/free and visible events | Current member | View members and whether an instant is busy. View permitted event content, including ended events. | AC-016 through AC-018, AC-040 through AC-042, AC-045 |
| F-07 Removal, rejoin, dissolution | Maintainer; removed email; sole member | Remove another member. After a later invite, the returning member edits retained events. Sole member dissolves. | AC-019 through AC-023, AC-041, AC-047 through AC-049 |
| F-08 Completed change | A session that is open; a session that views later | After a completed command, the open session shows the new projection. A later view reads the current record. | AC-024, AC-025, AC-026, AC-031, AC-035, AC-046 |
| F-09 Unavailable record and second process | Operator | See `record-unreadable` without a new team being invented. See that a writer already exists when a second process starts. | BR-7; approved error and lock behavior |

AC-027 is a non-UI outcome: the interface sends no reminder. AC-002, AC-005, AC-010, AC-011, AC-034, AC-038, and AC-039 are failed commands that leave the record unchanged. Their UI is feedback on the proposing session, not a new screen.

A calendar, dashboard, settings page, profile, login, or notification center is not identified as required.

## 9. Initial traceability

Status of every row: PROPOSED. Flow and screen IDs are not accepted.

| Criteria | Proposed flow | Presentation note from the approved design |
|---|---|---|
| AC-001, AC-003, AC-050 | F-02 | Create only when `record` is absent or dissolved. |
| AC-002 | F-02 | Active team: create writes nothing. Show the failure to that session. |
| AC-004, AC-005, AC-006, AC-007, AC-008, AC-030, AC-032, AC-033, AC-034, AC-035, AC-036 | F-03 | Invitee projection is the invite only. Maintainer sees pending addresses. Ordinary members do not. |
| AC-009, AC-010, AC-011, AC-038, AC-039 | F-04 | Controls follow the actor in the projection. Rejected actions write nothing. |
| AC-012, AC-013, AC-014, AC-015, AC-028, AC-037, AC-043, AC-044, AC-046, AC-051 | F-05 | One event. No recurrence or all-day success path. Ambiguous time asks for `earlier` or `later`. |
| AC-016, AC-017, AC-018, AC-040, AC-042, AC-045 | F-06 | `busyAt` at the viewed instant. Only-self events stay on the owner's row and out of other members' event lists. |
| AC-019, AC-020, AC-021, AC-022, AC-023, AC-029, AC-041, AC-047, AC-048, AC-049 | F-07 | Removal ends that session's member view. Custody edit cannot send a visibility change. |
| AC-024, AC-025, AC-026, AC-031 | F-08 | Another local session, or a later view of this record. Not another computer. |
| AC-027 | None | No reminder UI. |
| AC-042 two device zones | F-06 | Closed for UI by option A on 2026-11-20. One OS zone. Busy still uses absolute instants. No zone picker and no second live zone. |

## 10. Design dependencies

- Stage 1 can describe navigation only after the user reviews this analysis.
- Event editing depends on the approved occurrence result from the time port. The package is not installed. Design can name `earlier` and `later` without choosing visual styling.
- Busy/free presentation depends on `busyAt` and on instants in the projection. It does not depend on a stored busy row.
- Permission-sensitive controls depend on the projection fields already specified: actor, maintainer flag, `record`, roster, invites, and visible events. They do not depend on a renderer-side role check against the stored file.
- IMP-019 and IMP-020 are the plan tasks that can consume an approved UI specification. Invite, membership, and dissolution screens are a likely plan delta, to be proposed only after the user accepts a screen set.
- No font, icon, or color dependency exists in the repository. Visual design would be specifying a new lightweight system, not extending an existing one.

## 11. Risks, conflicts, and open questions

### Conflict for user confirmation

**C-01. AC-042 and one computer zone.**

- PRD AC-042 says two members whose devices are in different zones view the same instant, agree whether the owner is busy, and each see clock labels in that viewer's own current device-local zone.
- TD-001, approved with the technical design, keeps one record on one computer and does not synchronize to another computer. The approved application design reads one OS IANA zone in the main process. The renderer cannot supply a trusted zone. Two sessions on that computer therefore share one zone at a given moment.
- Impact: a Version 1 screen cannot honestly show two simultaneous viewers in two device zones without a Technical Design change, and a zone picker would contradict the current contract.
The user chose option A on 2026-11-20. The PRD text and the Technical Design were not changed.

- Version 1 UI shows one operating-system zone, the zone read by the main process.
- Busy and free still follow absolute instants. Two sessions on this computer share that zone at one moment.
- Clock labels use that zone's offset at each instant.
- Two simultaneous device zones are not a Version 1 screen. There is no zone picker.
- AC-042's agreement about whether someone is busy remains in scope. Its wording about each viewer having a different device zone is not implemented as two live windows.

The user's earlier choice on AC-024 remains TD-001: the other member is another local session or a later view. That choice is not reopened.

### Risks

| ID | Risk | Stage 0 handling |
|---|---|---|
| R-UI-1 | IMP-020's renderer list is smaller than the PRD flows. | Recorded. No plan edit. |
| R-UI-2 | `docs/ui-ux/01` through `08` can be mistaken for an accepted design. | This file does not accept them. |
| R-UI-3 | The current test script can pass with no UI tests. | Do not treat that script as evidence of a usable screen. |
| R-UI-4 | Anyone at the computer can bind an allowed email. | Accepted in TD-002. The UI must not look like an authentication system. |
| R-UI-5 | Adding a calendar, confirmation ritual, or extra navigation could imply behavior the PRD does not have. | Those ideas stay proposals until a later reviewed stage. |

### Open questions

These are not decisions.

| ID | Question | Owner |
|---|---|---|
| Q-01 | How should Version 1 UI treat AC-042's two device zones, given C-01? | Closed on 2026-11-20 by option A. One OS zone. No zone picker. The PRD text was not edited. |
| Q-02 | Should the Implementation Plan baseline be explicitly confirmed before Stage 1? | Closed on 2026-11-20. The plan stays unconfirmed and is a sequencing reference only. |
| Q-03 | After Stage 0 review, which proposed flows become the structural baseline? | User, at the Stage 1 review. Not asked as a decision in this file. |
| Q-04 | Whether destructive actions use a confirmation step. The PRD does not require one. | Closed on 2026-11-20. The user chose a confirmation step on the same surface before remove, delete, or dissolve. It is not a new destination and not an authorization boundary. Dismissing an ambiguous-time choice still returns to S-05 and discards the unsent edit. |

### Assumptions

The working assumption about leaving C-01 unresolved is retired. Option A is the user's decision for Version 1 UI. It does not delete AC-042 from the PRD.

## 12. UI/UX readiness assessment

Stage 0 is ready for user review.

| Prerequisite | Assessment |
|---|---|
| PRD approved | Yes. DEC-011. Scope is section 2 plus AC-001 through AC-051. |
| Technical Design approved | Yes. 2026-11-19, including TD-001 through TD-004. |
| Implementation Plan available | Yes. On 2026-11-20 the user limited it to a sequencing reference. It is not a confirmed baseline. |
| Existing UI to extend | A desktop shell and a one-page scaffold only. |
| Blocker to writing this analysis | None. |
| User review | Accepted on 2026-11-20, together with C-01 option A. |
| Blocker inside this file | None. The user asked for Stage 1 on 2026-11-20. The Stage 1 draft is not accepted. |

## 13. Recommended next steps

1. The user accepted this readiness record on 2026-11-20 and chose C-01 option A.
2. The user asked for Stage 1 on 2026-11-20. The draft is ready for review and is not the accepted information architecture.
3. That draft uses the Implementation Plan as a sequencing reference only.
4. Do not start wireframes, visual design, or application code from this document.

## 14. Work not done

- No application source was edited.
- No dependency was installed.
- No wireframe, visual design, or interaction specification was started.
- The approved PRD, Technical Design, and Implementation Plan were not modified.
- Stage 1 was drafted for review. Wireframes and visual design were not started.
- No independent design review was run.
