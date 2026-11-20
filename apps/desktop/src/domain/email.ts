export type CanonicalEmail = { ok: true; email: string } | { ok: false };

export function canonicalize(input: string): CanonicalEmail {
  const trimmed = input.trim();
  const at = trimmed.indexOf('@');
  if (at <= 0 || at !== trimmed.lastIndexOf('@') || at === trimmed.length - 1) {
    return { ok: false };
  }
  if (/\s/u.test(trimmed)) return { ok: false };
  return { ok: true, email: trimmed.toLowerCase() };
}
