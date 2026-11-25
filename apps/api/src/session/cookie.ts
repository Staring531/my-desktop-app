export const SESSION_COOKIE = 'session';

const sessionIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function serializeSessionCookie(value: string, secure: boolean): string {
  const parts = [
    `${SESSION_COOKIE}=${encodeURIComponent(value)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
  ];
  if (secure) {
    parts.push('Secure');
  }
  return parts.join('; ');
}

export function readPresentedSession(
  cookieHeader: string | undefined,
): { sessionId: string; secret: string } | undefined {
  if (cookieHeader === undefined) {
    return undefined;
  }
  for (const part of cookieHeader.split(';')) {
    const trimmed = part.trim();
    const prefix = `${SESSION_COOKIE}=`;
    if (!trimmed.startsWith(prefix)) {
      continue;
    }
    const raw = decodeURIComponent(trimmed.slice(prefix.length));
    const dot = raw.indexOf('.');
    if (dot <= 0 || dot === raw.length - 1) {
      return undefined;
    }
    const sessionId = raw.slice(0, dot);
    const secret = raw.slice(dot + 1);
    if (!sessionIdPattern.test(sessionId) || secret === '') {
      return undefined;
    }
    return { sessionId, secret };
  }
  return undefined;
}
