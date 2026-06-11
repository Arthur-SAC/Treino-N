import { it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ExerciseMediaBlock } from "../../src/components/ExerciseMediaBlock";

it("renderiza imagem dos frames resolvida com o base do app", () => {
  render(
    <ExerciseMediaBlock
      name="Prancha"
      frames={["/exercises/prancha-0.jpg", "/exercises/prancha-1.jpg"]}
    />,
  );
  const img = screen.getByRole("img") as HTMLImageElement;
  // o src deve terminar com o caminho do asset (prefixado pelo BASE_URL do Vite)
  expect(img.getAttribute("src")).toMatch(/exercises\/prancha-0\.jpg$/);
  expect(img.getAttribute("src")!.startsWith("/exercises/")).toBe(
    import.meta.env.BASE_URL === "/",
  );
});

it("mostra link de vídeo quando não há imagem", () => {
  render(<ExerciseMediaBlock name="Pendura" videoUrl="https://www.youtube.com/results?search_query=x" />);
  expect(screen.getByText(/Ver vídeo/)).toBeInTheDocument();
  expect(screen.queryByRole("img")).toBeNull();
});
