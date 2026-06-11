import { describe, it, expect } from "vitest";
import { CELEBRATION_PHRASES, pickCelebration } from "../../src/data/celebration-phrases";

describe("celebration phrases", () => {
  it("tem frases e nenhuma vazia", () => {
    expect(CELEBRATION_PHRASES.length).toBeGreaterThan(5);
    for (const p of CELEBRATION_PHRASES) expect(p.trim().length).toBeGreaterThan(0);
  });

  it("pickCelebration é determinístico com rand injetado e fica no range", () => {
    expect(pickCelebration(0)).toBe(CELEBRATION_PHRASES[0]);
    expect(pickCelebration(0.999)).toBe(CELEBRATION_PHRASES[CELEBRATION_PHRASES.length - 1]);
    expect(CELEBRATION_PHRASES).toContain(pickCelebration());
  });
});
