"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useHydrated } from "@/hooks/useHydrated";
import { useT } from "@/i18n/use-t";
import { getQueryClient } from "@/lib/query-client";
import { ApiFailure, createAccount } from "@/net/api";
import { ME_KEY, useMe } from "@/net/queries";
import { useCardSkinStore } from "@/store/useCardSkinStore";
import { useProfileStore } from "@/store/useProfileStore";

const NAME = { min: 2, max: 20 };

// First visit: every player has a name, so the account is created once they pick one.
function CreateAccount() {
  const t = useT();
  const [name, setName] = useState("");
  const [error, setError] = useState<"rule" | "failed" | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const clean = name.trim();
    if (clean.length < NAME.min || clean.length > NAME.max) {
      setError("rule");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const account = await createAccount({ name: clean });
      getQueryClient().setQueryData(ME_KEY, account.profile);
      useProfileStore.getState().setAccount(account.playerId, account.token);
    } catch (failure) {
      setError(
        failure instanceof ApiFailure && failure.code === "VALIDATION_ERROR"
          ? "rule"
          : "failed",
      );
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="m-auto flex w-full max-w-sm flex-col gap-3 border border-border p-4"
    >
      <h1 className="font-semibold text-xl">{t("account.title")}</h1>
      <p className="text-muted-foreground text-sm">{t("account.hint")}</p>
      <Label htmlFor="account-name">{t("profile.name")}</Label>
      <Input
        id="account-name"
        value={name}
        maxLength={NAME.max}
        autoComplete="off"
        aria-invalid={error === "rule"}
        onChange={(e) => setName(e.target.value)}
      />
      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error === "rule" ? t("profile.nameRule") : t("account.failed")}
        </p>
      )}
      <Button type="submit" disabled={busy}>
        {busy && <Spinner aria-hidden="true" />}
        {t("account.create")}
      </Button>
    </form>
  );
}

// The card look comes from the profile: copy it into the store the cards read.
function useProfileLook() {
  const profile = useMe().data;
  useEffect(() => {
    if (!profile) return;
    useCardSkinStore.setState({ skin: profile.skinId, back: profile.backId });
  }, [profile]);
}

function Account({ children }: { children: React.ReactNode }) {
  useProfileLook();
  return <>{children}</>;
}

export function AccountGate({ children }: { children: React.ReactNode }) {
  const hydrated = useHydrated();
  const token = useProfileStore((state) => state.token);
  if (!hydrated) return null;
  return token ? <Account>{children}</Account> : <CreateAccount />;
}
