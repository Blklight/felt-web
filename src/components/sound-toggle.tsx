"use client";

import { Volume2Icon, VolumeXIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHydrated } from "@/hooks/useHydrated";
import { useT } from "@/i18n/use-t";
import { useSoundStore } from "@/store/useSoundStore";

export function SoundToggle() {
  const t = useT();
  const hydrated = useHydrated();
  const muted = useSoundStore((s) => s.muted) && hydrated;
  const toggle = useSoundStore((s) => s.toggle);
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-pressed={!muted}
      aria-label={t("sound.toggle")}
      title={t("sound.toggle")}
      onClick={toggle}
    >
      {muted ? <VolumeXIcon /> : <Volume2Icon />}
    </Button>
  );
}
