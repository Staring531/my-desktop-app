# Domain Model

- Stage: 3 — Detailed Technical Design
- Date: 2026-11-19
- Status: APPROVED by the user on 2026-11-19. This approval does not authorize application code.
- Authority: `docs/product/04-prd.md` version 0.1 draft, APPROVED (DEC-011); `docs/technical/02-architecture.md`
- This file defines the pure team record. It does not choose screens, a database product, or a time-zone library.

The domain module is a pure function of the current record and one command. It does not read the clock, the file, or the renderer, and it does not mint entropy. The coordinator supplies the actor email, the IANA zone, the generation stamp, the next generation string on `createTeam`, and the event id on `createEvent`.

## 1. Values

### Canonical email

`canonicalize(input)`:

1. Trim leading and trailing whitespace.
2. Reject unless the remainder has exactly one `@`, no whitespace anywhere, and at least one character on each side.
3. Return the remainder in full lowercase.

This is the only stored form for roster entries, invites, the maintainer, and event owners (BR-1, DEC-008). Comparison uses this form, so `Sam@Team.com` and `sam@team.com` are the same email.

### Instant

An event start or end is an absolute instant. The stored form is the instant, not a civil time and not a zone. The busy interval includes the start and excludes the end.

### Civil time

A civil time entered for one save is `{ year, month, day, hour, minute }` in the zone the coordinator supplies. The minute is the precision the acceptance criteria use. The conversion treats seconds as 0. An omitted start or end on a modify means "this instant was not entered" and the stored instant stays (DEC-006, AC-029).

### Occurrence

`earlier` or `later`. It is present only when the operator has chosen which of two real occurrences to store. Absence of a choice is not a default (AC-028).

### Generation

A team generation is an opaque string. The coordinator supplies it on `createTeam` only. The domain stores that string and does not create one. The absent record has no generation. A save, invite, membership change, or dissolution does not allocate a new generation. The next create after dissolution stores the next supplied string (AC-050).

## 2. Record

```text
TeamRecord =
  | { status: 'absent' }
  | { status: 'active', generation, maintainerEmail, roster, invites, events }
  | { status: 'dissolved', generation }

RosterEntry = { email }
Invite = { email }
ScheduleEvent = {
  id,
  ownerEmail,
  visibility: 'team-visible' | 'only-self',
  title,
  location,
  description,
  start,
  end
}
```

| Field | Constraint |
|---|---|
| `roster` | Current members only. One entry per canonical email. |
| `maintainerEmail` | Exactly one roster email while the team is active. |
| `invites` | Pending invites only. One per canonical email. The email is not a current member. |
| `events.id` | Unique in the record. The coordinator supplies it on create. The domain places that string and rejects a duplicate or an empty id. Not reused. |
| `events.ownerEmail` | Canonical email of the member who created it. It remains after that member is removed. |
| `title` | Non-empty after outer trim. Internal spaces, tabs, and newlines remain. |
| `location`, `description` | Outer trim. Empty after trim is stored as `''`. Internal whitespace remains. |
| `end` | Strictly after `start`. |

Removed is not a stored row. An email is a current member when it is in `roster`, invited when it is in `invites`, and otherwise not a participant. Retained events are enough to show a removed owner's past team-visible events.

## 3. Lifecycle

| Object | Transition | Result |
|---|---|---|
| Team | Create from absent or dissolved | New `active` record, new generation, one roster email, that email is maintainer, no invites, no events. |
| Team | Create while active | No write (AC-002). |
| Team | Dissolve by the sole member | Same generation, `dissolved`, roster, invites, events, and maintainer removed (AC-023). |
| Team | Dissolve while two or more members | No write (AC-011). |
| Maintainer | Designate another current member | That member becomes the only maintainer immediately. The previous maintainer stays on the roster (AC-009). |
| Maintainer | Designate self | No write (AC-039). |
| Invite | Maintainer invites a usable email that is not a member and has no pending invite | One pending invite. It does not expire by time and survives succession (AC-008). |
| Invite | Accept by that email | Email becomes a current member. Invite is removed. Maintainer does not change (AC-030). |
| Invite | Decline by that email, or cancel by the maintainer | Invite is removed. Roster does not change (AC-032, AC-033). |
| Membership | Maintainer removes another current member | Email leaves the roster. That owner's `only-self` events are deleted. Team-visible events stay team-visible and keep `ownerEmail` (AC-019). |
| Event | Current member creates | Event is attributed to that member. Overlap and a past end are allowed (AC-044, AC-045). |
| Event | Owner, while a current member, saves | Fields and visibility follow the save rules. Either visibility may be stored. |
| Event | Maintainer saves a retained team-visible event whose owner is not a current member | Text and entered clock times may change. A visibility change writes nothing, including any title sent with it (AC-020). |
| Event | Owner accepts a later invite | That member again is the only editor. The maintainer's custody ends. Deleted only-self events stay deleted (AC-022, AC-049). |

