import { AccountGate } from "@/components/account-gate";
import { AppShell } from "@/components/app-shell";
import { Lobby } from "@/components/screens/lobby";

export default function Home() {
  return (
    <AppShell>
      <AccountGate>
        <Lobby />
      </AccountGate>
    </AppShell>
  );
}
