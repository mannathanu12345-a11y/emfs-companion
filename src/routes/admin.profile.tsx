import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { ROLE_LABELS, useAdminStore, type Role } from "@/lib/curriculum/admin-store";

export const Route = createFileRoute("/admin/profile")({
  head: () => ({
    meta: [
      { title: "Profile & role — Super admin — EMFSC" },
      { name: "description", content: "Your profile and the role you are viewing the app as." },
      { property: "og:title", content: "Profile & role — Super admin — EMFSC" },
      { property: "og:description", content: "Your profile and the role you are viewing the app as." },
    ],
  }),
  component: ProfilePage,
});

const HINT: Record<Role, string> = {
  super_admin: "Catalog, batches, admins and approvals.",
  batch_admin: "One batch: reading days, breaks, pace admins.",
  pace_admin: "One group: today's task, reflections, attendance.",
};

function ProfilePage() {
  const { role, setRole } = useAdminStore();
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
        <div className="flex size-12 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">M</div>
        <div>
          <p className="font-semibold text-foreground">Muhammed Ahmed</p>
          <p className="text-xs text-muted-foreground">+251 911 000 100 · Super admin</p>
        </div>
      </div>
      <section className="rounded-2xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold text-foreground">View the app as</h2>
        <p className="text-xs text-muted-foreground">Preview other roles without signing out.</p>
        <div className="mt-3 space-y-2">
          {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
            <button key={r} onClick={() => setRole(r)} aria-pressed={role === r}
              className={`flex w-full items-center justify-between rounded-xl border p-3 text-left ${role === r ? "border-primary bg-primary/5" : "border-border"}`}>
              <span>
                <span className="block text-sm font-medium text-foreground">{ROLE_LABELS[r]}</span>
                <span className="block text-xs text-muted-foreground">{HINT[r]}</span>
              </span>
              {role === r && <Check className="size-4 text-primary" />}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
