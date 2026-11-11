"use client";

import { useState } from "react";
import { BetSlider } from "@/components/chips/bet-slider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useFormatNumber } from "@/i18n/use-format-number";
import { useT } from "@/i18n/use-t";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seat: number;
  min: number;
  max: number;
  balance: number;
  onConfirm: (amount: number) => void;
};

export function BuyInDialog({
  open,
  onOpenChange,
  min,
  max,
  balance,
  onConfirm,
}: Props) {
  const t = useT();
  const format = useFormatNumber();
  const top = Math.min(max, balance);
  const short = balance < min;
  const [picked, setPicked] = useState(min);
  const amount = Math.min(top, Math.max(min, picked));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("buyIn.title")}</DialogTitle>
          <DialogDescription>{t("buyIn.desc")}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex justify-between text-muted-foreground text-sm">
            <span>{t("buyIn.balance", { amount: format(balance) })}</span>
            <span>
              {t("buyIn.range", { min: format(min), max: format(max) })}
            </span>
          </div>
          <output className="text-center font-bungee text-3xl">
            {format(short ? min : amount)}
          </output>
          <BetSlider
            label={t("buyIn.amount")}
            min={min}
            max={Math.max(top, min)}
            value={short ? min : amount}
            onChange={setPicked}
            disabled={short}
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              disabled={short}
              onClick={() => setPicked(min)}
            >
              {t("preset.min")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              disabled={short}
              onClick={() => setPicked(top)}
            >
              {t("preset.max")}
            </Button>
          </div>
          {short && (
            <p role="alert" className="text-destructive text-sm">
              {t("buyIn.short", { min: format(min) })}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button disabled={short} onClick={() => onConfirm(amount)}>
            {t("buyIn.confirm", { amount: format(short ? min : amount) })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
