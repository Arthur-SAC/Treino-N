import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { db } from "../../src/lib/db";
import { SessionDetail } from "../../src/pages/workout/SessionDetail";
import type { Exercise, WorkoutTemplate } from "../../src/lib/db";

// Minimal forca-a exercises for smoke testing
const FORCA_A_EXERCISES: Exercise[] = [
  {
    id: "pendura-na-barra",
    name: "Pendura na barra (dead hang)",
    category: "Costas · pegada",
    equipment: ["barra"],
    difficulty: "intermediario",
    isSkill: true,
    timeBasedSec: 20,
    videoUrl: "https://www.youtube.com/results?search_query=pendura+tutorial",
    steps: ["Segure a barra, fique pendurada."],
    description: "Segure a barra, fique pendurada.",
    commonMistakes: ["Balançar o corpo."],
    harderVariation: "Aumente o tempo de cada pendura.",
  },
  {
    id: "elevacao-lateral",
    name: "Elevação lateral",
    category: "Ombro (lateral)",
    equipment: ["halteres"],
    difficulty: "iniciante",
    isSkill: false,
    isStar: true,
    gifPath: "/exercises/elevacao-lateral.gif",
    steps: ["Levante os braços pros lados."],
    description: "Levante os braços pros lados.",
    commonMistakes: ["Usar impulso."],
  },
];

const FORCA_A_TEMPLATE: WorkoutTemplate = {
  id: "forca-a",
  name: "Força A · Puxar & Ombro",
  dayOfWeek: 1,
  kind: "forca",
  durationMin: 45,
  exercises: [
    { exerciseId: "pendura-na-barra", sets: 3, repsTarget: "até 20s", restSec: 75 },
    { exerciseId: "elevacao-lateral", sets: 3, repsTarget: "12-15", restSec: 75 },
  ],
};

async function seedForcaA() {
  for (const ex of FORCA_A_EXERCISES) await db.exercises.put(ex);
  await db.workoutTemplates.put(FORCA_A_TEMPLATE);
}

function renderSessionDetail(templateId = "forca-a") {
  const router = createMemoryRouter(
    [{ path: "/treino/sessao/:templateId", element: <SessionDetail /> }],
    { initialEntries: [`/treino/sessao/${templateId}`] },
  );
  return render(<RouterProvider router={router} />);
}

describe("SessionDetail smoke — Força A", () => {
  it("renderiza o nome do treino e os exercícios", async () => {
    await seedForcaA();
    renderSessionDetail();

    // Template name
    expect(await screen.findByText(/Força A/i)).toBeInTheDocument();

    // Skill exercise with time-based
    expect(await screen.findByText(/Pendura na barra/i)).toBeInTheDocument();

    // Normal exercise
    expect(await screen.findByText(/Elevação lateral/i)).toBeInTheDocument();
  });

  it("exercício por tempo (skill) mostra HoldTimer, sem campo peso", async () => {
    await seedForcaA();
    renderSessionDetail();

    // Wait for Pendura na barra to appear
    const penduraHeading = await screen.findByText(/Pendura na barra/i);

    // HoldTimer should show a "0:00" timer display
    expect(screen.getByText("0:00")).toBeInTheDocument();

    // Inside Pendura's card, there should be no "kg" input
    const penduraCard = penduraHeading.closest(".card")!;
    expect(within(penduraCard as HTMLElement).queryAllByPlaceholderText("kg")).toHaveLength(0);

    // But Elevação lateral (normal exercise) DOES have kg inputs (3 sets)
    const elevacaoHeading = screen.getByText(/Elevação lateral/i);
    const elevacaoCard = elevacaoHeading.closest(".card")!;
    expect(within(elevacaoCard as HTMLElement).getAllByPlaceholderText("kg")).toHaveLength(3);
  });

  it("exercício skill mostra dica de progressão (harderVariation)", async () => {
    await seedForcaA();
    renderSessionDetail();

    await screen.findByText(/Pendura na barra/i);

    // harderVariation should be shown as progression hint
    expect(screen.getByText(/Progresso:.*Aumente o tempo/i)).toBeInTheDocument();
  });

  it("permite salvar um exercício (skill) e aparece como registrado", async () => {
    await seedForcaA();
    renderSessionDetail();

    // Wait for Pendura na barra
    await screen.findByText(/Pendura na barra/i);

    // Fill reps for first set
    const repsInputs = screen.getAllByPlaceholderText("reps");
    fireEvent.change(repsInputs[0], { target: { value: "20" } });

    // Click "Salvar exercício" — there should be one save button per visible recorder
    // Find the save button within Pendura's card
    const saveButtons = screen.getAllByRole("button", { name: /salvar exercício/i });
    fireEvent.click(saveButtons[0]);

    // After saving, should appear as recorded with checkmark
    await waitFor(() => {
      expect(screen.getByText(/Pendura na barra \(dead hang\) ✓/i)).toBeInTheDocument();
    });
  });

  it("pode finalizar a sessão após registrar ao menos 1 exercício e salva no DB", async () => {
    await seedForcaA();
    renderSessionDetail();

    // Wait for page load
    await screen.findByText(/Pendura na barra/i);

    // Save pendura with reps
    const repsInputs = screen.getAllByPlaceholderText("reps");
    fireEvent.change(repsInputs[0], { target: { value: "15" } });

    const saveButtons = screen.getAllByRole("button", { name: /salvar exercício/i });
    fireEvent.click(saveButtons[0]);

    // Wait for it to be marked as recorded
    await waitFor(() => {
      expect(screen.getByText(/Pendura na barra \(dead hang\) ✓/i)).toBeInTheDocument();
    });

    // Finish button enabled now
    const finishBtn = screen.getByRole("button", { name: /finalizar treino/i });
    expect(finishBtn).not.toBeDisabled();

    // Click finish — saves to DB and navigates away
    fireEvent.click(finishBtn);

    await waitFor(async () => {
      const sessions = await db.workoutSessions.toArray();
      expect(sessions).toHaveLength(1);
      expect(sessions[0].templateId).toBe("forca-a");
      expect(sessions[0].exercises).toHaveLength(1);
      expect(sessions[0].exercises[0].exerciseId).toBe("pendura-na-barra");
    });
  });
});
