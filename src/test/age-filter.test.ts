import { describe, expect, it } from "vitest";
import { ageFromDob, dobForAge } from "@/lib/constants";

describe("age filter", () => {
  const now = new Date(2026, 9, 21);
  it("dobForAge(25) is the latest birth date of a 25-year-old", () => {
    expect(dobForAge(25, now)).toBe(new Date(2001, 9, 21).toISOString().slice(0, 10));
  });
  it("ageFromDob counts full years", () => {
    expect(ageFromDob("2000-01-01")).toBeGreaterThanOrEqual(26);
  });
});
