# Technical Design Review

- Review date: 2026-11-19
- Gate: Detailed Design Review Gate
- Reviewer: Technical Design Reviewer (independent, read-only)
- Design reviewed: stage 3 documents as first submitted
- Overall result: Changes required. Not complete enough to present for user review.
- This report does not approve the technical design. TDR-REV-001 through TDR-REV-009 were not reopened. The 2026-11-19 user choices stand.

## Review scope

The reviewer read the approved PRD, `02-architecture.md` through `09-test-strategy.md`, the technical decision log, `TECHNICAL_DESIGN.md`, the architecture review dispositions, and `01-technical-requirements.md` sections 2–6. Repository evidence was the desktop main process, preload, and `apps/desktop/package.json`. Acceptance IDs AC-001 through AC-051 were checked by name in the test strategy, not by running tests.

## Strengths

- TD-001 and TD-002 match the closed user choices. Website, admin, and API stay off the version 1 path.
- Per-actor projection, generation stamp, whole-document replace, and custody rejection of a visibility change match the approved rules.
- The desktop shell already isolates the renderer.

## Material risks reported

- A damaged team file could be replaced by a new team.
- Busy/free could stay frozen at the last push.
- A second create had two result codes and one unsafe success condition.

## Limitations reported

- No tests were run, and the time-zone package was not executed.
- Website, admin, and API were not re-read.
- No product decision was made.

## Findings

### TDR-REV-010

- **Severity:** HIGH
- **Affected design section and PRD requirement(s):** `04-data-design.md` section 5; `05-application-design.md` section 5; `08-error-handling-and-observability.md` section 2. BR-1, BR-7, AC-001, AC-002, AC-050.
- **Evidence and concrete scenario:** An unreadable file was `record-unreadable`, but the coordinator stamped a missing file as absent and could replace a truncated file with a new team.
- **Problem and impact:** The only copy of the roster and events could be destroyed.
- **Recommended resolution:** Return `record-unreadable` before a stamp and before the domain. Reject replace while the current file exists and is unreadable.
- **User/product decision required:** NO
- **Status:** OPEN

### TDR-REV-011

- **Severity:** HIGH
- **Affected design section and PRD requirement(s):** `05-application-design.md` section 8; `03-domain-model.md` section 5. BR-6, AC-016, AC-018, AC-040, AC-045.
- **Evidence and concrete scenario:** Busy rows were computed at push time. An open window stayed busy after the event ended because no new command ran.
- **Problem and impact:** The busy/free board is wrong while the record is idle.
- **Recommended resolution:** Compute each row at the instant being viewed, including "now" on each display, with the half-open per-member rule. Do not add a scheduler.
- **User/product decision required:** NO
- **Status:** OPEN

### TDR-REV-012

- **Severity:** MEDIUM
- **Affected design section and PRD requirement(s):** `05-application-design.md` section 6. BR-4, BR-6, AC-016, AC-042.
- **Evidence and concrete scenario:** Labels used the zone's current offset, so a January instant displayed in July was shifted by one hour.
- **Problem and impact:** Clock labels disagree with the civil time that was saved.
- **Recommended resolution:** Format each instant with the zone's offset at that instant.
- **User/product decision required:** NO
- **Status:** OPEN

### TDR-REV-013

- **Severity:** MEDIUM
- **Affected design section and PRD requirement(s):** `07-concurrency-and-consistency.md` section 3; `08-error-handling-and-observability.md` section 2; `03-domain-model.md` section 4. BR-1, BR-7, AC-002, AC-050.
- **Evidence and concrete scenario:** A second create stamped absent was both `generation-mismatch` and `team-already-active`. A create that trusted only the stamp could replace the first team.
- **Problem and impact:** AC-002 has an unsafe success condition.
- **Recommended resolution:** One decision table. Absent stamp plus any existing generation does not write and returns one code. Create succeeds only when the loaded record is still the stamped base.
- **User/product decision required:** NO
- **Status:** OPEN

### TDR-REV-014

- **Severity:** MEDIUM
- **Affected design section and PRD requirement(s):** `04-data-design.md` section 2; `03-domain-model.md`; `05-application-design.md` section 3. BR-4, AC-037, AC-047.
- **Evidence and concrete scenario:** Event ids were allocated by both the domain and the coordinator.
- **Problem and impact:** Modify and delete have no single owner for identity.
- **Recommended resolution:** The coordinator supplies the id on create. The domain rejects a duplicate and is the only component that places the id in the record.
- **User/product decision required:** NO
- **Status:** OPEN

### TDR-REV-015

