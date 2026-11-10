"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormatNumber } from "@/i18n/use-format-number";
import { useT } from "@/i18n/use-t";

export function ProfileScreen() {
  const t = useT();
  const format = useFormatNumber();
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4">
      <h1 className="font-pixel text-2xl">{t("profile.title")}</h1>
      <div className="flex flex-col gap-1">
        <Label htmlFor="profile-name">{t("profile.name")}</Label>
        <Input id="profile-name" defaultValue="You" />
      </div>
      <p>
        {t("profile.balance")}:{" "}
        <span className="font-mono font-semibold">{format(2500)}</span>
      </p>
      <div className="flex flex-col gap-1">
        <Label htmlFor="recovery">{t("profile.recovery")}</Label>
        <Input id="recovery" readOnly value="••••••••••••••••" />
        <p className="text-muted-foreground text-xs">
          {t("profile.recoveryHint")}
        </p>
      </div>
      <Button variant="destructive">{t("profile.delete")}</Button>
    </div>
  );
}
