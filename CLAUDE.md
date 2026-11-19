# Claude Code Project Instructions

For product discovery and requirements work, read and follow `PRODUCT_DISCOVERY.md` as the canonical process.

When the user asks to start or continue product discovery:
1. Invoke the `product-discovery` skill when available.
2. Read the relevant product documents and `docs/product/03-decision-log.md`.
3. Reuse documented context and ask only the next consequential unanswered question.
4. Keep recommendations separate from user-confirmed decisions.
5. Do not implement features or modify application code during discovery.

The shared workflow defines decision statuses, interview stages, approval gates, and documentation boundaries. Do not create a competing process in this file.
