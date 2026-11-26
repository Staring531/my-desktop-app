# Visual Design: Personal Time Web

- Stage: Web implementation redesign
- Date: 2026-11-26
- Status: Working design draft derived from the approved Personal Time PRD and the user's direction to supersede Agenda.
- Product requirements: `docs/product/06-prd-personal-time.md`.
- Scope: `apps/website` only. This file changes presentation and page composition, not product behavior.
- Token source: `tokens/design-tokens.json`, marked WORKING until visual review and contrast measurement.
- The earlier Agenda painting remains historical. It is not a visual constraint for this redesign.

## 1. Design direction

A contemporary personal productivity workspace: a deep-indigo navigation surface anchors a bright, spacious content area. The interface uses a confident violet action color, layered white surfaces, soft blue-gray canvas, clear type hierarchy, and purposeful grouping. The authentication experience has a separate split-screen composition with a dark editorial panel and a focused form area.

The intended feeling is organized, capable, and calm without looking like a plain document or a generic form page. The UI should make the calendar and event details the visual focus. Cards, contrast, spacing, and navigation provide hierarchy; decoration stays secondary.

## 2. Visual system

| Role | Value |
|---|---|
| Main canvas | `#f4f6fb` |
| Content surface | `#ffffff` |
| Workspace navigation | `#151c34` |
| Primary text | `#172038` |
| Secondary text | `#65708a` |
| Primary action | `#5b5bd6` |
| Soft action surface | `#eef0ff` |
| Divider | `#e5e9f2` |
| Field border | `#d8dfeb` |
| Success cue | `#117a65` with text label |
| Choice-required cue | `#986900` with text label |
| Destructive action | `#b93838` with explicit confirmation |

System sans-serif typography is used. Page titles are 30/38, event titles 17/24, body text 15/23, metadata 12/18, and field labels 13/18. Main surfaces use generous spacing, 18px card corners, 12px control corners, 48px fields, and restrained surface shadows. Focus remains a distinct visible outline.

## 3. Shared workspace shell

Signed-in pages use a left navigation rail on wide screens and a full-width compact navigation header below 820px. The rail contains only the existing first-delivery destinations: Calendar, New event, and Account. It does not introduce another calendar, search, sharing, or team functions.

The content canvas is centered within a readable maximum width. Page headings sit above the working surface, with a concise explanatory subtitle where it helps users understand the task. The navigation state is indicated both visually and by `aria-current`.

On narrow screens, the navigation becomes a horizontal wrapping row. Main content uses one column; event time and details stack without hiding or truncating returned content.

## 4. Authentication surfaces

Register, verify, cancel registration, login, and password recovery use a shared split-screen frame on wide screens. The brand panel carries a short product statement and an abstract calendar-inspired graphic. The form side uses a strong heading, explanatory line, clear labels, full-width controls, and a compact list of the existing account-flow destinations.

On narrow screens, the brand panel becomes a compact top section and the form occupies the remaining width. No social login, account discovery, marketing capture, or new authentication method is introduced.

## 5. Calendar

The calendar range controls sit in a white toolbar surface. From and To remain empty until the user enters dates; Show range becomes visually primary only when both are present.

Each returned date begins a day group. The UI prints the returned date as supplied and does not invent a weekday or recalculate any time. Each occurrence is shown as a card with a prominent time area, event title, visibility and state labels, returned location, description, and display name. Series and This occurrence remain separate actions where the returned data supports them.

The states `scheduled`, `skipped`, and `choice_required` remain explicit text. A skipped occurrence is not styled as cancelled. A choice-required occurrence presents only the instants returned by the API and sends only the selected returned instant. A successful empty range may show a concise empty state; it does not invent an event or sample data.

## 6. Event editor

Event creation and editing use grouped surfaces:
1. Event details: title, start date/time, end date/time, location, and description.
2. Visibility: public or private as labeled choices.
3. Repetition: non-repeating, daily, weekly, or monthly, shown only while creating an event.

A returned doubled-time choice appears only when the response includes the two instants. Existing events do not gain a repetition editor. Save, Cancel, delete, and confirmation remain in the existing flow. Destructive actions use a distinct red treatment and still require the existing explicit confirmation step.

## 7. Account

Account settings group nickname and timezone into separate surfaces, each with its own save action. Security and access groups the existing Log out and Delete account actions. Account deletion remains a confirmed action; no additional profile or session controls are added.

## 8. Interaction and accessibility

- Keep visible labels associated with every input.
- Preserve keyboard order and visible focus indicators.
- Keep returned state words in the UI; color supplements text and never replaces it.
- Waiting remains an in-place status. API result strings remain visible and are not replaced by invented explanations.
- Failures do not identify which registration value is taken or whether an account exists.
- Description keeps line breaks and content is not truncated.
- Page navigation and primary landmarks have accessible names.
- Reduced-motion preferences must not be undermined by decorative animation.

## 9. Requirements boundary

This redesign changes the visual presentation only. It preserves the first-delivery boundary in the PRD: identity and recovery, one personal Calendar, timed Events, visibility, daily/weekly/monthly repetition, conflict warnings, and the user-changeable calendar timezone.

Search, other people's calendars, sharing links, teams, multiple calendars, and desktop-specific interfaces remain out of this Web delivery. API routes, JSON payloads, session cookies, business rules, and server-owned date/time calculations remain unchanged.

## 10. Validation still required

CI type checking, linting, tests, and build are necessary but do not establish visual acceptance. Browser screenshots at wide and narrow viewports, keyboard interaction, and measured contrast remain runtime validation tasks. This working direction is not marked independently accepted until those checks have been reviewed.
