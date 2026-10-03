import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { people, useAdminStore, type AdminBatch, type BatchStatus } from "@/lib/curriculum/admin-store";

export const Route = createFileRoute("/admin/batches/")({
  head: () => ({
    meta: [
      { title: "Batches — Super admin — EMFSC" },
      { name: "description", content: "Create, edit and remove batches and assign batch admins." },
      { property: "og:title", content: "Batches — Super admin — EMFSC" },
      { property: "og:description", content: "Create, edit and remove batches and assign batch admins." },
    ],
  }),
  component: BatchesPage,
});

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];
const empty = (): AdminBatch => ({ id: "", name: "", startDate: "", status: "upcoming", readingDays: [1, 2, 3, 4, 5], adminIds: [] });

function BatchesPage() {
  const { batches, groups, saveBatch, deleteBatch } = useAdminStore();
  const [edit, setEdit] = useState<AdminBatch | null>(null);
  const [confirm, setConfirm] = useState<AdminBatch | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Batches</h1>
          <p className="text-sm text-muted-foreground">{batches.length} batches</p>
        </div>
        <Button onClick={() => setEdit(empty())}><Plus /> New batch</Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {batches.map((b) => {
          const gs = groups.filter((g) => g.batchId === b.id);
          const admins = people.filter((p) => b.adminIds.includes(p.id));
          return (
            <div key={b.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground">{b.name}</h3>
                  <p className="text-xs text-muted-foreground">Starts {b.startDate} · {gs.length} groups · {gs.reduce((s, g) => s + g.members, 0)} members</p>
                </div>
                <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] capitalize text-accent-foreground">{b.status}</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Admin: {admins.length ? admins.map((a) => a.name).join(", ") : <span className="text-foreground">unassigned</span>}
              </p>
              <div className="mt-3 flex gap-2">
                <Button asChild size="sm" className="flex-1">
                  <Link to="/admin/batches/$batchId" params={{ batchId: b.id }}>Open <ChevronRight /></Link>
                </Button>
                <Button size="icon" variant="outline" aria-label="Edit batch" onClick={() => setEdit(b)}><Pencil /></Button>
                <Button size="icon" variant="outline" aria-label="Delete batch" onClick={() => setConfirm(b)}><Trash2 /></Button>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        {edit && (
          <DialogContent>
            <DialogHeader><DialogTitle>{edit.id ? "Edit batch" : "New batch"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Batch name, e.g. Batch 7" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} />
              <div className="grid grid-cols-2 gap-2">
                <Input type="date" value={edit.startDate} onChange={(e) => setEdit({ ...edit, startDate: e.target.value })} />
                <select value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value as BatchStatus })} className="h-9 rounded-md border border-input bg-background px-2 text-sm">
                  <option value="upcoming">Upcoming</option><option value="active">Active</option><option value="finished">Finished</option>
                </select>
              </div>
              <div>
                <p className="mb-1 text-xs text-muted-foreground">Reading days</p>
                <div className="grid grid-cols-7 gap-1">
                  {DAYS.map((d, i) => {
                    const on = edit.readingDays.includes(i);
                    return <button key={i} type="button" aria-pressed={on} onClick={() => setEdit({ ...edit, readingDays: on ? edit.readingDays.filter((x) => x !== i) : [...edit.readingDays, i].sort() })}
                      className={`h-9 rounded-lg text-xs font-semibold ${on ? "bg-primary text-primary-foreground" : "bg-surface-2 text-muted-foreground"}`}>{d}</button>;
                  })}
                </div>
              </div>
              <div>
                <p className="mb-1 text-xs text-muted-foreground">Batch admins</p>
                <div className="flex flex-wrap gap-1.5">
                  {people.map((p) => {
                    const on = edit.adminIds.includes(p.id);
                    return <button key={p.id} type="button" aria-pressed={on} onClick={() => setEdit({ ...edit, adminIds: on ? edit.adminIds.filter((x) => x !== p.id) : [...edit.adminIds, p.id] })}
                      className={`rounded-full px-3 py-1.5 text-xs ${on ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground"}`}>{p.name}</button>;
                  })}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button disabled={!edit.name || !edit.startDate} onClick={() => { saveBatch({ ...edit, id: edit.id || crypto.randomUUID() }); setEdit(null); }}>Save</Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      <Dialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete {confirm?.name}?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Its pace groups are removed too. Tasks already in the bank stay.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { deleteBatch(confirm!.id); setConfirm(null); }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
