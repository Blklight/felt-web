"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LobbyHero } from "@/components/screens/lobby-hero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { useT } from "@/i18n/use-t";
import { isValidRoomCode } from "@/lib/room-code";

const DEMO_CODE = "KQ7XZ";
const BLINDS = ["10/20", "25/50", "50/100"] as const;

export function Lobby() {
  const t = useT();
  const router = useRouter();
  const [game, setGame] = useState<"blackjack" | "poker">("poker");
  const [blinds, setBlinds] = useState<(typeof BLINDS)[number]>("25/50");
  const [code, setCode] = useState("");
  const [invalid, setInvalid] = useState(false);
  const [pending, setPending] = useState<"create" | "join" | null>(null);
  const go = (kind: "create" | "join", url: string) => {
    setPending(kind);
    router.push(url);
  };

  const join = (event: React.FormEvent) => {
    event.preventDefault();
    const normalized = code.trim().toUpperCase();
    if (!isValidRoomCode(normalized)) {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    go("join", `/table?code=${normalized}`);
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
              <Switch id="cap-stacks" />
              <Label htmlFor="cap-stacks">{t("lobby.capStacks")}</Label>
            </div>
          </>
        )}
        <Button
          disabled={pending !== null}
          onClick={() => go("create", `/table?code=${DEMO_CODE}&game=${game}`)}
        >
          {pending === "create" && <Spinner aria-hidden="true" />}
          {pending === "create" ? t("lobby.creating") : t("lobby.createButton")}
        </Button>
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
            aria-invalid={invalid}
            onChange={(e) => setCode(e.target.value)}
          />
          {invalid && (
            <p role="alert" className="text-destructive text-sm">
              {t("lobby.invalidCode")}
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
          onClick={() => go("join", `/table?code=${DEMO_CODE}`)}
        >
          {t("lobby.quick")}
        </Button>
      </section>
      <section className="flex flex-col gap-2 border border-border p-4 md:col-span-2">
        <h2 className="font-medium">{t("lobby.recent")}</h2>
        <p className="text-muted-foreground text-sm">
          {t("lobby.recentEmpty")}
        </p>
      </section>
    </div>
  );
}