- **Severity:** MEDIUM
- **Affected design section and PRD requirement(s):** `05-application-design.md` sections 6 and 7; `08-error-handling-and-observability.md` section 1. BR-4, AC-028.
- **Evidence and concrete scenario:** The error contract required two instants, and the time port's ambiguous result did not include them. Both fields could be ambiguous.
- **Problem and impact:** The occurrence control cannot be implemented from the contracts.
- **Recommended resolution:** Return `earlier` and `later` for one field. If both are ambiguous, report `start` first.
- **User/product decision required:** NO
- **Status:** OPEN

### TDR-REV-016

- **Severity:** MEDIUM
- **Affected design section and PRD requirement(s):** `02-architecture.md` section 5; `06-security-and-access-control.md` section 5; `07-concurrency-and-consistency.md` section 1. BR-7.
- **Evidence and concrete scenario:** The second process exited with no specified operator-visible signal.
- **Problem and impact:** A silent exit can be mistaken for a failed launch.
- **Recommended resolution:** Focus the existing window, and show that the record already has a writer.
- **User/product decision required:** NO
- **Status:** OPEN

### TDR-REV-017

- **Severity:** MEDIUM
- **Affected design section and PRD requirement(s):** `04-data-design.md` section 4; `07-concurrency-and-consistency.md` section 5. BR-7, AC-035.
- **Evidence and concrete scenario:** Flush was not defined as a disk sync, and a Windows replace can drop the destination before the new file is durable.
- **Problem and impact:** An incomplete command can lose the previous document.
- **Recommended resolution:** Sync the temp file. Replace without deleting the destination first. A failed replace leaves the original bytes.
- **User/product decision required:** NO
- **Status:** OPEN

### TDR-REV-018

- **Severity:** MEDIUM
- **Affected design section and PRD requirement(s):** `05-application-design.md` section 5; `07-concurrency-and-consistency.md`; `08-error-handling-and-observability.md`. BR-7, AC-024, AC-035.
- **Evidence and concrete scenario:** A push to a closed window could throw and stop the single queue.
- **Problem and impact:** Later commands never reach replace.
- **Recommended resolution:** Catch the failure, continue the queue, and do not roll back a finished replace. Drop a closed window's session before the next push.
- **User/product decision required:** NO
- **Status:** OPEN

### TDR-REV-019

- **Severity:** MEDIUM
- **Affected design section and PRD requirement(s):** `09-test-strategy.md`; `05-application-design.md`; `06-security-and-access-control.md`. BR-4, BR-7, AC-005, AC-037, AC-046.
- **Evidence and concrete scenario:** AC-046 was only a domain assertion, and no test ignored an actor email in the payload.
- **Problem and impact:** The trust boundary is untested.
- **Recommended resolution:** Test cancel and failed save at the coordinator. Test that payload actor, zone, and generation are ignored.
- **User/product decision required:** NO
- **Status:** OPEN

### TDR-REV-020

- **Severity:** LOW
- **Affected design section and PRD requirement(s):** `01-technical-requirements.md`. BR-1 through BR-7.
- **Evidence and concrete scenario:** Stage 1 rows still said the boundary was unassigned and that Q-REC and Q-ACT were open.
- **Problem and impact:** An implementer can bypass the choices the user already made.
- **Recommended resolution:** Point the stage 1 file at TD-001, TD-002, and the stage 3 modules. Leave the PRD unchanged.
- **User/product decision required:** NO
- **Status:** OPEN

### TDR-REV-021

- **Severity:** LOW
- **Affected design section and PRD requirement(s):** `09-test-strategy.md`; `apps/desktop/package.json`. AC-001 through AC-051.
- **Evidence and concrete scenario:** The package script is `vitest run --passWithNoTests`, so a run with no acceptance tests still exits successfully.
- **Problem and impact:** The current script can be treated as evidence that the acceptance map passed.
- **Recommended resolution:** The command that claims those criteria is `vitest run` without `--passWithNoTests`.
- **User/product decision required:** NO
- **Status:** OPEN

## Primary-agent disposition

The revisions below were applied after this review. They are pending a re-review. No product rule was added.

| Finding | Action | Status |
|---|---|---|
| TDR-REV-010 through TDR-REV-021 | Revised in the stage 3 documents as listed above. | ADDRESSED. A later read-only pass found each one resolved and added no TDR-REV-022. |

The re-review found the detailed design complete enough to present for user review. It does not approve the design.

That sentence is superseded by the pass below. The pass that claimed no TDR-REV-022 did not see the residuals in the current text.

## Detailed-design re-review

- Review date: 2026-11-19
- Gate: Detailed Design Review Gate
- Reviewer: Technical Design Reviewer (independent, read-only), agent e93fde60-7207-41b5-a26f-0079b5bbd80b
- Overall result: Changes required before user review. This pass does not approve the technical design.
- TDR-REV-001 through TDR-REV-009 were not reopened. TDR-REV-010 through TDR-REV-021 were not reused. New findings start at TDR-REV-022.

### Scope reported

