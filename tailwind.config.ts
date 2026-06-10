import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Tema roxo + azul. Mantém os nomes de token (wine/nude/muted) usados nas classes.
        bg: {
          base: "#1e1b4b",   // índigo bem escuro (fundo)
          raised: "#2a2566", // card
          deep: "#161232",   // inputs/botões
          border: "#3b357a", // borda
        },
        wine: {              // acento primário → roxo
          DEFAULT: "#7c3aed",
          light: "#a78bfa",
        },
        nude: {              // acento secundário/texto → azul
          DEFAULT: "#60a5fa",
          light: "#93c5fd",
          warm: "#e0e7ff",   // texto principal (lavanda clara)
        },
        muted: "#9c9ad6",    // texto secundário
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        serif: ["Georgia", "serif"],
      },
      borderRadius: {
        card: "16px",
        pill: "9999px",
      },
    },
  },
  plugins: [],
} satisfies Config;
