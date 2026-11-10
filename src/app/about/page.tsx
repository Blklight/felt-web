import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { AboutScreen } from "@/components/screens/about-screen";

export const metadata: Metadata = { title: "About · felt" };

export default function AboutPage() {
  return (
    <AppShell>
      <AboutScreen />
    </AppShell>
  );
}
