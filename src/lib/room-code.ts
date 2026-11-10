export const ROOM_CODE_PATTERN = /^[A-HJ-NP-Z2-9]{5}$/;

export function isValidRoomCode(code: string): boolean {
  return ROOM_CODE_PATTERN.test(code);
}
