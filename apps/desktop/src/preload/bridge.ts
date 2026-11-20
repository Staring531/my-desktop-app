import {
  DESKTOP_CHANNELS,
  type CommandResult,
  type PushedProjection,
  type RendererCommand,
} from '../contract/api.js';

export type DesktopBridge = {
  platform: string;
  bind: (requestedEmail: string) => Promise<CommandResult>;
  openSession: () => Promise<unknown>;
  command: (command: RendererCommand) => Promise<CommandResult>;
  onProjection: (handler: (projection: PushedProjection) => void) => () => void;
  onWriter: (handler: () => void) => () => void;
};

export function createDesktopBridge(
  ipc: {
    invoke: (channel: string, payload?: unknown) => Promise<unknown>;
    subscribe: (channel: string, listener: (payload: unknown) => void) => () => void;
  },
  platform = process.platform,
): DesktopBridge {
  return {
    platform,
    bind(requestedEmail) {
      return ipc.invoke(DESKTOP_CHANNELS.bind, { requestedEmail }) as Promise<CommandResult>;
    },
    openSession() {
      return ipc.invoke(DESKTOP_CHANNELS.openSession);
    },
    command(command) {
      return ipc.invoke(DESKTOP_CHANNELS.command, command) as Promise<CommandResult>;
    },
    onProjection(handler) {
      return ipc.subscribe(DESKTOP_CHANNELS.projection, (payload) =>
        handler(payload as PushedProjection),
      );
    },
    onWriter(handler) {
      return ipc.subscribe(DESKTOP_CHANNELS.writer, () => handler());
    },
  };
}
