# Personal Time Design Token Data

`design-tokens.json` is the machine-readable token baseline for the personal-time website.

- Current status: APPROVED by the user on 2026-11-25. `meta.tokenBaselineApproved` is true. This approval does not authorize application code.
- This file does not replace `docs/ui-ux/tokens/design-tokens.json`. That baseline was approved on 2026-11-20 for `docs/product/04-prd.md`. Its values are not reused here.
- Format: Design Tokens Community Group groups `primitive`, `semantic`, and `component`, with `$type` and `$value`. Aliases use `{group.token}` references.
- Stack inspected on 2026-11-25: `apps/website` is Next.js 15 and React 19. It has no stylesheet, font file, icon set, or token compiler. The proposed later mapping is plain CSS custom properties. This stage installs nothing and writes no application code.
- Follow `../10-design-tokens.md` for rationale, contrast, and usage.
- Keep this JSON valid; do not add comments.
- User approval of this baseline must be recorded before changing `meta.status` to APPROVED or `meta.tokenBaselineApproved` to true.
