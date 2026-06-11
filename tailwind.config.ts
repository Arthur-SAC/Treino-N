import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Tema "Sistema" (Solo Leveling): azul-marinho profundo + ciano neon + roxo monarca.
        // Mantém os nomes de token (wine/nude/muted) usados nas classes.
        bg: {
          base: "#060912",   // azul-quase-preto (fundo)
          raised: "#0b1426", // painel/card
          deep: "#05080f",   // inputs/botões
          border: "#1d3a5f", // borda dos painéis
        },
        wine: {              // acento primário (botões) → azul de energia
          DEFAULT: "#1d4ed8",
          light: "#3b82f6",
        },
        nude: {              // acento/realce/texto → ciano do Sistema
          DEFAULT: "#38bdf8",
          light: "#7dd3fc",
          warm: "#dbeafe",   // texto principal (branco-gelo azulado)
        },
        muted: "#7387ad",    // texto secundário (cinza-azulado)
        monarch: {           // roxo monarca (momentos especiais)
          DEFAULT: "#a855f7",
          light: "#c084fc",
        },
      },
      fontFamily: {
        sans: ["Rajdhani", "system-ui", "-apple-system", "sans-serif"],
        serif: ["Rajdhani", "system-ui", "sans-serif"],
        display: ["Orbitron", "Rajdhani", "sans-serif"],
      },
      borderRadius: {
        card: "16px",
        pill: "9999px",
      },
    },
  },
  plugins: [],
} satisfies Config;
