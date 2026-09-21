import { useMemo, useState } from "react";
import { addDays, differenceInCalendarDays, format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { DutyChips, EditionPills, MiniProgress, SlotBadge, StatusChip } from "./shared";
import { books, paceAdmins, paceGroups } from "@/lib/curriculum/data";
import {
  fmt,
  fmtShort,
  groupTimeline,
  offsetWindows,
  percentBetween,
  statusLabel,
  toDate,
} from "@/lib/curriculum/schedule";
import type { Batch, BookProgress, PaceGroup } from "@/lib/curriculum/types";

const barStyles: Record<BookProgress["status"], string> = {
  done: "bg-teal/70 text-teal-foreground",
  current: "bg-primary text-primary-foreground",
  upNext: "border border-dashed border-primary/50 bg-transparent text-foreground",
  notStarted: "bg-muted text-muted-foreground",
};

export function RoadmapView({ batch, today }: { batch: Batch; today: Date }) {
  const groups = paceGroups.filter((g) => g.batchId === batch.id);
  const [openGroup, setOpenGroup] = useState<PaceGroup | null>(null);

  const timelines = useMemo(
    () =>
      groups.map((group) => ({
        group,
        rows: groupTimeline(batch, group.size, books, today),
      })),
    [batch, groups, today],
  );

  const from = toDate(batch.startDate);
  const to = useMemo(() => {
    const last = timelines.flatMap((t) => t.rows).map((r) => r.finishDate.getTime());
    return addDays(new Date(Math.max(...last)), 7);
  }, [timelines]);

  const weekCount = Math.max(1, Math.ceil(differenceInCalendarDays(to, from) / 7));
  const weeks = Array.from({ length: weekCount }, (_, i) => addDays(from, i * 7));
  const todayPct = percentBetween(today, from, to);

  const sortedBooks = [...books].sort((a, b) => a.slot - b.slot);

  return (
    <div className="space-y-6">
      <Card className="card-soft border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg">Book-by-book timeline</CardTitle>
          <p className="text-sm text-muted-foreground">
            One row per slot. One bar per pace group, from projected start to projected finish,
            counted only on this batch's reading days and shifted by its offsets.
          </p>
        </CardHeader>
        <CardContent>
          {/* Desktop Gantt */}
          <div className="hidden md:block">
            <div className="flex">
              <div className="w-56 shrink-0" />
              <div className="relative flex-1 border-b border-border pb-1">
                <div className="flex">
                  {weeks.map((w, i) => (
                    <div
                      key={w.toISOString()}
                      className="flex-1 border-l border-border/60 pl-1 text-[10px] text-muted-foreground"
                    >
                      {i % 2 === 0 ? format(w, "d MMM") : ""}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {sortedBooks.map((book) => (
              <div key={book.id} className="flex border-b border-border/60 py-3 last:border-b-0">
                <div className="w-56 shrink-0 pr-4">
                  <div className="flex items-center gap-2">
                    <SlotBadge slot={book.slot} />
                    <span className="text-sm font-semibold text-foreground">{book.title}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <EditionPills editions={book.editions} />
                    <span className="text-xs text-muted-foreground">{book.pageCount} pp</span>
                  </div>
                </div>

                <div className="relative flex-1 space-y-1.5">
                  {/* offsets */}
                  {offsetWindows(batch).map((w) => (
                    <Tooltip key={w.offset.id}>
                      <TooltipTrigger asChild>
                        <div
                          className="hatched absolute inset-y-0 opacity-70"
                          style={{
                            left: `${percentBetween(w.start, from, to)}%`,
                            width: `${Math.max(percentBetween(w.end, from, to) - percentBetween(w.start, from, to), 0.6)}%`,
                          }}
                          aria-hidden
                        />
                      </TooltipTrigger>
                      <TooltipContent>{w.offset.label}</TooltipContent>
                    </Tooltip>
                  ))}
                  {/* today */}
                  <div
                    className="absolute inset-y-0 z-10 w-0.5 bg-gold"
                    style={{ left: `${todayPct}%` }}
                    aria-hidden
                  />
                  {timelines.map(({ group, rows }) => {
                    const row = rows.find((r) => r.book.id === book.id)!;
                    const left = percentBetween(row.startDate, from, to);
                    const width = Math.max(percentBetween(row.finishDate, from, to) - left, 2);
                    return (
                      <div key={group.id} className="relative h-6">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => setOpenGroup(group)}
                              className={cn(
                                "absolute top-0 h-6 truncate rounded-md px-2 text-[11px] leading-6 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                                barStyles[row.status],
                              )}
                              style={{ left: `${left}%`, width: `${width}%` }}
                            >
                              {group.size}pp
                              {row.status === "current"
                                ? ` · page ${row.pagesRead} of ${book.pageCount}`
                                : ""}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {group.name} · {statusLabel(row.status)} · {fmtShort(row.startDate)} →{" "}
                            {fmt(row.finishDate)}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
              <Legend className="bg-teal/70" label="Done" />
              <Legend className="bg-primary" label="Current" />
              <Legend className="border border-dashed border-primary/50" label="Up next" />
              <Legend className="bg-muted" label="Not started" />
              <Legend className="bg-gold" label="Today" />
              <Legend className="hatched" label="Offset" />
            </div>
          </div>

          {/* Mobile stacked cards */}
          <div className="space-y-4 md:hidden">
            {sortedBooks.map((book) => (
              <div key={book.id} className="rounded-xl border border-border bg-surface-2 p-3">
                <div className="flex items-center gap-2">
                  <SlotBadge slot={book.slot} />
                  <span className="text-sm font-semibold text-foreground">{book.title}</span>
                </div>
                <div className="mt-1 mb-3 flex items-center gap-2">
                  <EditionPills editions={book.editions} />
                  <span className="text-xs text-muted-foreground">{book.pageCount} pp</span>
                </div>
                <div className="space-y-2">
                  {timelines.map(({ group, rows }) => {
                    const row = rows.find((r) => r.book.id === book.id)!;
                    return (
                      <button
                        key={group.id}
                        onClick={() => setOpenGroup(group)}
                        className="w-full text-left"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-medium text-foreground">{group.name}</span>
                          <StatusChip status={row.status} label={statusLabel(row.status)} />
                        </div>
                        <MiniProgress value={row.pagesRead} max={book.pageCount} />
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {fmtShort(row.startDate)} → {fmt(row.finishDate)}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="card-soft border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg">Pace groups in this batch</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs tracking-wide text-muted-foreground uppercase">
                <th className="py-2 pr-3 font-medium">Group</th>
                <th className="py-2 pr-3 font-medium">Members</th>
                <th className="py-2 pr-3 font-medium">Pace admins</th>
                <th className="py-2 pr-3 font-medium">Current book</th>
                <th className="py-2 pr-3 font-medium">Cursor</th>
                <th className="py-2 pr-3 font-medium">Projected finish</th>
                <th className="py-2 font-medium">Next book</th>
              </tr>
            </thead>
            <tbody>
              {timelines.map(({ group, rows }) => {
                const idx = rows.findIndex((r) => r.status === "current");
                const active = (idx >= 0 ? rows[idx] : rows[rows.length - 1])!;
                const next = rows[(idx >= 0 ? idx : rows.length - 1) + 1];
                const admins = paceAdmins.filter((a) =>
                  a.assignments.some((x) => x.groupId === group.id),
                );
                return (
                  <tr
                    key={group.id}
                    tabIndex={0}
                    onClick={() => setOpenGroup(group)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setOpenGroup(group);
                      }
                    }}
                    className="cursor-pointer border-b border-border/60 last:border-b-0 hover:bg-surface-2 focus-visible:bg-surface-2 focus-visible:outline-none"
                  >
                    <td className="py-3 pr-3 font-medium text-foreground">
                      {group.name}
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({group.size} pp/day)
                      </span>
                    </td>
                    <td className="py-3 pr-3 text-muted-foreground">{group.members}</td>
                    <td className="py-3 pr-3">
                      <div className="space-y-1">
                        {admins.map((a) => (
                          <div key={a.id} className="flex flex-wrap items-center gap-1">
                            <span className="text-xs font-medium text-foreground">{a.name}</span>
                            <DutyChips
                              duties={a.assignments.find((x) => x.groupId === group.id)!.duties}
                            />
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 pr-3 text-muted-foreground">{active.book.title}</td>
                    <td className="py-3 pr-3 text-muted-foreground">
                      {active.pagesRead} / {active.book.pageCount}
                    </td>
                    <td className="py-3 pr-3 text-muted-foreground">{fmt(active.finishDate)}</td>
                    <td className="py-3 text-muted-foreground">{next ? next.book.title : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="rounded-xl border border-gold/50 bg-gold/15 p-4 text-sm text-foreground">
        Groups finish books at different times. Nobody skips or reorders a book.
      </div>

      <Sheet open={openGroup !== null} onOpenChange={(o) => !o && setOpenGroup(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {openGroup && (
            <>
              <SheetHeader>
                <SheetTitle>{openGroup.name} sequence</SheetTitle>
                <SheetDescription>
                  {batch.name} · {openGroup.size} pages a day · {openGroup.members} members
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-3 p-4">
                {groupTimeline(batch, openGroup.size, books, today).map((row) => (
                  <div key={row.book.id} className="rounded-lg border border-border bg-surface-2 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <SlotBadge slot={row.book.slot} />
                        {row.book.title}
                      </span>
                      <StatusChip status={row.status} label={statusLabel(row.status)} />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {row.pagesRead} / {row.book.pageCount} pages · {fmtShort(row.startDate)} →{" "}
                      {fmt(row.finishDate)}
                    </p>
                    <div className="mt-2">
                      <MiniProgress value={row.pagesRead} max={row.book.pageCount} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("inline-block h-3 w-5 rounded", className)} aria-hidden />
      {label}
    </span>
  );
}
