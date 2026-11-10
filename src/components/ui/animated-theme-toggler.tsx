"use client";

import { BookOpen, Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { type ReactNode, useRef } from "react";
import { flushSync } from "react-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  children?: ReactNode;
};

type Theme = "light" | "dark" | "book" | "system";

export const AnimatedThemeToggler = ({ className, children }: Props) => {
  const { setTheme } = useTheme();
  const t = (key: string) => key;
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const handleChangeTheme = async (theme: Theme) => {
    if (!buttonRef.current) return;

    if (!document.startViewTransition) {
      setTheme(theme);
      return;
    }

    await document.startViewTransition(() => {
      flushSync(() => {
        setTheme(theme);
      });
    }).ready;

    const { top, left, width, height } =
      buttonRef.current.getBoundingClientRect();
    const y = top + height / 2;
    const x = left + width / 2;

    const right = window.innerWidth - left;
    const bottom = window.innerHeight - top;
    const maxRad = Math.hypot(Math.max(left, right), Math.max(top, bottom));

    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${maxRad}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 700,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      },
    );
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        ref={buttonRef}
        type="button"
        aria-label={t("toggleTheme")}
        title={t("toggleTheme")}
        className={cn(
          "flex h-10 w-12 cursor-pointer items-center justify-center gap-1 rounded-xs px-4 text-[#252525] outline-none hover:bg-[#252525] hover:text-[#eaeaea] dark:text-[#eaeaea] dark:hover:bg-[#eaeaea] dark:hover:text-[#252525]",
          className,
        )}
        suppressHydrationWarning
      >
        {children ?? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-4.5"
            aria-hidden="true"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
            <path d="M12 3l0 18" />
            <path d="M12 9l4.65 -4.65" />
            <path d="M12 14.3l7.37 -7.37" />
            <path d="M12 19.6l8.85 -8.85" />
          </svg>
        )}
        <span className="sr-only">{t("toggleTheme")}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="rounded-xs border-[#252525] dark:border-[#eaeaea]"
      >
        <DropdownMenuItem
          className="cursor-pointer rounded-xs"
          onClick={() => handleChangeTheme("light")}
        >
          <Sun className="mr-1 h-4 w-4" />
          {t("light")}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer rounded-xs"
          onClick={() => handleChangeTheme("dark")}
        >
          <Moon className="mr-1 h-4 w-4" />
          {t("dark")}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer rounded-xs"
          onClick={() => handleChangeTheme("book")}
        >
          <BookOpen className="mr-1 h-4 w-4" />
          {t("book")}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer rounded-xs"
          onClick={() => handleChangeTheme("system")}
        >
          <Laptop className="mr-1 h-4 w-4" />
          {t("system")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
