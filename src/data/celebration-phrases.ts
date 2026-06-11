// Frases fofas/engraçadinhas que aparecem ao terminar o treino.
export const CELEBRATION_PHRASES = [
  "Força, meu bem! 💪",
  "Quem é a gatona? É você! 😎",
  "Nossa, tá ficando forte… 🥵",
  "Arrasou no treino! 🔥",
  "Mais forte que ontem 💜",
  "Olha esse shape aparecendo 👀",
  "Treino feito, orgulho total! 🫶",
  "Glúteo agradece 🍑",
  "Você é incrível, sabia? ✨",
  "Mandou bem demais! 👏",
  "Tá voando, hein! 🚀",
  "Que disciplina linda 😍",
  "Suadinha e poderosa 💦",
  "Foco, força e… glúteo! 🍑",
  "Missão cumprida, musa! 🫡",
  "Bombando igual uma campeã 🏆",
] as const;

/** Escolhe uma frase. `rand` (0–1) injetável pra testes determinísticos. */
export function pickCelebration(rand: number = Math.random()): string {
  const i = Math.floor(rand * CELEBRATION_PHRASES.length) % CELEBRATION_PHRASES.length;
  return CELEBRATION_PHRASES[i];
}
