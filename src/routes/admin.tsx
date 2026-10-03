import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { BookOpen, LayoutDashboard, Layers3, UserCircle } from "lucide-react";
import { AdminStoreProvider, ROLE_LABELS, useAdminStore } from "@/lib/curriculum/admin-store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Super admin workspace — EMFSC Book Shelf" },
      { name: "description", content: "Manage batches, batch admins and the book catalog for EMFSC reading groups." },
      { property: "og:title", content: "Super admin workspace — EMFSC Book Shelf" },
      { property: "og:description", content: "Overview, batches, catalog and roles in one mobile-first workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <AdminStoreProvider>
      <Shell />
    </AdminStoreProvider>
  ),
});

const NAV = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/batches", label: "Batches", icon: Layers3, exact: false },
  { to: "/admin/catalog", label: "Catalog", icon: BookOpen, exact: false },
  { to: "/admin/profile", label: "Profile", icon: UserCircle, exact: false },
] as const;

function Shell() {
  const { role } = useAdminStore();
  return (
    <div className="min-h-screen bg-background md:flex">
      <aside className="hidden w-60 shrink-0 border-r border-border bg-card p-4 md:block">
        <Link to="/" className="block px-2 text-sm font-semibold text-foreground">EMFSC Book Shelf</Link>
        <p className="px-2 text-xs text-muted-foreground">{ROLE_LABELS[role]}</p>
        <nav className="mt-6 space-y-1">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: n.exact }}
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-surface-2"
              activeProps={{ className: "bg-primary/10 !text-foreground font-semibold" }}>
              <n.icon className="size-4" /> {n.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 px-4 pb-24 pt-5 md:px-8 md:pb-10">
        {role !== "super_admin" && (
          <div className="mb-4 rounded-xl bg-gold/15 px-3 py-2 text-xs text-foreground">
            Viewing as {ROLE_LABELS[role]} (preview). Switch back in Profile.
          </div>
        )}
        <div className="mx-auto max-w-4xl"><Outlet /></div>
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-border bg-card md:hidden">
        {NAV.map((n) => (
          <Link key={n.to} to={n.to} activeOptions={{ exact: n.exact }}
            className="flex flex-col items-center gap-0.5 py-2 text-[11px] text-muted-foreground"
            activeProps={{ className: "!text-primary font-semibold" }}>
            <n.icon className="size-5" /> {n.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
