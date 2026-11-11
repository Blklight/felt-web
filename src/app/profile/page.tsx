import type { Metadata } from "next";
import { AccountGate } from "@/components/account-gate";
import { AppShell } from "@/components/app-shell";
import { ProfileScreen } from "@/components/screens/profile-screen";

export const metadata: Metadata = { title: "Profile · felt" };

export default function ProfilePage() {
  return (
    <AppShell>
      <AccountGate>
        <ProfileScreen />
      </AccountGate>
    </AppShell>
  );
}
