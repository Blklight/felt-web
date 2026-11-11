import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { Table } from "@/components/table/table";
import { blackjackTable, pokerTable } from "@/dev/fixtures";
import { useLanguageStore } from "@/store/useLanguageStore";

describe("Table", () => {
  beforeEach(() => {
    act(() => useLanguageStore.setState({ language: "en" }));
  });

  it.each([
    2, 3, 4, 5, 6,
  ] as const)("renders every seat for %i players", (n) => {
    render(<Table view={pokerTable(n)} />);
    expect(screen.getAllByRole("group")).toHaveLength(n);
  });

  it("still renders free seats", () => {
    render(<Table view={blackjackTable} />);
    expect(screen.getAllByRole("group")).toHaveLength(
      blackjackTable.seats.length,
    );
    expect(screen.getAllByText("Free seat")).toHaveLength(2);
  });

  it("shows the pot and the board cards", () => {
    render(<Table view={pokerTable(4)} />);
    expect(screen.getByText("300")).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Seven of hearts" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("timer")).toBeInTheDocument();
  });

  it.each([
    [pokerTable(2), "chamfer"],
    [pokerTable(4), "round"],
    [pokerTable(6), "stadium"],
    [blackjackTable, "halfmoon"],
  ] as const)("uses the %# shape for its game and seat count", (view, shape) => {
    const { container } = render(<Table view={view} />);
    expect(container.querySelector("[data-shape]")).toHaveAttribute(
      "data-shape",
      shape,
    );
  });

  it("seats the viewer at the bottom center whichever seat number they have", () => {
    const base = pokerTable(4);
    const view = { ...base, you: { ...base.you, seat: 2 } };
    render(<Table view={view} />);
    const slot = screen.getByRole("group", { name: "Theo" }).parentElement;
    expect(slot?.style.left).toBe("50%");
  });

  it("shows each player's bet on the felt", () => {
    render(<Table view={pokerTable(3)} />);
    expect(screen.getByLabelText("Mara's stake")).toHaveTextContent("50");
  });
});
