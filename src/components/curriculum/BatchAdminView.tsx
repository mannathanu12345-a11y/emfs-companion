import { CalendarDays, CalendarOff, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MiniProgress } from "./shared";
import { books, paceGroups } from "@/lib/curriculum/data";
import { batchDayNumber, fmt, groupTimeline, offsetWindows } from "@/lib/curriculum/schedule";
import type { Batch } from "@/lib/curriculum/types";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function BatchAdminView({
  batch,
  today,
  onOpenRoadmap,
}: {
  batch: Batch;
  today: Date;
  onOpenRoadmap: () => void;
}) {
  const groups = paceGroups.filter((g) => g.batchId === batch.id);
  const day = batchDayNumber(batch, today);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="card-soft border-border bg-card">
          <CardContent className="space-y-1 pt-6">
            <p className="inline-flex items-center gap-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              <CalendarDays className="size-4" aria-hidden /> Batch calendar
            </p>
            <p className="text-sm text-foreground">Started {fmt(new Date(batch.startDate))}</p>
            <p className="text-sm text-muted-foreground">
              {batch.readingDaysPerWeek.map((d) => DAY_NAMES[d]).join(" · ")}
            </p>
          </CardContent>
        </Card>
        <Card className="card-soft border-border bg-card">
          <CardContent className="space-y-1 pt-6">
            <p className="inline-flex items-center gap-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              <CalendarOff className="size-4" aria-hidden /> Offsets
            </p>
            {offsetWindows(batch).map((w) => (
              <p key={w.offset.id} className="text-sm text-foreground">
                {w.offset.label} · from {fmt(w.start)}
              </p>
            ))}
          </CardContent>
        </Card>
        <Card className="card-soft border-border bg-card">
          <CardContent className="space-y-1 pt-6">
            <p className="inline-flex items-center gap-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              <Users className="size-4" aria-hidden /> Today
            </p>
            <p className="text-sm text-foreground">Batch day {day}</p>
            <p className="text-sm text-muted-foreground">
              {groups.length} pace groups · {groups.reduce((s, g) => s + g.members, 0)} members
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="card-soft border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle className="text-lg">Group progress</CardTitle>
          <Button variant="outline" size="sm" onClick={onOpenRoadmap}>
            Open roadmap
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {groups.map((group) => {
            const timeline = groupTimeline(batch, group.size, books, today);
            const active = timeline.find((t) => t.status === "current") ?? timeline[0]!;
            return (
              <button
                key={group.id}
                onClick={onOpenRoadmap}
                className="w-full rounded-xl border border-border bg-surface-2 p-3 text-left transition-colors hover:border-teal focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold text-foreground">{group.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {active.book.title} · page {active.pagesRead} of {active.book.pageCount}
                  </span>
                </div>
                <div className="mt-2">
                  <MiniProgress value={active.pagesRead} max={active.book.pageCount} />
                </div>
              </button>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
