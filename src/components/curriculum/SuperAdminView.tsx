import { useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clock3,
  Layers3,
  Search,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EditionPills, MiniProgress, SlotBadge } from "./shared";
import { books } from "@/lib/curriculum/data";

const PAGE_SIZE = 2;

const batchSnapshots = [
  {
    id: "batch-4",
    name: "Batch 4",
    state: "Leading batch",
    groups: 4,
    members: 148,
    progress: 34,
    detail: "40-page group has reached Book 2",
  },
  {
    id: "batch-5",
    name: "Batch 5",
    state: "Following batch",
    groups: 2,
    members: 40,
    progress: 12,
    detail: "Reusing 8 approved daily tasks",
  },
];

export function SuperAdminView() {
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState("");
  const [decisionMade, setDecisionMade] = useState(false);

  const visibleBooks = books.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const pageCount = Math.ceil(books.length / PAGE_SIZE);
  const searchResult = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    return books.filter(
      (book) =>
        book.title.toLowerCase().includes(normalized) ||
        book.author.toLowerCase().includes(normalized),
    );
  }, [query]);

  return (
    <div className="space-y-6">
      <section aria-labelledby="overview-title">
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase text-teal-foreground">Super admin</p>
            <h2 id="overview-title" className="mt-1 text-2xl font-semibold text-foreground">
              Curriculum overview
            </h2>
          </div>
          <span className="text-xs text-muted-foreground">Updated today</span>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: "Books", value: "3", note: "in slot order", icon: BookOpen },
            { label: "Active batches", value: "2", note: "188 readers", icon: Layers3 },
            { label: "Pace groups", value: "6", note: "across batches", icon: Users },
            {
              label: "Needs review",
              value: decisionMade ? "0" : "1",
              note: decisionMade ? "all cleared" : "task revision",
              icon: CircleAlert,
            },
          ].map((item) => (
            <Card key={item.label} className="border-border bg-card shadow-none">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
                  <item.icon className="size-4 shrink-0 text-teal-foreground" aria-hidden />
                </div>
                <p className="mt-2 text-2xl font-semibold text-foreground">{item.value}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{item.note}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {!decisionMade && (
        <Card className="overflow-hidden border-gold/60 bg-card shadow-none">
          <div className="h-1 bg-gold" />
          <CardHeader className="p-4 pb-3 sm:p-5 sm:pb-3">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Clock3 className="size-4 shrink-0 text-gold-foreground" aria-hidden />
                  <p className="text-xs font-semibold uppercase text-gold-foreground">Revision request</p>
                </div>
                <CardTitle className="mt-2 text-base leading-snug">
                  Batch 5 improved a reusable daily task
                </CardTitle>
              </div>
              <span className="rounded-full bg-warning px-2 py-1 text-[11px] font-medium text-warning-foreground">
                Pending
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-5 sm:pt-0">
            <p className="text-sm text-muted-foreground">
              The Sealed Nectar · 10 pages/day · Step 8. Review the proposed clarification before
              making it available to future batches.
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Button className="sm:flex-1" onClick={() => setDecisionMade(true)}>
                <Check aria-hidden /> Approve for future batches
              </Button>
              <Button variant="outline" className="sm:flex-1">
                Compare versions <ArrowRight aria-hidden />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <section aria-labelledby="catalog-title">
        <div className="mb-3 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
          <div className="min-w-0">
            <h2 id="catalog-title" className="text-xl font-semibold text-foreground">Book catalog</h2>
            <p className="mt-1 text-sm text-muted-foreground">The fixed reading order for every batch.</p>
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">{books.length} books</span>
        </div>

        <div className="space-y-3">
          {visibleBooks.map((book) => (
            <Card key={book.id} className="border-border bg-card shadow-none">
              <CardContent className="p-4 sm:p-5">
                <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
                  <SlotBadge slot={book.slot} />
                  <div className="min-w-0">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground">{book.title}</h3>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">{book.author}</p>
                      </div>
                      <EditionPills editions={book.editions} />
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-3 text-center">
                      <BookFact value={`${book.pageCount}`} label="pages" />
                      <BookFact value={book.slot === 1 ? "10" : book.slot === 2 ? "6" : "0"} label="pace steps" />
                      <BookFact value={book.slot === 1 ? "2" : "0"} label="batches active" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Page {page + 1} of {pageCount}</p>
          <div className="flex gap-2">
            <Button size="icon" variant="outline" aria-label="Previous books" disabled={page === 0} onClick={() => setPage((value) => value - 1)}>
              <ChevronLeft />
            </Button>
            <Button size="icon" variant="outline" aria-label="Next books" disabled={page === pageCount - 1} onClick={() => setPage((value) => value + 1)}>
              <ChevronRight />
            </Button>
          </div>
        </div>
      </section>

      <section aria-labelledby="batch-progress-title">
        <div className="mb-3">
          <h2 id="batch-progress-title" className="text-xl font-semibold text-foreground">Batch progress</h2>
          <p className="mt-1 text-sm text-muted-foreground">See who is leading and where reusable tasks come from.</p>
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          {batchSnapshots.map((batch) => (
            <Card key={batch.id} className="border-border bg-card shadow-none">
              <CardContent className="p-4 sm:p-5">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground">{batch.name}</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">{batch.groups} groups · {batch.members} readers</p>
                  </div>
                  <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-medium text-accent-foreground">{batch.state}</span>
                </div>
                <div className="mt-4">
                  <div className="mb-2 flex justify-between text-xs">
                    <span className="text-muted-foreground">Overall curriculum progress</span>
                    <span className="font-semibold text-foreground">{batch.progress}%</span>
                  </div>
                  <MiniProgress value={batch.progress} max={100} />
                </div>
                <p className="mt-3 text-sm text-foreground">{batch.detail}</p>
                <Button variant="ghost" className="mt-2 h-8 px-0 text-primary">View roadmap <ArrowRight /></Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Card className="border-border bg-surface-2 shadow-none">
        <CardHeader className="p-4 pb-2 sm:p-5 sm:pb-2">
          <CardTitle className="text-base">Find a daily task</CardTitle>
          <p className="text-sm text-muted-foreground">Use this only when you need to inspect a task.</p>
        </CardHeader>
        <CardContent className="p-4 pt-2 sm:p-5 sm:pt-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by book or author" className="bg-card pl-9" />
          </div>
          {query && (
            <div className="mt-3 rounded-md border border-border bg-card p-3 text-sm" aria-live="polite">
              {searchResult.length > 0 ? `${searchResult.length} matching book${searchResult.length === 1 ? "" : "s"} found.` : "No matching tasks found."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function BookFact({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-sm font-semibold text-foreground">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}