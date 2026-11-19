# Interaction Specifications

For each control specify intent, actor, preconditions, input, validation, command boundary, success/failure, cancellation, and traceability.

## Required interactions
- Email normalization/validation per BR-1/BR-2.
- Explicit event visibility choice.
- Required title; start/end ordering; local-time gap/overlap; preserve unchanged instants.
- Failed/canceled saves leave stored data unchanged.
- Creator-only edit/delete, except the narrow maintainer custody rights for retained team-visible events.
- Maintainer-only invite/cancel/succession/removal; sole-member dissolution.
- Destructive confirmation for removal/dissolution; confirmation is not an authorization boundary.
- Distinguish pending, completed, rejected, and failed operations.
- Prevent accidental duplicate submissions without changing command semantics.

## Feedback taxonomy
Field validation identifies field and correction. Domain rejection does not expose hidden data. Permission denial does not expose unauthorized actions/data. Operation failure says the change did not complete and never presents uncommitted values as saved. Show success only after command completion.

## Time input
Specify local timezone context, daylight-saving gap behavior, explicit occurrence selection for ambiguous times, preservation of unchanged instants, and viewer-local display.
