import { useState } from "react";
import { ArrowDown, ArrowUp, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditionPills, SlotBadge } from "./shared";
import { books as initialBooks, masterTask } from "@/lib/curriculum/data";
import type { Book } from "@/lib/curriculum/types";

function renumber(list: Book[]): Book[] {
  return list.map((b, i) => ({ ...b, slot: i + 1 }));
}

export function SuperAdminView() {
  const [catalog, setCatalog] = useState<Book[]>(initialBooks);

  const move = (index: number, delta: number) => {
    const next = [...catalog];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    const a = next[index]!;
    next[index] = next[target]!;
    next[target] = a;
    setCatalog(renumber(next));
  };

  return (
    <div className="space-y-6">
      <Card className="card-soft border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg">Global book catalog</CardTitle>
          <p className="text-sm text-muted-foreground">
            Slots are assigned automatically as <span className="font-mono">max + 1</span>. Reorder
            with the arrows; slots stay contiguous from 1 with no gaps. Amharic and English editions
            of one title share a single slot.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {catalog.map((book, i) => (
            <div
              key={book.id}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface-2 p-3"
            >
              <SlotBadge slot={book.slot} />
              <div className="min-w-40 flex-1">
                <p className="text-sm font-semibold text-foreground">{book.title}</p>
                <p className="text-xs text-muted-foreground">{book.author}</p>
              </div>
              <EditionPills editions={book.editions} />
              <span className="text-xs text-muted-foreground">{book.pageCount} pp</span>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <BookOpen className="size-3.5" aria-hidden />
                {Math.ceil(book.pageCount / 5)} master tasks
              </span>
              <div className="flex gap-1">
                <Button
                  size="icon"
                  variant="outline"
                  aria-label={`Move ${book.title} up`}
                  disabled={i === 0}
                  onClick={() => move(i, -1)}
                >
                  <ArrowUp className="size-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  aria-label={`Move ${book.title} down`}
                  disabled={i === catalog.length - 1}
                  onClick={() => move(i, 1)}
                >
                  <ArrowDown className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="card-soft border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg">Master tasks, written once</CardTitle>
          <p className="text-sm text-muted-foreground">
            A master task belongs to the book, not to a batch or a group. Every group reads the same
            topic on its own day number for that book.
          </p>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2">
          {[1, 2, 3, 4].map((day) => (
            <div key={day} className="rounded-lg border border-border bg-surface-2 p-3">
              <p className="text-xs font-mono text-muted-foreground">
                {catalog[0]!.title} · day {day}
              </p>
              <p className="text-sm font-medium text-foreground">
                {masterTask(catalog[0]!.id, day).topic}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
