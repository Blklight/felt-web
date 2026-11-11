"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CardBack } from "@/components/cards/card-back";
import { PlayingCard } from "@/components/cards/playing-card";
import { CARD_BACKS, CARD_SKINS } from "@/components/cards/skins";
import { AVATAR_IDS, PlayerAvatar } from "@/components/player-avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useHydrated } from "@/hooks/useHydrated";
import { useFormatNumber } from "@/i18n/use-format-number";
import { useT } from "@/i18n/use-t";
import { isRecoveryCode } from "@/lib/recovery-code";
import { cn } from "@/lib/utils";
import { useCardSkinStore } from "@/store/useCardSkinStore";
import { useProfileStore } from "@/store/useProfileStore";
import { useRecentTablesStore } from "@/store/useRecentTablesStore";

const NAME = { min: 2, max: 20 };

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3 border border-border p-4">
      <h2 className="font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Choice({
  name,
  checked,
  label,
  onSelect,
  children,
}: {
  name: string;
  checked: boolean;
  label: string;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer flex-col items-center gap-1 rounded-lg border p-2 text-xs transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-neon-cyan",
        checked
          ? "border-neon-violet bg-neon-violet/10"
          : "border-border hover:bg-muted",
      )}
    >
      <input
        type="radio"
        name={name}
        className="sr-only"
        checked={checked}
        aria-label={label}
        onChange={onSelect}
      />
      {children}
    </label>
  );
}

function NameField() {
  const t = useT();
  const { name, setName } = useProfileStore();
  const [draft, setDraft] = useState(name);
  const [invalid, setInvalid] = useState(false);
  const save = (event: React.FormEvent) => {
    event.preventDefault();
    const clean = draft.trim();
    if (clean.length < NAME.min || clean.length > NAME.max) {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    setName(clean);
    setDraft(clean);
    toast.success(t("profile.nameSaved"));
  };
  return (
    <form onSubmit={save} className="flex flex-col gap-2">
      <Label htmlFor="profile-name">{t("profile.name")}</Label>
      <div className="flex gap-2">
        <Input
          id="profile-name"
          value={draft}
          maxLength={NAME.max}
          aria-invalid={invalid}
          onChange={(e) => setDraft(e.target.value)}
        />
        <Button type="submit">{t("profile.saveName")}</Button>
      </div>
      {invalid && (
        <p role="alert" className="text-destructive text-sm">
          {t("profile.nameRule")}
        </p>
      )}
    </form>
  );
}

function RecoveryCode() {
  const t = useT();
  const { recoveryCode, importCode } = useProfileStore();
  const [shown, setShown] = useState(false);
  const [importing, setImporting] = useState(false);
  const [draft, setDraft] = useState("");
  const [invalid, setInvalid] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(recoveryCode);
    toast.success(t("profile.copied"));
  };
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const code = draft.trim();
    if (!isRecoveryCode(code)) {
      setInvalid(true);
      return;
    }
    importCode(code);
    setInvalid(false);
    setImporting(false);
    setDraft("");
    toast.success(t("profile.imported"));
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-muted-foreground text-sm">
        {t("profile.recoveryHint")}
      </p>
      <code className="break-all rounded-md bg-muted px-3 py-2 text-sm">
        {shown ? recoveryCode : "•".repeat(24)}
      </code>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => setShown((v) => !v)}>
          {shown ? t("profile.hideCode") : t("profile.showCode")}
        </Button>
        <Button variant="outline" size="sm" onClick={copy}>
          {t("profile.copyCode")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          aria-expanded={importing}
          onClick={() => setImporting((v) => !v)}
        >
          {t("profile.importCode")}
        </Button>
      </div>
      {importing && (
        <form onSubmit={submit} className="flex flex-col gap-2">
          <Label htmlFor="import-code">{t("profile.importLabel")}</Label>
          <div className="flex gap-2">
            <Input
              id="import-code"
              value={draft}
              autoComplete="off"
              aria-invalid={invalid}
              onChange={(e) => setDraft(e.target.value)}
            />
            <Button type="submit">{t("profile.import")}</Button>
          </div>
          {invalid && (
            <p role="alert" className="text-destructive text-sm">
              {t("profile.importInvalid")}
            </p>
          )}
        </form>
      )}
    </div>
  );
}

function DeleteAccount() {
  const t = useT();
  const reset = useProfileStore((s) => s.reset);
  const clearRecent = useRecentTablesStore((s) => s.clear);
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="destructive" />}>
        {t("profile.delete")}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("profile.deleteTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("profile.deleteDesc")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => {
              reset();
              clearRecent();
              toast.success(t("profile.deleted"));
            }}
          >
            {t("profile.deleteConfirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function ProfileScreen() {
  const t = useT();
  const format = useFormatNumber();
  const hydrated = useHydrated();
  const { name, avatarId, balance, setAvatar } = useProfileStore();
  const { skin, back, overrideOthers, setSkin, setBack, setOverrideOthers } =
    useCardSkinStore();

  if (!hydrated) return null;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <header className="flex items-center gap-4">
        <PlayerAvatar id={avatarId} className="size-16" />
        <div>
          <h1 className="font-semibold text-2xl">{name}</h1>
          <p className="text-muted-foreground">
            {t("profile.balance")}:{" "}
            <span className="font-semibold text-foreground tabular-nums">
              {format(balance)}
            </span>
          </p>
        </div>
      </header>

      <Section title={t("profile.name")}>
        <NameField key={name} />
      </Section>

      <Section title={t("profile.avatar")}>
        <div
          role="radiogroup"
          aria-label={t("profile.avatar")}
          className="grid grid-cols-4 gap-2 sm:grid-cols-8"
        >
          {AVATAR_IDS.map((id, i) => (
            <Choice
              name="avatar"
              key={id}
              checked={id === avatarId}
              label={t("avatar.label", { n: i + 1 })}
              onSelect={() => setAvatar(id)}
            >
              <PlayerAvatar id={id} />
            </Choice>
          ))}
        </div>
      </Section>

      <Section title={t("profile.cards")}>
        <div
          role="radiogroup"
          aria-label={t("profile.cards")}
          className="grid grid-cols-2 gap-2 sm:grid-cols-4"
        >
          {CARD_SKINS.map((option) => (
            <Choice
              name="skin"
              key={option}
              checked={option === skin}
              label={t(`skin.${option}`)}
              onSelect={() => setSkin(option)}
            >
              <span className="flex -space-x-3">
                <PlayingCard code="As" skin={option} className="w-10" />
                <PlayingCard code="Kh" skin={option} className="w-10" />
              </span>
              {t(`skin.${option}`)}
            </Choice>
          ))}
        </div>
        <h3 className="font-medium text-sm">{t("profile.back")}</h3>
        <div
          role="radiogroup"
          aria-label={t("profile.back")}
          className="grid grid-cols-4 gap-2"
        >
          {CARD_BACKS.map((option) => (
            <Choice
              name="back"
              key={option}
              checked={option === back}
              label={t(`back.${option}`)}
              onSelect={() => setBack(option)}
            >
              <CardBack variant={option} decorative className="w-10" />
              {t(`back.${option}`)}
            </Choice>
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Switch
            id="override-others"
            checked={overrideOthers}
            onCheckedChange={setOverrideOthers}
          />
          <Label htmlFor="override-others">{t("profile.override")}</Label>
        </div>
      </Section>

      <Section title={t("profile.recovery")}>
        <RecoveryCode />
      </Section>

      <Section title={t("profile.delete")}>
        <DeleteAccount />
      </Section>
    </div>
  );
}
