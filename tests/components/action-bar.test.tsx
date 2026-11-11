import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ActionBar } from "@/components/table/action-bar";
import { useLanguageStore } from "@/store/useLanguageStore";

const RAISE = { type: "raise", min: 100, max: 1000 } as const;

function open() {
  return userEvent.click(screen.getByRole("button", { name: "Raise" }));
}

describe("ActionBar", () => {
  beforeEach(() => {
    act(() => useLanguageStore.setState({ language: "en" }));
  });

  it("renders nothing actionable without legal actions", () => {
    render(<ActionBar actions={[]} onAction={vi.fn()} />);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
    expect(
      screen.queryByRole("slider", { hidden: true }),
    ).not.toBeInTheDocument();
  });

  it("fires a plain action with its amount", async () => {
    const onAction = vi.fn();
    render(
      <ActionBar
        actions={[{ type: "fold" }, { type: "call", amount: 50 }]}
        onAction={onAction}
      />,
    );
    expect(screen.getByRole("button", { name: "Fold" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Call 50" }));
    expect(onAction).toHaveBeenCalledWith({ type: "call", amount: 50 });
  });

  it("keeps the raise panel closed until Raise is pressed, and toggles it", async () => {
    render(<ActionBar actions={[RAISE]} onAction={vi.fn()} />);
    const opener = screen.getByRole("button", { name: "Raise" });
    expect(opener).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.queryByRole("slider", { hidden: true }),
    ).not.toBeInTheDocument();
    await userEvent.click(opener);
    expect(opener).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("slider", { hidden: true })).toBeInTheDocument();
    await userEvent.click(opener);
    expect(
      screen.queryByRole("slider", { hidden: true }),
    ).not.toBeInTheDocument();
  });

  it("starts at the minimum and confirms the chosen amount", async () => {
    const onAction = vi.fn();
    render(<ActionBar actions={[RAISE]} onAction={onAction} />);
    await open();
    await userEvent.click(screen.getByRole("button", { name: "Raise to 100" }));
    expect(onAction).toHaveBeenCalledWith({ type: "raise", amount: 100 });
  });

  it("goes to the maximum with the slider End key and back with Home", async () => {
    const onAction = vi.fn();
    render(<ActionBar actions={[RAISE]} onAction={onAction} />);
    await open();
    act(() => screen.getByRole("slider", { hidden: true }).focus());
    await userEvent.keyboard("{End}");
    await userEvent.click(
      screen.getByRole("button", { name: "Raise to 1,000" }),
    );
    expect(onAction).toHaveBeenLastCalledWith({ type: "raise", amount: 1000 });
    act(() => screen.getByRole("slider", { hidden: true }).focus());
    await userEvent.keyboard("{Home}");
    await userEvent.click(screen.getByRole("button", { name: "Raise to 100" }));
    expect(onAction).toHaveBeenLastCalledWith({ type: "raise", amount: 100 });
  });

  it("applies the presets clamped to the legal range", async () => {
    render(<ActionBar actions={[RAISE]} pot={600} onAction={vi.fn()} />);
    await open();
    await userEvent.click(screen.getByRole("button", { name: "½ pot" }));
    expect(
      screen.getByRole("button", { name: "Raise to 300" }),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Pot" }));
    expect(
      screen.getByRole("button", { name: "Raise to 600" }),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "All-in" }));
    expect(
      screen.getByRole("button", { name: "Raise to 1,000" }),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Min" }));
    expect(
      screen.getByRole("button", { name: "Raise to 100" }),
    ).toBeInTheDocument();
  });

  it("steps the amount and never leaves the legal range", async () => {
    render(
      <ActionBar
        actions={[{ type: "raise", min: 100, max: 130 }]}
        onAction={vi.fn()}
      />,
    );
    await open();
    await userEvent.click(
      screen.getByRole("button", { name: "Decrease amount" }),
    );
    expect(
      screen.getByRole("button", { name: "Raise to 100" }),
    ).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: "Increase amount" }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Increase amount" }),
    );
    expect(
      screen.getByRole("button", { name: "Raise to 130" }),
    ).toBeInTheDocument();
  });

  it("shows only an all-in button when min equals max", async () => {
    const onAction = vi.fn();
    render(
      <ActionBar
        actions={[{ type: "raise", min: 400, max: 400 }]}
        onAction={onAction}
      />,
    );
    expect(
      screen.queryByRole("slider", { hidden: true }),
    ).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "All-in" }));
    expect(onAction).toHaveBeenCalledWith({ type: "raise", amount: 400 });
  });

  it("reaches every button by keyboard", async () => {
    render(
      <ActionBar
        actions={[{ type: "fold" }, { type: "check" }]}
        onAction={vi.fn()}
      />,
    );
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "Fold" })).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "Check" })).toHaveFocus();
  });

  describe("chips mode", () => {
    const CHIPS = { type: "raise", min: 100, max: 1000 } as const;

    it("shows chips up to the legal maximum instead of the slider", async () => {
      render(
        <ActionBar
          actions={[{ type: "raise", min: 100, max: 300 }]}
          mode="chips"
          onAction={vi.fn()}
        />,
      );
      await userEvent.click(screen.getByRole("button", { name: "Raise" }));
      expect(
        screen.queryByRole("slider", { hidden: true }),
      ).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Add 5" })).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Add 25" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Add 100" }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Add 500" }),
      ).not.toBeInTheDocument();
    });

    it("adds the clicked chip to the amount and confirms it", async () => {
      const onAction = vi.fn();
      render(<ActionBar actions={[CHIPS]} mode="chips" onAction={onAction} />);
      await userEvent.click(screen.getByRole("button", { name: "Raise" }));
      await userEvent.click(screen.getByRole("button", { name: "Add 100" }));
      await userEvent.click(screen.getByRole("button", { name: "Add 25" }));
      await userEvent.click(
        screen.getByRole("button", { name: "Raise to 225" }),
      );
      expect(onAction).toHaveBeenCalledWith({ type: "raise", amount: 225 });
    });

    it("never goes past the maximum and resets with Min", async () => {
      render(<ActionBar actions={[CHIPS]} mode="chips" onAction={vi.fn()} />);
      await userEvent.click(screen.getByRole("button", { name: "Raise" }));
      for (let i = 0; i < 3; i++)
        await userEvent.click(screen.getByRole("button", { name: "Add 500" }));
      expect(
        screen.getByRole("button", { name: "Raise to 1,000" }),
      ).toBeInTheDocument();
      await userEvent.click(screen.getByRole("button", { name: "Min" }));
      expect(
        screen.getByRole("button", { name: "Raise to 100" }),
      ).toBeInTheDocument();
    });
  });

  it("can start with the raise panel open", () => {
    render(<ActionBar actions={[RAISE]} defaultOpen onAction={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Raise" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(
      screen.getByRole("button", { name: "Raise to 100" }),
    ).toBeInTheDocument();
  });
});
