import type { CivilTime, Occurrence } from '../domain/time.js';
import type { Projection, ScheduleEvent, Visibility } from '../domain/types.js';

export type RendererCommand =
  | { name: 'createTeam' }
  | { name: 'invite'; email: string }
  | { name: 'cancelInvite'; email: string }
  | { name: 'acceptInvite' }
  | { name: 'declineInvite' }
  | { name: 'designate'; email: string }
  | { name: 'removeMember'; email: string }
  | { name: 'dissolve' }
  | {
      name: 'createEvent';
      visibility: Visibility;
      title: string;
      location?: string;
      description?: string;
      start: CivilTime;
      end: CivilTime;
      startOccurrence?: Occurrence;
      endOccurrence?: Occurrence;
      recurring?: boolean;
      allDay?: boolean;
    }
  | {
      name: 'modifyEvent';
      eventId: string;
      visibility?: Visibility;
      title?: string;
      location?: string;
      description?: string;
      start?: CivilTime;
      end?: CivilTime;
      startOccurrence?: Occurrence;
      endOccurrence?: Occurrence;
      recurring?: boolean;
      allDay?: boolean;
    }
  | { name: 'deleteEvent'; eventId: string };

export type PushedProjection = Projection & {
  zone: string;
  offsets: Record<string, string>;
};

export type CommandResult =
  | { ok: true; projection: PushedProjection }
  | { ok: false; code: string; field?: 'start' | 'end'; earlier?: string; later?: string };

export type Diagnostic = {
  time: string;
  command: string;
  code: string;
  generation: string;
};

export type VisibleEvent = ScheduleEvent;

export const DESKTOP_CHANNELS = {
  bind: 'desktop:bind',
  openSession: 'desktop:open-session',
  command: 'desktop:command',
  projection: 'desktop:projection',
  writer: 'desktop:writer',
} as const;
