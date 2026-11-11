const PATTERN = /^[A-Za-z0-9_-]{43}$/;

export function newRecoveryCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export const isRecoveryCode = (code: string) => PATTERN.test(code);
