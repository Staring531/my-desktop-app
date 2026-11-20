import type { CommandResult, PushedProjection, RendererCommand } from '../../contract/api.js';

export type DesktopApi = {
  platform: string;
  bind: (requestedEmail: string) => Promise<CommandResult>;
  openSession: () => Promise<unknown>;
  command: (command: RendererCommand) => Promise<CommandResult>;
  onProjection: (handler: (projection: PushedProjection) => void) => () => void;
  onWriter: (handler: () => void) => () => void;
};

declare global {
  interface Window {
    desktop: DesktopApi;
  }
}
