export type CivilTime = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

export type Occurrence = 'earlier' | 'later';

export type ConvertResult =
  { ok: true; instant: string } | { ok: false; reason: 'nonexistent' | 'ambiguous' | 'invalid' };

export type TimePort = {
  convert: (zone: string, civilTime: CivilTime, occurrence?: Occurrence) => ConvertResult;
};

export type LabelPort = {
  offsetAt: (zone: string, instant: string) => string;
};

export function formatClockLabel(zone: string, instant: string, labels: LabelPort): string {
  return `${instant} ${labels.offsetAt(zone, instant)}`;
}
