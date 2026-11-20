# Component Specifications

## Purpose
Define reusable UI contracts for components required by the approved screen inventory. This is a design specification, not a mandate to build a new component library.

## Component contract template
For each component document:
- ID/name, purpose, user task, and applicable actors.
- Anatomy/slots and content hierarchy.
- Variants, sizes, and approved token dependencies.
- States: default, hover, focus-visible, active, disabled, loading, success/error, and destructive where applicable.
- Inputs, outputs, event/command semantics, and validation/feedback behavior.
- Keyboard operation, focus order/management, accessible name/description, and contrast.
- Desktop resizing/overflow behavior.
- Usage guidance, when-not-to-use guidance, and anti-patterns.
- Screens/flows/PRD ACs using the component.

## Candidate component families
Only confirm after Stage 0 and screen inventory: application shell/navigation; buttons; text/email/date/time fields; selectors/visibility controls; event rows/cards and busy/free indicators; member/invitation items; dialogs; feedback/notifications; loading/empty/error/no-access states.

## Consistency rules
Prefer existing components if they meet the contract. A page must not create a near-duplicate component without documenting why. Shared component changes require impact analysis across every consuming screen. Component states must be specified before page-level use.