## 4. Commands

Every command includes the actor email and the generation stamp supplied by the coordinator. The domain does not trust a generation, email, or zone from the renderer.

| Command | Writes only when |
|---|---|
| `createTeam` | The loaded record is still the stamped base. Absent stamp and a still-absent record may store the supplied generation as the first generation. Dissolved stamp and a still-dissolved record may store the supplied generation as the next generation. The supplied generation is a non-empty string. Actor email is usable. Any other loaded record does not write. |
| `invite` | Active, stamp matches, actor is maintainer, target is usable, not a current member, and has no pending invite. |
| `cancelInvite` | Active, stamp matches, actor is maintainer, a pending invite exists for the target. |
| `acceptInvite` / `declineInvite` | Active, stamp matches, a pending invite exists for the actor. |
| `designate` | Active, stamp matches, actor is maintainer, target is a different current member. |
| `removeMember` | Active, stamp matches, actor is maintainer, target is a different current member. |
| `dissolve` | Active, stamp matches, actor is the sole roster member. |
| `createEvent` | Active, stamp matches, actor is a current member, the supplied id is non-empty and not already in the record, payload passes the save rules, and it is not marked recurring or all-day. An id on the renderer payload is not this id. |
| `modifyEvent` | Active, stamp matches, the event exists, the actor may edit it, and the payload passes the save rules. |
| `deleteEvent` | Active, stamp matches, the event exists, and the actor may delete it. |

Any other combination returns a rejection and the same record.

Save rules for create and modify:

- Visibility is explicit on create. On modify, omitting visibility keeps the stored visibility.
- Title is present on create. On modify, omitting title keeps the stored title. A present title is trimmed and must be non-empty.
- Location and description, when present, are trimmed and may be empty.
- A present start or end is converted in the supplied zone. A missing occurrence on an ambiguous civil time rejects the save. A nonexistent civil time rejects the save. An omitted start or end keeps the stored instant. A modify that sends a clock field converts it again, so a location-only edit omits both clock fields (AC-029).
- The resulting end is after the resulting start.
- A payload marked recurring or all-day rejects the save (AC-051). There is no stored recurrence rule and no date-only event.

Edit rights:

- The current-member owner may modify or delete the event, including switching visibility.
- The maintainer may modify text and entered times, or delete, only while the owner is not a current member and the event is team-visible.
- That maintainer save rejects before any field changes when the payload includes a different visibility (AC-020).
- No other actor may modify or delete (AC-037).

A command whose stamp does not match the record generation returns `generation-mismatch` and does not write. A save, invite, or membership command whose stamp matches a dissolved record returns `dissolved` and does not write. `createTeam` is the only command that may follow dissolution.

## 5. Projection

`project(record, actor)` returns the events, roster, and invites the coordinator may send. It is not the stored document. Every projection includes `record`: `absent`, `active`, or `dissolved`. That field is present even when roster, events, and invites are omitted. `busyAt(projection, actor, instant)` is the only half-open implementation. The board calls that function. The pushed projection does not freeze busy rows.

| Actor situation | Projection |
|---|---|
| No stored email, or an email that is not a member and has no pending invite | `no-access`, plus `record`. No roster, events, invites, or busy rows. |
| Pending invite for that email, and the email is not a current member | `record: active` and `invite` containing only that pending address. |
| Current member | `record: active` and `member`. |

A `member` projection contains:

- The actor email and whether that actor is the maintainer.
- The current roster.
- Pending invites only when the actor is the maintainer. Each entry is the invited email.
- Every team-visible event, with `id`, owner, and full title, location, description, and instants, including events that ended and events created before the actor joined.
- The actor's own only-self events, with `id`, and no other member's only-self events.

Busy rows are not frozen into that payload. `busyAt` produces them for the instant being viewed, including "now" at display time. The board calls that function and does not reimplement it:

- One row per current member. A removed owner has no row.
- The viewer's own row is busy when any of that viewer's team-visible or only-self events covers the instant.
- Another member's row uses only that member's team-visible events.
- Coverage is half-open: start ≤ instant < end.

Clock labels format each stored instant with `zone`'s offset at that instant. They do not reuse the computer's current offset for every instant. Labels are not stored.

## 6. Invariants checked before a write

- At most one active record.
- Active record has one maintainer, and that email is in the roster.
- No duplicate roster email, invite email, or event id.
- No invite for a current member.
- Every event end is after its start, visibility is one of the two values, and title is non-empty.
- A rejected command returns the input record unchanged.

The coordinator writes only when the domain returns a new record.
