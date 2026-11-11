import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { ProfileScreen } from "@/components/screens/profile-screen";

export const metadata: Metadata = { title: "Profile · felt" };

export default function ProfilePage() {
  return (
    <AppShell>
      <ProfileScreen />
    </AppShell>
  );
}
