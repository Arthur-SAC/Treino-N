// tests/data/rotina-natalia-seed.test.ts
import { describe, it, expect } from "vitest";
import { EXERCISES, WORKOUT_PLAN } from "../../src/data/rotina-natalia-seed";

describe("rotina-natalia seed", () => {
  it("tem os 6 templates da semana nos dias certos", () => {
    const byDay = Object.fromEntries(WORKOUT_PLAN.map((t) => [t.dayOfWeek, t.id]));
    expect(byDay[1]).toBe("forca-a");
    expect(byDay[2]).toBe("cardio-ter");
    expect(byDay[3]).toBe("forca-b");
    expect(byDay[4]).toBe("mobilidade-qui");
    expect(byDay[5]).toBe("forca-c");
    expect(byDay[6]).toBe("cardio-sab");
    expect(WORKOUT_PLAN.find((t) => t.dayOfWeek === 0)).toBeUndefined(); // domingo folga
  });

  it("todo exerciseId referenciado existe em EXERCISES", () => {
    const ids = new Set(EXERCISES.map((e) => e.id));
    for (const t of WORKOUT_PLAN) {
      for (const item of t.exercises) {
        expect(ids.has(item.exerciseId), `${t.id} → ${item.exerciseId}`).toBe(true);
      }
    }
  });

  it("marca exercícios por tempo com timeBasedSec", () => {
    const pendura = EXERCISES.find((e) => e.id === "pendura-na-barra")!;
    expect(pendura.timeBasedSec).toBe(20);
    const prancha = EXERCISES.find((e) => e.id === "prancha")!;
    expect(prancha.timeBasedSec).toBe(20);
  });

  it("skills têm videoUrl; exercícios com carga têm frames (2 quadros)", () => {
    const skill = EXERCISES.find((e) => e.id === "parada-de-mao-na-parede")!;
    expect(skill.isSkill).toBe(true);
    expect(skill.videoUrl).toMatch(/youtube\.com/);
    const comum = EXERCISES.find((e) => e.id === "elevacao-lateral")!;
    expect(comum.frames).toEqual([
      "/exercises/elevacao-lateral-0.jpg",
      "/exercises/elevacao-lateral-1.jpg",
    ]);
  });

  it("nenhum exercício aponta pra um .gif inexistente (usamos frames ou vídeo)", () => {
    for (const ex of EXERCISES) {
      expect(ex.gifPath, ex.id).toBeUndefined();
    }
  });

  it("mobilidade de quinta é dividida em 4 blocos (ombro, costas, quadril, tornozelo)", () => {
    const mob = WORKOUT_PLAN.find((t) => t.id === "mobilidade-qui")!;
    expect(mob.exercises.map((e) => e.exerciseId)).toEqual([
      "mobilidade-ombro", "mobilidade-costas", "mobilidade-quadril", "mobilidade-tornozelo",
    ]);
    const ids = new Set(EXERCISES.map((e) => e.id));
    expect(ids.has("mobilidade-geral")).toBe(false); // id antigo removido
  });

  it("Força A tem 7 exercícios na ordem da rotina", () => {
    const a = WORKOUT_PLAN.find((t) => t.id === "forca-a")!;
    expect(a.exercises.map((e) => e.exerciseId)).toEqual([
      "pendura-na-barra", "puxada-de-escapula", "remada-com-1-braco",
      "elevacao-lateral", "abertura-invertida", "rosca-de-biceps", "prancha",
    ]);
  });
});
