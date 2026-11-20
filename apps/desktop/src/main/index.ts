import { randomUUID } from 'node:crypto';
import { app, BrowserWindow, ipcMain } from 'electron';
import { join } from 'node:path';
import { DESKTOP_CHANNELS } from '../contract/api.js';
import { createCoordinator, type Coordinator } from './coordinator/index.js';
import { showIfRegistered, startOwner } from './owner.js';
import { createFileStore } from './store/index.js';
import { createTemporalPort } from './time/temporal.js';

const registered = new Set<string>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function begin(): { openWindow: () => void; focusWriter: () => void; windowCount: () => number } {
  const port = createTemporalPort();
  const coordinator = createCoordinator({
    store: createFileStore(app.getPath('userData')),
    time: port,
    labels: port,
    zone: () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    mintId: () => randomUUID(),
    now: () => new Date().toISOString(),
  });
  const sessions = new Map<number, string>();
  registerIpc(coordinator, sessions);
  coordinator.onWriter(() => {
    const window = BrowserWindow.getAllWindows().find((item) => registered.has(String(item.id)));
    if (window === undefined) return;
    window.show();
    window.focus();
    window.webContents.send(DESKTOP_CHANNELS.writer);
  });
  return {
    openWindow: () => openWindow(coordinator, sessions),
    focusWriter: () => coordinator.focusWriter(),
    windowCount: () => BrowserWindow.getAllWindows().length,
  };
}

function openWindow(coordinator: Coordinator, sessions: Map<number, string>): void {
  const sessionId = coordinator.openSession();
  const window = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  const id = String(window.id);
  registered.add(id);
  sessions.set(window.webContents.id, sessionId);
  coordinator.subscribe(sessionId, (projection) => {
    if (!window.isDestroyed()) window.webContents.send(DESKTOP_CHANNELS.projection, projection);
  });
  window.on('closed', () => {
    registered.delete(id);
    coordinator.closeSession(sessionId);
  });
  showIfRegistered({ id, show: () => window.show() }, registered);
  if (process.env.ELECTRON_RENDERER_URL) void window.loadURL(process.env.ELECTRON_RENDERER_URL);
  else void window.loadFile(join(__dirname, '../renderer/index.html'));
}

function registerIpc(coordinator: Coordinator, sessions: Map<number, string>): void {
  ipcMain.handle(DESKTOP_CHANNELS.bind, (event, payload: unknown) => {
    const sessionId = sessions.get(event.sender.id);
    const email =
      isRecord(payload) && typeof payload.requestedEmail === 'string' ? payload.requestedEmail : '';
    return sessionId === undefined
      ? { ok: false, code: 'unbound-session' }
      : coordinator.bind(sessionId, email);
  });
  ipcMain.handle(DESKTOP_CHANNELS.command, (event, payload: unknown) => {
    const sessionId = sessions.get(event.sender.id);
    return sessionId === undefined
      ? { ok: false, code: 'unbound-session' }
      : coordinator.command(sessionId, payload);
  });
  ipcMain.handle(DESKTOP_CHANNELS.openSession, () => {
    openWindow(coordinator, sessions);
    return { ok: true };
  });
}

startOwner({
  requestLock: () => app.requestSingleInstanceLock(),
  onSecondInstance: (handler) => app.on('second-instance', handler),
  quit: () => app.quit(),
  whenReady: (start) => {
    void app.whenReady().then(start);
  },
  onActivate: (handler) => app.on('activate', handler),
  onAllClosed: (handler) => app.on('window-all-closed', handler),
  platform: process.platform,
  begin,
});
