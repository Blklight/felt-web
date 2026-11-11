import type { RefObject } from "react";
import type { CardBackVariant, CardSkin } from "@/components/cards/skins";
import { TableCard } from "@/components/cards/table-card";
import type { CardCode } from "@/dev/view-types";
import { cn } from "@/lib/utils";

type Props = {
  cards: CardCode[];
  skin?: CardSkin;
  back?: CardBackVariant;
  dealFrom?: RefObject<HTMLElement | null>;
  dealDelays?: number[];
  highlight?: (code: CardCode) => "win" | "dim" | undefined;
  className?: string;
  cardClassName?: string;
};

export function Hand({
  cards,
  skin,
  back,
  dealFrom,
  dealDelays,
  highlight,
  className,
  cardClassName,
}: Props) {
  return (
    <div className={cn("flex -space-x-5", className)}>
      {cards.map((code, i) => (
        <TableCard
          // biome-ignore lint/suspicious/noArrayIndexKey: a slot keeps its card so a reveal turns it over in place
          key={i}
          code={code}
          highlight={highlight?.(code)}
          skin={skin}
          back={back}
          dealFrom={dealFrom}
          dealDelay={dealDelays?.[i] ?? 0}
          className={cn("w-11 sm:w-16", cardClassName)}
        />
      ))}
    </div>
  );
}
