# Agent Development Lifecycle

> This file is a visual overview only. The binding repository-wide lifecycle, stage order, approval gates, and agent operating rules are defined in [DEVELOPMENT_WORKFLOW.md](DEVELOPMENT_WORKFLOW.md). All agents must read that file before repository work. The Chinese canonical translation is [DEVELOPMENT_WORKFLOW-zh.md](DEVELOPMENT_WORKFLOW-zh.md).

Detailed stage procedures are defined in PRODUCT_DISCOVERY.md, TECHNICAL_DESIGN.md, and UI_UX_DESIGN.md.

~~~mermaid
flowchart TD
 A["Product Discovery<br/>Product Interviewer"] --> B["Requirements Baseline Gate<br/>Requirements Reviewer"]
 B --> C["PRD Draft Gate<br/>PRD Quality Auditor"]
 C --> D["User approves PRD"]
 D --> E["Technical Design<br/>Technical Designer"]
 E --> F["Architecture Baseline Gate<br/>Technical Design Reviewer"]
 F --> G["Detailed Design Gate<br/>Technical Design Reviewer"]
 G --> H["User approves Technical Design"]
 H --> I["Implementation Planning<br/>Implementation Planner"]
 I --> J["UI/UX Readiness Analysis<br/>UI/UX Designer"]
 J --> K["Information Architecture & User Flows"]
 K --> L["Screen Inventory & Wireframes"]
 L --> M["Interaction & Visual Design"]
 M --> N["UI/UX Design Review Gate<br/>UI/UX Design Reviewer"]
 N --> O["Implementation Readiness Report"]
 O --> P["User approves UI/UX Design"]
 P --> Q["Implementation Plan alignment / handoff"]
 Q --> R{"Separate coding authorization?"}
 R -- "No" --> S["Stop: no application code"]
 R -- "Yes" --> T["Coding & Testing"]
 T --> U["Implementation verification / PR review"]
~~~

## Governance
- Reviewers are independent read-only roles and return findings only; primary agents own canonical edits and user communication.
- Findings and stage completion are not user approval.
- Disclose unavailable native subagent delegation; never label self-check as independent review.
- Prompt restrictions are not tool-level security. Verify platform sandbox/read-only controls where available.
- Preserve approved PRD scope throughout all later stages.
- UI/UX specifies presentation and interaction; it does not change business rules or architecture.
- Planning and UI/UX approval do not authorize coding. Coding requires separate explicit authorization.
- Do not commit, push, merge, or release unless separately authorized.
