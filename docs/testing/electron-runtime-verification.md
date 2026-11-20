# Electron Runtime Verification

- Status: Supplemental implementation verification.
- Baseline: `main` commit `75bc717`.
- The smoke test exercises the built Electron application under a virtual display using Node.js built-ins and Chromium DevTools Protocol. It adds no npm dependency.

## Covered

1. Built renderer startup and preload bridge exposure.
2. Empty bind validation in the real renderer.
3. Bind and create-team IPC to the main process.
4. One event save and persistence in an isolated userData directory.
5. Opening a second unbound BrowserWindow.
6. A second Electron process losing the single-instance lock and displaying the writer notice.
7. Restarting the application and reloading the persisted team and event.

## Not covered

- Installer generation, signing, installation/uninstallation, or updates.
- Native macOS and Windows behavior.
- Screenshot diff or certified contrast measurements.
- Production deployment or release.

A passing smoke test is runtime evidence, not installer acceptance.