The reviewer read `TECHNICAL_DESIGN.md`, the reviewer role, the approved PRD, DEC-006 through DEC-011, `00-repository-analysis.md` through `09-test-strategy.md`, the technical decision log, both review reports, root `package.json`, `pnpm-workspace.yaml`, `apps/desktop/package.json`, `apps/desktop/src/main/index.ts`, `apps/desktop/src/preload/index.ts`, and `docs/architecture/overview.md`. A package-name search found `@app/website`, `@app/admin`, and `@app/api` only in their own package names. Tests were not run. The time-zone package was not executed. No product decision was made.

### Residuals the reviewer reported

- TDR-REV-014 only partly closed: the domain text still said the event id is allocated at create.
- TDR-REV-016 only partly closed: the second process was told to focus a window it does not own.
- TDR-REV-020 only partly closed: section 1 of the stage 1 baseline still said every boundary is unassigned.

### TDR-REV-022

- **Severity:** HIGH
- **Affected design section and PRD requirement(s):** `03-domain-model.md` section 5; `05-application-design.md` sections 3 and 8. BR-4, BR-5, AC-020, AC-021, AC-037, AC-047, AC-048, AC-049.
- **Evidence and concrete scenario:** A member projection listed owner, title, location, description, and instants, and did not list `id`. `modifyEvent` and `deleteEvent` require `eventId`. Overlap is allowed, so owner plus start plus end is not unique. `createEvent` also listed `eventId` as a renderer field while saying the coordinator creates that id.
- **Problem and impact:** The open window cannot name the event it shows. A renderer-supplied id can also be the id the domain stores if the coordinator does not ignore it.
- **Recommended resolution:** Put `id` on every projected event. The coordinator always mints the create id and ignores an id on the renderer payload.
- **User/product decision required:** NO
- **Status:** OPEN

### TDR-REV-023

- **Severity:** HIGH
- **Affected design section and PRD requirement(s):** `05-application-design.md` sections 4 and 5; `07-concurrency-and-consistency.md` section 1. BR-2, BR-5, AC-004, AC-019, TD-002.
- **Evidence and concrete scenario:** The queue ran team commands. `bind` was not a team-record command. Bind decided membership from a file read, then stored the session email and pushed a projection. A removal can commit between that read and that push.
- **Problem and impact:** The bind path can project the pre-removal record, including only-self events, after removal has deleted them.
- **Recommended resolution:** Run the membership check, the session-email update, and the post-bind projection on the same queue. Project from the record loaded at that turn.
- **User/product decision required:** NO
- **Status:** OPEN

### TDR-REV-024

- **Severity:** MEDIUM
- **Affected design section and PRD requirement(s):** `03-domain-model.md` section 5; `05-application-design.md` section 7. BR-1, BR-5, AC-001, AC-002, AC-019, AC-050.
- **Evidence and concrete scenario:** `no-access` covered no stored email, a removed email, and absent or dissolved. After sole-member dissolution, the founder's session received the same projection as a removed member on an active team.
- **Problem and impact:** AC-050 and AC-001 have no view state that distinguishes a team the operator may create from an active team the operator may not see.
- **Recommended resolution:** Include `record: absent | active | dissolved` on every projection. Still omit roster, events, invites, and busy rows unless that actor may see them.
- **User/product decision required:** NO
- **Status:** OPEN

### TDR-REV-025

- **Severity:** MEDIUM
- **Affected design section and PRD requirement(s):** `03-domain-model.md` section 4; `05-application-design.md` sections 3 and 7. BR-4, DEC-006, AC-029, AC-046.
- **Evidence and concrete scenario:** An omitted start or end keeps the stored instant. A present civil time is converted again. The renderer contract did not require a title-only or location-only edit to omit the clock fields.
- **Problem and impact:** A form that round-trips displayed clock times writes new instants when the operator did not change that end or start.
- **Recommended resolution:** The renderer sends a start or end only when that field was edited or when it is supplying an occurrence for a field the coordinator just reported.
- **User/product decision required:** NO
- **Status:** OPEN

### TDR-REV-026

- **Severity:** MEDIUM
- **Affected design section and PRD requirement(s):** `03-domain-model.md` section 5; `05-application-design.md` sections 1 and 8; `09-test-strategy.md`. BR-6, AC-016, AC-017, AC-040, AC-042, AC-045.
- **Evidence and concrete scenario:** `busyAt` is a domain function. The board was computed in the renderer. The renderer was forbidden to import the domain.
- **Problem and impact:** AC-016 can pass in the domain while the screen uses a second copy of the half-open rule.
- **Recommended resolution:** One implementation. The renderer may import the pure `busyAt` function, or the preload answers `busyAt(instant)` from the main process.
- **User/product decision required:** NO
- **Status:** OPEN

### TDR-REV-027

