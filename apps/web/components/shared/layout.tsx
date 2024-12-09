import { Sidebar } from "~/components/base/sidebar";

export function LayoutWrapper({ children, sidebar }: { children: React.ReactNode, sidebar?: React.ReactNode }) {
  return (
    <main className="font-[family-name:var(--font-geist-sans)] w-full flex flex-1 flex-col px-4 md:px-6 pb-20">
      {/* // ? docs: https://ui.shadcn.com/docs/components/sidebar#structure */}
      {/* // * Sidebar can go either at layout or page level, depending the required context, but always at same layout level */}
      {sidebar && (
        <Sidebar>
          {sidebar}
        </Sidebar>
      )}
      {children}
    </main>
  );
}