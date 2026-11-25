export function displayName(account: { username: string; nickname: string | null }): string {
  return account.nickname ?? account.username;
}

export function storedNickname(nickname: string | undefined): string | null {
  if (nickname === undefined) {
    return null;
  }
  const trimmed = nickname.trim();
  return trimmed === '' ? null : trimmed;
}
