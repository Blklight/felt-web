import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ActionBar } from "@/components/table/action-bar";
import { useLanguageStore } from "@/store/useLanguageStore";

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

  it("renders a button per legal action and fires call with its amount", async () => {
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

  it("raises to the maximum when the slider goes to End", async () => {
    const onAction = vi.fn();
    render(
      <ActionBar
        actions={[{ type: "raise", min: 100, max: 1000 }]}
        onAction={onAction}
      />,
    );
    act(() => screen.getByRole("slider", { hidden: true }).focus());
    await userEvent.keyboard("{End}");
    await userEvent.click(screen.getByRole("button", { name: "Raise" }));
    expect(onAction).toHaveBeenCalledWith({ type: "raise", amount: 1000 });
  });

  it("raises to the minimum when the slider goes to Home", async () => {
    const onAction = vi.fn();
    render(
      <ActionBar
        actions={[{ type: "raise", min: 100, max: 1000 }]}
        onAction={onAction}
      />,
    );
    act(() => screen.getByRole("slider", { hidden: true }).focus());
    await userEvent.keyboard("{End}{Home}");
    await userEvent.click(screen.getByRole("button", { name: "Raise" }));
    expect(onAction).toHaveBeenCalledWith({ type: "raise", amount: 100 });
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
});
