"use client";

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
import { useFormatNumber } from "@/i18n/use-format-number";
import { useT } from "@/i18n/use-t";

type Props = { stack: number; inHand?: boolean; onLeave: () => void };

export function LeaveButton({ stack, inHand = false, onLeave }: Props) {
  const t = useT();
  const format = useFormatNumber();
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="outline" size="sm" />}>
        {t("leave.button")}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("leave.title")}</AlertDialogTitle>
          <AlertDialogDescription>
            <span className="block">
              {t("leave.desc", { stack: format(stack) })}
            </span>
            {inHand && <span className="block">{t("leave.duringHand")}</span>}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
          <AlertDialogAction onClick={onLeave}>
            {t("leave.confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
