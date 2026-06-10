import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { HoldTimer } from "../../src/components/HoldTimer";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

it("conta o tempo e marca o alvo atingido", async () => {
  render(<HoldTimer targetSec={3} />);
  // inicia
  act(() => { fireEvent.click(screen.getByRole("button", { name: /iniciar/i })); });
  act(() => { vi.advanceTimersByTime(3000); });
  expect(screen.getAllByText(/0:03/).length).toBeGreaterThan(0);
  // verifica o estado "alvo atingido" (não só o rótulo do alvo, sempre presente)
  expect(screen.getByText(/alvo atingido/i)).toBeInTheDocument();
});

describe("HoldTimer", () => {
  it("começa pausado e mostra 0:00", () => {
    render(<HoldTimer />);
    expect(screen.getByText("0:00")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /iniciar/i })).toBeInTheDocument();
  });

  it("Pausar aparece quando rodando", () => {
    render(<HoldTimer />);
    act(() => { fireEvent.click(screen.getByRole("button", { name: /iniciar/i })); });
    expect(screen.getByRole("button", { name: /pausar/i })).toBeInTheDocument();
  });

  it("chama onStop com o tempo decorrido ao Zerar", () => {
    const onStop = vi.fn();
    render(<HoldTimer targetSec={10} onStop={onStop} />);
    act(() => { fireEvent.click(screen.getByRole("button", { name: /iniciar/i })); });
    act(() => { vi.advanceTimersByTime(5000); });
    act(() => { fireEvent.click(screen.getByRole("button", { name: /zerar/i })); });
    expect(onStop).toHaveBeenCalledWith(5);
  });
});
