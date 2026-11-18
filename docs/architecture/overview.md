# Architecture overview

## Initial topology

This repository uses a pnpm workspace with four independently deployable applications:

- Desktop: Electron main/preload processes and a React renderer.
- Website: Next.js public web application.
- Admin: Next.js administration application.
- API: NestJS HTTP service.

Shared packages are reserved for stable cross-application contracts and genuinely reusable code. Applications must not import another application's internal implementation.

## Current decisions and open questions

- Language: TypeScript with strict compiler options.
- Workspace: pnpm.
- Desktop runtime: Electron.
- Web framework: Next.js.
- API framework: NestJS.
- Database, authentication provider, hosting provider, observability stack, and release distribution strategy: undecided.
- Product domain and business workflows: awaiting requirements.

## Security boundaries

The API is the trust boundary for server-side operations. The desktop renderer is untrusted input. Validate and authorize requests server-side; never embed privileged credentials in client applications. Production access and deployment require explicit human approval.