- **Severity:** MEDIUM
- **Affected design section and PRD requirement(s):** `06-security-and-access-control.md` section 5; `07-concurrency-and-consistency.md` section 1. BR-7. Residual of TDR-REV-016.
- **Evidence and concrete scenario:** The second process was told to focus the existing window. The window belongs to the first process. `apps/desktop/src/main/index.ts` has no single-instance lock and no `second-instance` handler.
- **Problem and impact:** The operator-visible half of the single-writer rule is not assigned to the process that can perform it.
- **Recommended resolution:** The first process handles `second-instance` by focusing its window and showing that a writer already exists. The second process exits without reading or writing.
- **User/product decision required:** NO
- **Status:** OPEN

### TDR-REV-028

- **Severity:** MEDIUM
- **Affected design section and PRD requirement(s):** `03-domain-model.md` sections 1 and 4; `02-architecture.md` section 2. BR-1, AC-001, AC-025, AC-050.
- **Evidence and concrete scenario:** The domain is a pure function. A successful create allocates a new opaque generation. Event ids have a supplier. Generations did not.
- **Problem and impact:** Create cannot both stay pure and mint an unpredictable generation. A random generation makes value comparisons of successful creates unstable.
- **Recommended resolution:** The coordinator supplies the next generation string on `createTeam` only. The domain stores that string and does not mint entropy.
- **User/product decision required:** NO
- **Status:** OPEN

### TDR-REV-029

- **Severity:** MEDIUM
- **Affected design section and PRD requirement(s):** `05-application-design.md` sections 2 and 5; `apps/desktop/src/main/index.ts`. BR-7, AC-024, TD-001.
- **Evidence and concrete scenario:** On darwin, `window-all-closed` does not quit, and `activate` creates a `BrowserWindow` when none exist. That handler is outside the coordinator.
- **Problem and impact:** The next dock click can open a window with no session, so AC-024's later view has no specified path after the last window closes.
- **Recommended resolution:** Every window, including the darwin `activate` window, is created and registered by the coordinator. An unregistered window is not shown.
- **User/product decision required:** NO
- **Status:** OPEN

### TDR-REV-030

- **Severity:** LOW
- **Affected design section and PRD requirement(s):** `01-technical-requirements.md` section 1 and the tables in sections 3 and 4. BR-1 through BR-7. Residual of TDR-REV-020.
- **Evidence and concrete scenario:** The header pointed at TD-001 and TD-002, but section 1 still said every boundary is Unassigned, and the table rows still said Unassigned, Q-REC, and Q-ACT.
- **Problem and impact:** A reader of section 1 can treat record placement and session binding as still open.
- **Recommended resolution:** Change section 1 and the Open column so they match the header. Leave the PRD unchanged.
- **User/product decision required:** NO
- **Status:** OPEN

## Disposition of TDR-REV-022 through TDR-REV-030

No finding required a product decision. The primary designer revised the stage 3 documents. These revisions are pending re-review.

| Finding | Revision | Status |
|---|---|---|
| TDR-REV-022 | Projected events include `id`. `createEvent` from the renderer has no id. The coordinator mints the id and ignores a payload id. | ADDRESSED. Focused re-review on 2026-11-19 found the current text satisfied and added no TDR-REV-031. |
| TDR-REV-023 | `bind` runs on the command queue. The membership check, session update, and projection use one load. | ADDRESSED. Same re-review. |
| TDR-REV-024 | Every projection includes `record`. Create is offered from absent or dissolved. Active plus `no-access` is not a create state. | ADDRESSED. Same re-review. |
| TDR-REV-025 | A clock field is sent only when edited, or when resubmitting an occurrence for the field just reported. | ADDRESSED. Same re-review. |
| TDR-REV-026 | The renderer may import `busyAt` and no other domain export. The board does not keep a second rule. | ADDRESSED. Same re-review. |
| TDR-REV-027 | The first process handles `second-instance` and focuses its window. The second process exits without reading, writing, or focusing. | ADDRESSED. The current shell still has no lock. That is unimplemented design, not an open design sentence. |
| TDR-REV-028 | The coordinator supplies the generation string on `createTeam`. The domain stores it and does not mint entropy. | ADDRESSED. Same re-review. |
| TDR-REV-029 | The coordinator creates and registers every window, including the window opened when none are open. An unregistered window is not shown. | ADDRESSED. The current `activate` handler is unimplemented design. |
| TDR-REV-030 | Section 1, the business-rule boundary, and the open column now name `@app/desktop`, TD-001, and TD-002. The PRD is unchanged. | ADDRESSED. Same re-review. |

The focused re-review was read-only. It found TDR-REV-022 through TDR-REV-030 satisfied and added no TDR-REV-031. It does not approve the technical design. The design is READY FOR USER REVIEW.
