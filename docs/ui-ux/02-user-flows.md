# User Flows

Flows describe interaction sequencing, not new business rules. Map every flow to approved PRD requirements/ACs.

## Required flows
1. Create the single team.
2. Maintainer invitation → invitee sees only own pending invitation → accept/decline; maintainer cancellation.
3. Open busy/free overview and inspect current members and team-visible events.
4. Create event with required title, start/end, explicit visibility, local-time gap/overlap handling, save/cancel.
5. Modify own event; failure/cancel leaves stored data unchanged.
6. Creator changes event visibility through successful save.
7. Delete event with clear confirmation and cancellation path.
8. Maintainer transfers role to another current member.
9. Maintainer removes member; access and event retention/deletion follow PRD.
10. Removed member rejoins through a later invitation.
11. Sole member dissolves team with destructive confirmation.
12. Session binding and no-access states strictly follow TD-002; no identity-verification flow.

## Flow diagram requirements
Use Mermaid. Include actor/precondition, user action, UI validation, command/result boundary, success, failure/cancel, and applicable AC IDs.

## Constraints
UI confirmation does not replace domain authorization. Renderer state is not authoritative for permissions or committed data. Do not promise rollback, retry, notification, or offline behavior beyond approved contracts.
