# UI/UX Handoff

- Stage: 9 — Handoff
- Date: 2026-11-20
- Status: UI/UX package accepted; IMP-022 implementation is in progress. This handoff does not authorize deployment or release.
- The user accepted renderer plan delta IMP-022 and authorized implementation on 2026-11-20. The Implementation Plan remains the implementation boundary.

## 1. Accepted design baseline

The user accepted the information architecture, F-01 through F-09, S-01 through S-08, wireframes, page specifications, Direction L, the light token baseline, C-01 through C-09, and I-01 through I-15. This includes inline confirmation before remove, delete, and dissolve.

English files are canonical. Matching `-zh.md` files are translations; use English if a translation lags.

## 2. Implementation authority

- Product behavior remains governed by the approved PRD and AC-001 through AC-051.
- Technical contracts remain governed by the approved Technical Design and TD-001 through TD-004.
- IMP-022 authorizes the accepted UI surfaces and interactions.
- Renderer may import `busyAt` and no other domain export.
- Renderer must not receive the stored record or gain domain command-writing authority.
- No new product behavior, authentication, multi-team, cross-device sync, reminders, recurrence, all-day events, theme control, calendar, or Website/Admin/API business surfaces are authorized.

## 3. Verification status

The first implementation is on `main` at `75bc717`. Its repository CI passed typecheck, lint, 35 Vitest tests, and electron-vite build.

These results do not prove a real Electron window started, runtime IPC worked, or an installer works.

| Verification | Status |
|---|---|
| Domain, store, coordinator, time-adapter, preload-contract, renderer-model tests | CI passed |
| Main, preload and renderer production build | CI passed |
| Real Electron window, preload bridge, IPC and userData persistence | Runtime verification pending |
| Packaged installer creation and install/launch | Not configured |
| Runtime screenshot comparison | Not checked |
| Final independent re-review of UX-REV-002, 004, 013, 014 and I-15 | Pending |

A Node-native Electron smoke test is being added against the built application. It adds no npm dependency and is not an installer test.

## 4. Known requirement/design distinction

C-01 option A remains the V1 decision: one computer, one OS time zone, no zone picker. PRD AC-042 still contains wording about separate devices' local labels. Do not silently add a zone picker or cross-device behavior; track the remaining wording difference as a product/technical-contract issue.

## 5. Release boundary

UI/UX acceptance and implementation authorization do not authorize deployment, publishing, or release. Those actions require separate explicit authorization.
