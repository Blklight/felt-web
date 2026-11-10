import type { Metadata } from "next";
import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";
import { TableRoute } from "@/components/screens/table-screen";

export const metadata: Metadata = { title: "Table · felt" };

export default function TablePage() {
  return (
    <AppShell>
      <Suspense>
        <TableRoute />
      </Suspense>
    </AppShell>
  );
}
