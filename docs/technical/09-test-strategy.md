# Test Strategy

- Stage: 3 — Detailed Technical Design
- Date: 2026-11-19
- Status: APPROVED by the user on 2026-11-19. This approval does not authorize application code.
- Authority: PRD AC-001 through AC-051 and `docs/technical/01-technical-requirements.md`

## 1. Layers

| Layer | What it runs | What it does not run |
|---|---|---|
| Domain | Pure commands, projections, canonical email, and time-port results. One case per acceptance criterion, plus the invariant that a rejection returns the same record. | Electron, files, and the screen. |
| Time adapter | `America/New_York` at `2026-03-08 02:30` and `2026-11-01 01:30`, and one zone-label case. | The team rules. |
| Store | Temporary directory: missing file, replace that keeps the original bytes on failure, leftover temp file is ignored, unreadable file is not overwritten. | Product permissions. |
| Coordinator | In-memory store double: stamp at acceptance, one create code when a second create loses the race, queue continues after a failed push, projection differs by session, bind on the queue sees the record at its turn, payload actor, zone, generation, and create id ignored. | A packaged Electron app. |
| Board | Domain `busyAt` on the member projection at a chosen instant and at a later "now". | A second copy of the half-open rule, and a reminder scheduler. |
| Second process | The first process handles `second-instance` by focusing its window. The second launch does not change the fixture and does not focus a window itself. | The full acceptance list. |

The runner is Vitest. The command that claims AC-001 through AC-051 is `vitest run` without `--passWithNoTests`. The current `apps/desktop` script still passes with no tests; that script is not the acceptance gate. Implementation changes the gate command. This design stage does not change `package.json`. A test that is not written yet is not a passing acceptance test.

## 2. Acceptance mapping

Domain tests use a fixed zone and fixed instants except where the criterion names `America/New_York`.

| Criteria | Assertion |
|---|---|
| AC-001, AC-003, AC-050 | Canonical roster and maintainer; unusable input writes nothing; create after dissolution makes a new generation. |
| AC-002 | Second create writes nothing. |
| AC-004, AC-005, AC-006, AC-007, AC-008, AC-030, AC-032, AC-033, AC-034, AC-035, AC-036 | Invite projection, only the invitee accepts or declines, one pending invite, succession keeps it, incomplete invite changes nothing, a new member sees existing team-visible events. |
| AC-009, AC-010, AC-011, AC-038, AC-039 | Maintainer transfer, self-removal, self-designation, ordinary-member roster actions, and multi-member dissolution write nothing. |
| AC-012, AC-013, AC-043, AC-044 | Trim, empty location, kept newline, past event. A domain rejection returns the same record. |
| AC-014, AC-028 | Nonexistent and ambiguous civil times write nothing. A supplied `earlier` or `later` stores that occurrence. |
| AC-015, AC-037 | Invitee, removed email, and non-owner do not change events. |
| AC-016, AC-017, AC-018, AC-040, AC-042, AC-045 | Half-open busy at the instant being viewed, including a later "now" without a new save. Only-self hidden from the other member. Ended event still visible. Free member listed. Labels use the zone offset at each instant, including a January instant and a July instant. Overlap shows both events. |
| AC-019, AC-020, AC-021, AC-022, AC-023, AC-029, AC-041, AC-047, AC-048, AC-049 | Removal, custody title without visibility change, rejected visibility change, rejoin restores the owner and not the maintainer, sole dissolution. An omitted start or end keeps the stored instant. A modify that sends a clock field converts that field. |
| AC-024, AC-046 | After a completed delete, the other open session's projection omits the event. Cancel and a failed save do not change the document and do not appear in the other session's projection. |
| AC-025, AC-026, AC-031 | Completion order on one queue. |
| AC-027 | No result code and no domain API schedules a reminder. A test fails if the domain module grows a reminder export. |
| AC-051 | Recurring and all-day payloads write nothing. |

## 3. Fixtures

- Emails use the PRD strings `Sam@Team.com`, `sam@team.com`, and `sam @team.com` where the criterion names them.
- The spring-forward and fall-back cases use the zone and civil times printed in AC-014 and AC-028.
- Two sessions in coordinator tests are two session ids in one queue, not two processes.
- A rejection test compares the record before and after by value.

## 4. What is not a version 1 test

- A second computer receiving the file.
- Inbox delivery or a login provider.
- Website, admin, and API behavior.
- Visual layout beyond the occurrence choice returning `earlier` or `later` on the command.
