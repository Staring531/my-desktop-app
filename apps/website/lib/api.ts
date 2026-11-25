export type Conflict = { title: string; start: string; end: string };

export type Occurrence = {
  id: string;
  state: 'scheduled' | 'skipped' | 'choice_required';
  visibility: 'public' | 'private';
  title: string;
  location: string;
  description: string;
  displayName: string;
  date: string;
  start?: string;
  end?: string;
  originalStart?: string;
  instants?: string[];
};

export type ApiBody = {
  result: string;
  conflicts?: Conflict[];
  continuesAfterWindow?: boolean;
  monthTypes?: string[];
  missingDates?: string[];
  instants?: string[];
  occurrences?: Occurrence[];
};

const FAILURES = new Set([
  'registration_rejected',
  'verification_rejected',
  'cancellation_rejected',
  'login_rejected',
  'recovery_rejected',
  'send_failed',
  'operation_failed',
  'save_rejected',
  'not_found',
  'account_gone',
  'logged_out',
]);

export function isFailure(result: string): boolean {
  return FAILURES.has(result);
}

export function hidesSignedFields(result: string | undefined): boolean {
  return result === 'logged_out' || result === 'not_found';
}

export async function sendJson(path: string, method: string, body?: unknown): Promise<ApiBody> {
  try {
    const response = await fetch(path, {
      method,
      credentials: 'include',
      ...(body === undefined
        ? {}
        : { headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }),
    });
    return (await response.json()) as ApiBody;
  } catch {
    return { result: 'operation_failed' };
  }
}

export function browserTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
