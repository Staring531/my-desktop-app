# Design Token Data

`design-tokens.json` is the machine-readable design-token baseline.

- Current status: APPROVED by the user on 2026-11-20. `meta.tokenBaselineApproved` is true. This approval does not authorize application code.
- Format: Design Tokens Community Group groups `primitive`, `semantic`, and `component`, with `$type` and `$value`. Aliases use `{group.token}` references.
- The Electron renderer has no styling framework. The proposed later mapping is plain CSS custom properties. This design stage installs nothing.
- Follow `../10-design-tokens.md` for rationale, contrast, and usage.
- Keep this JSON valid; do not add comments.
- User approval of the token baseline must be recorded before changing `meta.status` to APPROVED or `meta.tokenBaselineApproved` to true.
