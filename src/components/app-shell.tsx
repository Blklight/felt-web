import { LayoutBase } from "@/components/layout-base";
import { SiteHeader } from "@/components/site-header";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <LayoutBase>
      <SiteHeader />
      <div
        id="content"
        tabIndex={-1}
        className="flex grow flex-col p-4 outline-none"
      >
        {children}
      </div>
    </LayoutBase>
  );
}
