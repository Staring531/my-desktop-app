# Information Architecture: Personal Time

- Stage: 1 — Information Architecture, User Flows, and Screen Inventory
- Date: 2026-11-25
- Status: Accepted by the user on 2026-11-25 as the personal-time structural baseline, including S-01 through S-09 and the paths in section 2. Q-02, Q-03, and Q-04 stay open. This acceptance does not approve visual direction, tokens, wireframes, or application code.
- Authority: `docs/product/06-prd-personal-time.md` version 0.1, APPROVED (DEC-080). Technical design approved on 2026-11-24, including TD-PT-1. Implementation plan approved on 2026-11-25. Stage 0 inspection: `00-design-requirements.md`.
- This file does not replace `docs/ui-ux/01-information-architecture.md`, which belongs to `docs/product/04-prd.md`.
- No independent UI/UX review was run for this stage.

## 1. Navigation principles

- The first delivery is one browser and the existing API. A session is the TD-PT-3 cookie. The page does not keep a second copy of the Calendar and then hide fields.
- A logged-out person, including the owner after logout, can open the unsigned destinations. A guarded destination shows `logged_out` and no Calendar and no Event.
- Another logged-in person has no destination for this person's Calendar, Events, or account.
- Search, another person's public Calendar, sharing links, teams, and the desktop client have no destination.
- The page that sends a command shows that command's `result`. A result is not its own destination.
- The page sends the fields the person entered and renders the body the API returns. It does not recompute an instant, an overlap, a monthly preview, or a proof outcome.
- Shared failures stay shared. No destination explains which value was taken or whether an account exists or is verified.

## 2. Proposed structure

```text
Browser
├── No session
│   ├── S-01 Register
│   ├── S-02 Verify the email
│   ├── S-03 Cancel an unverified registration
│   ├── S-04 Log in
│   ├── S-05 Start recovery
│   └── S-06 Complete recovery
└── This session
    ├── S-07 Own Calendar
    │     └── Generated doubled-start choice is a state of S-07
    ├── S-08 Event
    │     ├── Create, or edit the series or the non-repeating Event
    │     └── One occurrence is a state of S-08, not another destination
    └── S-09 Account
          ├── Nickname
          ├── Timezone
          ├── Log out
          └── Delete the account
```

Proposed paths, for acceptance with this structure:

| Destination | Path |
|---|---|
| S-01 | `/register` |
| S-02 | `/verify` |
| S-03 | `/register/cancel` |
| S-04 | `/login` |
| S-05 | `/recovery` |
| S-06 | `/recovery/complete` |
| S-07 | `/calendar` |
| S-08 create | `/events/new` |
| S-08 existing | `/events/:id` |
| S-09 | `/account` |

These paths are not in the technical design. They are a navigation proposal. The API routes stay the paths already approved under `/api`.

Each unsigned destination can be opened from the other unsigned destinations. A successful login opens S-07. Verification and completed recovery do not open S-07. They return to S-04 for a later login.

Signed-in destinations are S-07, S-08, and S-09. S-07 opens S-08 and S-09. S-08 and S-09 return to S-07. Logout is an action on S-09. After it succeeds, the next guarded request is S-04's logged-out result, and this session's cookie no longer opens S-07.

## 3. Who can open what

| Actor | Destinations | Not opened |
|---|---|---|
| Person with no session | S-01 through S-06 | S-07, S-08, and S-09 content. A direct request shows `logged_out` and no Calendar and no Event. |
| Unverified registrant | S-02 and S-03, still without a session | S-07. Login uses the same `login_rejected` as an unknown email or a wrong password. |
| Verified owner, this session | S-07, S-08 for that owner's Events, S-09 | Another person's Calendar or Event. Search, sharing, and teams. |
| Other logged-in user | That other user's own S-07 | This owner's Calendar and Events. There is no first-delivery route to them. |
| Owner after logout, or after recovery ends the session | S-04, and the other unsigned destinations | The Calendar and Events, until a later login. |

A second session of the same account is another browser session. Logging out of the first does not end the second. The page does not offer a list of sessions. No session length is shown.

## 4. What each signed-in destination holds

S-07 shows the owner's Calendar for one civil-date range. The page sends `from` and `to` and shows the occurrence objects in the returned body: display name, visibility, `scheduled`, `skipped`, and `choice_required`. A required choice lists the two returned instants and can submit one of them. A skipped date and an absent occurrence are not cancelled Events. The owner can tell public from private. The initial range is not decided in this document.

S-08 collects title, start, end, location, description, and visibility. A new Event is private unless public is chosen before the save. Repetition is chosen only while creating: non-repeating, daily, weekly, or monthly. On an existing Event the stored kind is shown and is not sent as a change. An entered missing local time is not sent as a successful save. An entered doubled local time is sent only with one chosen instant. Saving a series or a non-repeating Event uses the save route. Changing one occurrence, including only its visibility, uses the detach route and sends that occurrence's original start instant with the submitted content. Deleting one occurrence uses the occurrence-delete route and that original start instant. Deleting the Event or the series uses the Event-delete route.

S-09 changes the nickname, changes the IANA timezone, logs out this session, and deletes the account. Registration does not ask for a timezone. It sends the browser's IANA name. A later change happens here. There is no email-change field.

Delete account, delete Event, and delete one occurrence each have a confirming step on the same destination. Until the person confirms, the page sends no delete. Cancel sends nothing and leaves the stored account or Event on screen. The visual pattern of that step is later interaction work, not a separate destination.

## 5. Choices proposed for acceptance

| Choice | Proposal |
|---|---|
| Landing after login | S-07. |
| After verification or completed recovery | S-04. Neither command opens the Calendar. |
| Event work | One destination, S-08. One occurrence is a state of that destination. |
| Generated doubled start | A state of S-07. The page submits one instant from the returned pair. |
| Unsigned tasks | Six destinations, so a shared failure is not explained by mixing the forms. |
| Destructive confirmation | A step on S-08 or S-09. Not a new screen. |
| Later deliveries | No destination. |
| Product title | Not chosen. Q-03 stays open. The scaffold title is not this structure. |

## 6. Still open

| ID | Question | What this structure does meanwhile |
|---|---|---|
| Q-03 | The product title that replaces `My Desktop App` | No screen uses an invented title. |
| Q-04 | Which civil dates S-07 requests when it first opens | S-07 always has an explicit `from` and `to`. The initial pair is not part of this proposal. |
| Q-02 | Whether the mail message is a typed code or an opened address | S-02 and S-06 submit a proof code, because that is what the API accepts. The message is not designed. |
