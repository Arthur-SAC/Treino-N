import { it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { db } from "../../src/lib/db";
import { ExerciseDetail } from "../../src/pages/workout/ExerciseDetail";

it("mostra nome, passos e link de vídeo de um skill", async () => {
  await db.exercises.put({
    id: "parada-de-mao-na-parede", name: "Parada de mão na parede (segurar)",
    category: "Ombro · core", equipment: ["peso-corporal"], difficulty: "intermediario",
    isSkill: true, timeBasedSec: 30, videoUrl: "https://www.youtube.com/results?search_query=x",
    steps: ["De frente pra parede…"], description: "De frente pra parede…", commonMistakes: [],
  });
  const router = createMemoryRouter(
    [{ path: "/treino/exercicio/:id", element: <ExerciseDetail /> }],
    { initialEntries: ["/treino/exercicio/parada-de-mao-na-parede"] },
  );
  render(<RouterProvider router={router} />);
  expect(await screen.findByText(/Parada de mão na parede/)).toBeInTheDocument();
  expect(await screen.findByText(/Ver vídeo/)).toBeInTheDocument();
});
