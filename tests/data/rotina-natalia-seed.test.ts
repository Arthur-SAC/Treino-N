// tests/data/rotina-natalia-seed.test.ts
import { describe, it, expect } from "vitest";
import { EXERCISES, WORKOUT_PLAN, WARMUP_BLOCKS } from "../../src/data/rotina-natalia-seed";

describe("rotina-natalia seed", () => {
  it("tem os 6 templates do formato X nos dias certos", () => {
    const x = WORKOUT_PLAN.filter((t) => t.program === "x");
    const byDay = Object.fromEntries(x.map((t) => [t.dayOfWeek, t.id]));
    expect(byDay[1]).toBe("forca-a");
    expect(byDay[2]).toBe("cardio-ter");
    expect(byDay[3]).toBe("forca-b");
    expect(byDay[4]).toBe("mobilidade-qui");
    expect(byDay[5]).toBe("forca-c");
    expect(byDay[6]).toBe("cardio-sab");
    expect(x.find((t) => t.dayOfWeek === 0)).toBeUndefined(); // domingo folga
  });

  it("tem o programa triângulo invertido cobrindo os mesmos dias", () => {
    const tri = WORKOUT_PLAN.filter((t) => t.program === "tri");
    const byDay = Object.fromEntries(tri.map((t) => [t.dayOfWeek, t.id]));
    expect(byDay[1]).toBe("tri-a");
    expect(byDay[3]).toBe("tri-b");
    expect(byDay[5]).toBe("tri-c");
    expect(tri.filter((t) => t.kind === "forca")).toHaveLength(3);
    expect(tri.find((t) => t.dayOfWeek === 0)).toBeUndefined(); // domingo folga
  });

  it("todo template tem program definido e focus preenchido", () => {
    for (const t of WORKOUT_PLAN) {
      expect(["x", "tri"], t.id).toContain(t.program);
      expect(t.focus, t.id).toBeTruthy();
    }
  });

  it("todo exercício tem dica de resultado (proTips) e indicador de erro (commonMistakes)", () => {
    for (const ex of EXERCISES) {
      expect(ex.commonMistakes.length, ex.id).toBeGreaterThan(0);
      expect(ex.proTips?.length ?? 0, ex.id).toBeGreaterThan(0);
    }
  });

  it("todo bloco de aquecimento tem passos, dica de resultado e sinal de erro", () => {
    expect(WARMUP_BLOCKS.length).toBeGreaterThan(0);
    for (const b of WARMUP_BLOCKS) {
      expect(b.passos.length, b.titulo).toBeGreaterThan(0);
      expect(b.resultado, b.titulo).toBeTruthy();
      expect(b.erro, b.titulo).toBeTruthy();
    }
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

  it("exercício só com vídeo tem videoUrl; exercícios com imagem têm frames (2 quadros)", () => {
    const pendura = EXERCISES.find((e) => e.id === "pendura-na-barra")!;
    expect(pendura.videoUrl).toMatch(/youtube\.com/);
    expect(pendura.frames).toBeUndefined();
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
