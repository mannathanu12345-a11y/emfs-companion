import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EditionPills, SlotBadge } from "@/components/curriculum/shared";
import { useAdminStore } from "@/lib/curriculum/admin-store";
import type { Book, Edition } from "@/lib/curriculum/types";

export const Route = createFileRoute("/admin/catalog")({
  head: () => ({
    meta: [
      { title: "Book catalog — Super admin — EMFSC" },
      { name: "description", content: "Add, edit, reorder and remove books in the reading order." },
      { property: "og:title", content: "Book catalog — Super admin — EMFSC" },
      { property: "og:description", content: "Add, edit, reorder and remove books in the reading order." },
    ],
  }),
  component: CatalogPage,
});

function CatalogPage() {
  const { books, saveBook, deleteBook, moveBook } = useAdminStore();
  const [edit, setEdit] = useState<Book | null>(null);
  const [q, setQ] = useState("");
  const list = books.filter((b) => (b.title + b.author).toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Catalog</h1>
          <p className="text-sm text-muted-foreground">Slot order is the reading order for every batch.</p>
        </div>
        <Button onClick={() => setEdit({ id: "", slot: books.length + 1, title: "", author: "", pageCount: 100, editions: ["EN"] })}><Plus /> Add book</Button>
      </div>
      <Input placeholder="Search title or author" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="space-y-2">
        {list.map((b) => (
          <div key={b.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
            <SlotBadge slot={b.slot} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-foreground">{b.title}</p>
              <p className="truncate text-xs text-muted-foreground">{b.author} · {b.pageCount} pages</p>
              <div className="mt-1"><EditionPills editions={b.editions} /></div>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <Button size="icon" variant="ghost" aria-label="Move up" disabled={b.slot === 1} onClick={() => moveBook(b.id, -1)}><ArrowUp /></Button>
              <Button size="icon" variant="ghost" aria-label="Edit" onClick={() => setEdit(b)}><Pencil /></Button>
              <Button size="icon" variant="ghost" aria-label="Move down" disabled={b.slot === books.length} onClick={() => moveBook(b.id, 1)}><ArrowDown /></Button>
              <Button size="icon" variant="ghost" aria-label="Delete" onClick={() => deleteBook(b.id)}><Trash2 /></Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        {edit && (
          <DialogContent>
            <DialogHeader><DialogTitle>{edit.id ? "Edit book" : "Add book"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Title" value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} />
              <Input placeholder="Author" value={edit.author} onChange={(e) => setEdit({ ...edit, author: e.target.value })} />
              <Input type="number" min={1} aria-label="Page count" value={edit.pageCount} onChange={(e) => setEdit({ ...edit, pageCount: Number(e.target.value) || 1 })} />
              <div className="flex gap-2">
                {(["EN", "AM"] as Edition[]).map((ed) => {
                  const on = edit.editions.includes(ed);
                  return <button key={ed} type="button" aria-pressed={on} onClick={() => setEdit({ ...edit, editions: on ? edit.editions.filter((x) => x !== ed) : [...edit.editions, ed] })}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold ${on ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground"}`}>{ed}</button>;
                })}
              </div>
            </div>
            <DialogFooter>
              <Button disabled={!edit.title || !edit.author || !edit.editions.length} onClick={() => { saveBook({ ...edit, id: edit.id || crypto.randomUUID() }); setEdit(null); }}>Save</Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
