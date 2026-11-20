export type OwnerApp = {
  openWindow: () => void;
  focusWriter: () => void;
  windowCount: () => number;
};

export function startOwner(deps: {
  requestLock: () => boolean;
  onSecondInstance: (handler: () => void) => void;
  quit: () => void;
  whenReady: (start: () => void) => void;
  onActivate: (handler: () => void) => void;
  onAllClosed: (handler: () => void) => void;
  platform: string;
  begin: () => OwnerApp;
}): void {
  if (!deps.requestLock()) {
    deps.quit();
    return;
  }
  let owner: OwnerApp | undefined;
  deps.onSecondInstance(() => owner?.focusWriter());
  deps.whenReady(() => {
    owner = deps.begin();
    deps.onActivate(() => {
      if (owner !== undefined && owner.windowCount() === 0) owner.openWindow();
    });
    owner.openWindow();
  });
  deps.onAllClosed(() => {
    if (deps.platform !== 'darwin') deps.quit();
  });
}

export function showIfRegistered(
  window: { id: string; show: () => void },
  registered: ReadonlySet<string>,
): void {
  if (registered.has(window.id)) window.show();
}
