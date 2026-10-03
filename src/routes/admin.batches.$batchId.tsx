import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BatchOverview } from "@/components/curriculum/BatchOverview";
import { people, useAdminStore } from "@/lib/curriculum/admin-store";

export const Route = createFileRoute("/admin/batches/$batchId")({
  head: () => ({
    meta: [
      { title: "Batch detail — Super admin — EMFSC" },
      { name: "description", content: "Schedule, batch admins and pace groups for one batch." },
      { property: "og:title", content: "Batch detail — Super admin — EMFSC" },
      { property: "og:description", content: "Schedule, batch admins and pace groups for one batch." },
    ],
  }),
  component: BatchDetail,
});

function BatchDetail() {
  const { batchId } = Route.useParams();
  const { batches, groups, saveGroup, deleteGroup } = useAdminStore();
  const [size, setSize] = useState(10);
  const batch = batches.find((b) => b.id === batchId);

  if (!batch) {
    return <div className="text-sm text-muted-foreground">Batch not found. <Link to="/admin/batches" className="text-primary">Back to batches</Link></div>;
  }
  const gs = groups.filter((g) => g.batchId === batchId);

  return (
    <div className="space-y-4">
      <Link to="/admin/batches" className="inline-flex items-center gap-1 text-sm text-muted-foreground"><ChevronLeft className="size-4" /> Batches</Link>
      <h1 className="text-2xl font-semibold text-foreground">{batch.name}</h1>
      <BatchOverview batch={batch} groups={gs} admins={people.filter((p) => batch.adminIds.includes(p.id))} />

      <section className="rounded-2xl border border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground">Manage pace groups</h3>
        <ul className="mt-2 space-y-1">
          {gs.map((g) => (
            <li key={g.id} className="flex items-center justify-between rounded-lg bg-surface-2 px-3 py-2 text-sm">
              <span className="text-foreground">{g.name}</span>
              <button aria-label={`Remove ${g.name}`} onClick={() => deleteGroup(g.id)} className="p-1 text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></button>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex gap-2">
          <Input type="number" min={1} value={size} onChange={(e) => setSize(Number(e.target.value) || 1)} aria-label="Pages per day" className="w-24" />
          <Button className="flex-1" disabled={gs.some((g) => g.size === size)}
            onClick={() => saveGroup({ id: crypto.randomUUID(), batchId, name: `${size}-page group`, size, members: 0 })}>
            <Plus /> Add {size}-page group
          </Button>
        </div>
      </section>
    </div>
  );
}
