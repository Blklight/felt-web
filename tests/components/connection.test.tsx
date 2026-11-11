import { act, render, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toaster } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ActionBar } from "@/components/table/action-bar";
import {
  ConnectionBanner,
  useOnlineWatcher,
} from "@/components/table/connection-banner";
import { TableSkeleton } from "@/components/table/table-skeleton";
import { useServerError } from "@/i18n/use-server-error";
import { useConnectionStore } from "@/store/useConnectionStore";
import { useLanguageStore } from "@/store/useLanguageStore";

beforeEach(() => {
  act(() => {
    useLanguageStore.setState({ language: "en" });
    useConnectionStore.setState({ status: "open", attempt: 0, retryIn: 0 });
  });
});

describe("ConnectionBanner", () => {
  it("shows nothing while connected", () => {
    const { container } = render(<ConnectionBanner />);
    expect(container).toBeEmptyDOMElement();
  });

  it("says it is connecting", () => {
    act(() => useConnectionStore.setState({ status: "connecting" }));
    render(<ConnectionBanner />);
    expect(screen.getByRole("status")).toHaveTextContent("Connecting…");
  });

  it("counts down to the next attempt and lets the player retry now", async () => {
    const onRetry = vi.fn();
    act(() =>
      useConnectionStore.setState({
        status: "reconnecting",
        attempt: 3,
        retryIn: 8,
      }),
    );
    render(<ConnectionBanner onRetry={onRetry} />);
    expect(screen.getByRole("status")).toHaveTextContent(
      "Connection lost. Retrying in 8s (attempt 3).",
    );
    await userEvent.click(screen.getByRole("button", { name: "Retry now" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("explains being offline", () => {
    act(() => useConnectionStore.setState({ status: "offline" }));
    render(<ConnectionBanner />);
    expect(screen.getByRole("status")).toHaveTextContent("You are offline");
  });
});

describe("useOnlineWatcher", () => {
  it("follows the browser going offline and back", () => {
    renderHook(() => useOnlineWatcher());
    act(() => window.dispatchEvent(new Event("offline")));
    expect(useConnectionStore.getState().status).toBe("offline");
    act(() => window.dispatchEvent(new Event("online")));
    expect(useConnectionStore.getState().status).toBe("reconnecting");
  });
});

describe("ActionBar while disconnected", () => {
  it("disables every action", () => {
    render(
      <ActionBar
        actions={[{ type: "fold" }, { type: "call", amount: 50 }]}
        disabled
        onAction={vi.fn()}
      />,
    );
    for (const button of screen.getAllByRole("button"))
      expect(button).toBeDisabled();
  });
});

describe("TableSkeleton", () => {
  it("tells assistive tech the table is loading", () => {
    render(<TableSkeleton />);
    const skeleton = screen.getByRole("status", { name: "Loading table" });
    expect(skeleton).toHaveAttribute("aria-busy", "true");
  });
});

describe("useServerError", () => {
  function Probe({ code }: { code: string }) {
    const showError = useServerError();
    return (
      <button type="button" onClick={() => showError(code)}>
        fire
      </button>
    );
  }

  it.each([
    ["NOT_YOUR_TURN", "It is not your turn."],
    ["SEAT_TAKEN", "Someone took that seat first."],
    ["SOMETHING_NEW", "Something went wrong. Try again."],
  ])("shows a friendly message for %s", async (code, message) => {
    render(
      <>
        <Toaster />
        <Probe code={code} />
      </>,
    );
    await userEvent.click(screen.getByRole("button", { name: "fire" }));
    expect(await screen.findByText(message)).toBeInTheDocument();
  });
});
