"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LobbyHero } from "@/components/screens/lobby-hero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { useHydrated } from "@/hooks/useHydrated";
import type { MessageKey } from "@/i18n/dictionaries";
import { useT } from "@/i18n/use-t";
import { isValidRoomCode } from "@/lib/room-code";
import { ApiFailure, createRoom, getRoom } from "@/net/api";
import { useRecentTablesStore } from "@/store/useRecentTablesStore";

const BLINDS = ["10/20", "25/50", "50/100"] as const;

export function Lobby() {
  const t = useT();
  const router = useRouter();
  const [game, setGame] = useState<"blackjack" | "poker">("poker");
  const [blinds, setBlinds] = useState<(typeof BLINDS)[number]>("25/50");
  const [code, setCode] = useState("");
  const [capStacks, setCapStacks] = useState(false);
  const [problem, setProblem] = useState<MessageKey | null>(null);
  const [createProblem, setCreateProblem] = useState<MessageKey | null>(null);
  const hydrated = useHydrated();
  const storedRecent = useRecentTablesStore((state) => state.tables);
  const clearRecent = useRecentTablesStore((state) => state.clear);
  const recent = hydrated ? storedRecent : [];
  const [pending, setPending] = useState<"create" | "join" | null>(null);
  const open = (code: string) => router.push(`/table?code=${code}`);

  const create = async (
    room: Parameters<typeof createRoom>,
    kind: "create" | "join",
  ) => {
    setCreateProblem(null);
    setPending(kind);
    try {
      open((await createRoom(...room)).code);
    } catch {
      setCreateProblem("error.UNKNOWN");
      setPending(null);
    }
  };

  const join = async (event: React.FormEvent) => {
    event.preventDefault();
    const normalized = code.trim().toUpperCase();
    if (!isValidRoomCode(normalized)) {
      setProblem("lobby.invalidCode");
      return;
    }
    setProblem(null);
    setPending("join");
    try {
      await getRoom(normalized);
      open(normalized);
    } catch (failure) {
      const known =
        failure instanceof ApiFailure && failure.code === "ROOM_NOT_FOUND";
      setProblem(known ? "error.ROOM_NOT_FOUND" : "error.UNKNOWN");
      setPending(null);
    }
  };

  return (
    <div className="mx-auto grid w-full max-w-3xl gap-6 md:grid-cols-2">
      <LobbyHero />

      <section
        id="create"
        className="flex scroll-mt-4 flex-col gap-3 border border-border p-4"
      >
        <h2 className="font-medium">{t("lobby.create")}</h2>
        <div
          className="flex gap-2"
          role="radiogroup"
          aria-label={t("lobby.game")}
        >
          {(["blackjack", "poker"] as const).map((g) => (
            <Button
              key={g}
              role="radio"
              aria-checked={game === g}
              variant={game === g ? "default" : "outline"}
              onClick={() => setGame(g)}
            >
              {t(`game.${g}`)}
            </Button>
          ))}
        </div>
        {game === "poker" && (
          <>
            <div
              className="flex items-center gap-2"
              role="radiogroup"
              aria-label={t("lobby.blinds")}
            >
              {BLINDS.map((b) => (
                <Button
                  key={b}
                  size="sm"
                  role="radio"
                  aria-checked={blinds === b}
                  variant={blinds === b ? "default" : "outline"}
                  onClick={() => setBlinds(b)}
                >
                  {b}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Switch
                id="cap-stacks"
                checked={capStacks}
                onCheckedChange={setCapStacks}
              />
              <Label htmlFor="cap-stacks">{t("lobby.capStacks")}</Label>
            </div>
          </>
        )}
        <Button
          disabled={pending !== null}
          onClick={() =>
            create(
              [
                game,
                game === "poker"
                  ? {
                      blinds: blinds.split("/").map(Number),
                      capToShortestStack: capStacks,
                    }
                  : undefined,
              ],
              "create",
            )
          }
        >
          {pending === "create" && <Spinner aria-hidden="true" />}
          {pending === "create" ? t("lobby.creating") : t("lobby.createButton")}
        </Button>
        {createProblem && (
          <p role="alert" className="text-destructive text-sm">
            {t(createProblem)}
          </p>
        )}
      </section>

      <section
        id="join"
        className="flex scroll-mt-4 flex-col gap-3 border border-border p-4"
      >
        <h2 className="font-medium">{t("lobby.join")}</h2>
        <form onSubmit={join} className="flex flex-col gap-2">
          <Label htmlFor="room-code">{t("lobby.code")}</Label>
          <Input
            id="room-code"
            value={code}
            maxLength={5}
            autoComplete="off"
            aria-invalid={problem !== null}
            onChange={(e) => setCode(e.target.value)}
          />
          {problem && (
            <p role="alert" className="text-destructive text-sm">
              {t(problem)}
            </p>
          )}
          <Button type="submit" disabled={pending !== null}>
            {pending === "join" && <Spinner aria-hidden="true" />}
            {pending === "join" ? t("lobby.joining") : t("lobby.joinButton")}
          </Button>
        </form>
        <Button
          variant="outline"
          disabled={pending !== null}
          onClick={() => create(["blackjack"], "join")}
        >
          {t("lobby.quick")}
        </Button>
      </section>
      <section className="flex flex-col gap-2 border border-border p-4 md:col-span-2">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">{t("lobby.recent")}</h2>
          {recent.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearRecent}>
              {t("lobby.clearRecent")}
            </Button>
          )}
        </div>
        {recent.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            {t("lobby.recentEmpty")}
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {recent.map((table) => (
              <li key={table.code}>
                <Link
                  href={`/table?code=${table.code}&game=${table.game}`}
                  className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"
                >
                  <span className="font-mono font-semibold">{table.code}</span>
                  <span className="text-muted-foreground">
                    {t(`game.${table.game}`)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
