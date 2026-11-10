import type { RefObject } from "react";
import type { CardBackVariant, CardSkin } from "@/components/cards/skins";
import { TableCard } from "@/components/cards/table-card";
import type { CardCode } from "@/dev/view-types";

type Props = {
  cards: CardCode[];
  slots?: number;
  skin?: CardSkin;
  back?: CardBackVariant;
  faceDown?: boolean;
  dealFrom?: RefObject<HTMLElement | null>;
  dealDelays?: number[];
};

const CARD = "w-10 sm:w-16";

export function Board({
  cards,
  slots = 5,
  skin,
  back,
  faceDown = false,
  dealFrom,
  dealDelays,
}: Props) {
  const spots = Array.from(
    { length: slots },
    (_, k): CardCode | null => cards[k] ?? (faceDown ? "??" : null),
  );
  return (
    <div className="flex gap-1.5">
      {spots.map((code, k) =>
        code === null ? (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed board spots
            key={k}
            aria-hidden="true"
            className={`aspect-[5/7] rounded-md border border-bone/20 border-dashed ${CARD}`}
          />
        ) : (
          <TableCard
            // biome-ignore lint/suspicious/noArrayIndexKey: a spot keeps its card so the flop, turn and river turn over in place
            key={k}
            code={code}
            skin={skin}
            back={back}
            dealFrom={dealFrom}
            dealDelay={dealDelays?.[k] ?? 0}
            className={CARD}
          />
        ),
      )}
    </div>
  );
}
