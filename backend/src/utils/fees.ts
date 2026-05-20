const EARLY_BIRD_DEADLINE = new Date("2026-10-14T23:59:59+07:00");

export function calculateFee(type: "student" | "general"): number {
  if (new Date() <= EARLY_BIRD_DEADLINE) {
    return type === "student" ? 500 : 2000;
  }
  return type === "student" ? 700 : 2500;
}

export function isEarlyBird(): boolean {
  return new Date() <= EARLY_BIRD_DEADLINE;
}
