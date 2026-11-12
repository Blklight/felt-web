import { GeistPixelCircle, GeistPixelSquare } from "geist/font/pixel";
import type { Metadata } from "next";
import {
  Barlow,
  Bungee_Shade,
  JetBrains_Mono,
  Monoton,
} from "next/font/google";
import { MotionProvider } from "@/components/motion-provider";
import { QueryProvider } from "@/components/query-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import "./globals.css";

const barlow = Barlow({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-barlow",
});

const bungeeShade = Bungee_Shade({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bungee-shade",
});

const monoton = Monoton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-monoton",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "felt",
  description: "Cards with friends. Fake credits, real fun.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        "font-sans",
        jetBrainsMono.variable,
        barlow.variable,
        bungeeShade.variable,
        monoton.variable,
        GeistPixelSquare.variable,
        GeistPixelCircle.variable,
      )}
    >
      <body>
        <ThemeProvider
          attribute="class"
          themes={["light", "dark", "book"]}
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <MotionProvider>
              <TooltipProvider>{children}</TooltipProvider>
            </MotionProvider>
            <Toaster />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
