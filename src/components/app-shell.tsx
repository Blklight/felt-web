import { LayoutBase } from "@/components/layout-base";
import { SiteHeader } from "@/components/site-header";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <LayoutBase>
      <SiteHeader />
      <div className="flex grow flex-col p-4">{children}</div>
    </LayoutBase>
  );
}
