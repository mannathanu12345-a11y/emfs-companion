import { useMemo, useState } from "react";
import { isSameDay } from "date-fns";
import { CheckCircle2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DutyChips, EditionPills, MiniProgress, SlotBadge, StatusChip } from "./shared";
import { DUTY_LABELS, books, masterTask, paceAdmins, paceGroups } from "@/lib/curriculum/data";
import { batchDayNumber, fmt, fmtShort, groupTimeline, statusLabel } from "@/lib/curriculum/schedule";
import type { Batch, PaceAdmin } from "@/lib/curriculum/types";

export function PaceAdminView({ batch, today }: { batch: Batch; today: Date }) {
  const admins = paceAdmins.filter((a) =>
    a.assignments.some((x) => paceGroups.find((g) => g.id === x.groupId)?.batchId === batch.id),
  );
  const [adminId, setAdminId] = useState(admins[0]?.id ?? "");
  const admin: PaceAdmin | undefined = admins.find((a) => a.id === adminId) ?? admins[0];

  const myGroups = useMemo(
    () =>
      (admin?.assignments ?? [])
        .map((a) => ({
          assignment: a,
          group: paceGroups.find((g) => g.id === a.groupId)!,
        }))
        .filter((x) => x.group?.batchId === batch.id),
    [admin, batch.id],
  );

  const [groupId, setGroupId] = useState(myGroups[0]?.group.id ?? "");
  const activeEntry = myGroups.find((x) => x.group.id === groupId) ?? myGroups[0];

  const [published, setPublished] = useState<Record<string, boolean>>({});
  const [startedNext, setStartedNext] = useState<Record<string, boolean>>({});

  if (!admin || !activeEntry) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="pt-6 text-sm text-muted-foreground">
          No pace admin is assigned to {batch.name} yet.
        </CardContent>
      </Card>
    );
  }

  const { group, assignment } = activeEntry;
  const rows = groupTimeline(batch, group.size, books, today);
  const currentIdx = rows.findIndex((r) => r.status === "current");
  const current = currentIdx >= 0 ? rows[currentIdx] : rows[rows.length - 1];
  const next = rows[(currentIdx >= 0 ? currentIdx : rows.length - 1) + 1];
  const completedToday = rows.find((r) => r.status === "done" && isSameDay(r.finishDate, today));
  const canPublishDuty = assignment.duties.includes("daily_task");
  const bookLocked = (bookId: string) =>
    assignment.assignedBookId !== undefined && assignment.assignedBookId !== bookId;
  const otherAdminFor = (bookId: string) =>
    paceAdmins.find(
      (a) =>
        a.id !== admin.id &&
        a.assignments.some(
          (x) =>
            x.groupId === group.id && (x.assignedBookId === undefined || x.assignedBookId === bookId),
        ),
    )?.name ?? "another pace admin";
  const dailyTaskOwner =
    paceAdmins.find(
      (a) =>
        a.assignments.some((x) => x.groupId === group.id && x.duties.includes("daily_task")),
    )?.name ?? "nobody yet";

  const publishKey = `${group.id}:${current.book.id}:${current.dayInBook}`;
  const activeVisible = !bookLocked(current.book.id);

  return (
    <div className="space-y-6">
      <Card className="card-soft border-border bg-card">
        <CardHeader className="gap-3">
          <CardTitle className="text-lg">My sequence</CardTitle>
          <p className="text-sm text-muted-foreground">
            You admin {myGroups.length} {myGroups.length === 1 ? "group" : "groups"}. Today you
            publish for: {batch.name} / {group.name} / {current.book.title}, day{" "}
            {current.dayInBook ?? "—"}.
            {next && (
              <>
                {" "}
                Next book after this one: {next.book.title}, starts ~{fmt(next.startDate)}.
              </>
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            <Select value={admin.id} onValueChange={setAdminId}>
              <SelectTrigger className="w-52" aria-label="Pace admin">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {admins.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={group.id} onValueChange={setGroupId}>
              <SelectTrigger className="w-52" aria-label="Pace group">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {myGroups.map((x) => (
                  <SelectItem key={x.group.id} value={x.group.id}>
                    {x.group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center">
              <DutyChips duties={assignment.duties} />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <ol className="space-y-3">
            {rows.map((row) => {
              const locked = bookLocked(row.book.id);
              const isHere = row.status === "current";
              return (
                <li
                  key={row.book.id}
                  className="relative rounded-xl border border-border bg-surface-2 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <SlotBadge slot={row.book.slot} />
                      {row.book.title}
                      <EditionPills editions={row.book.editions} />
                    </span>
                    {locked ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                        <Lock className="size-3" aria-hidden /> Handled by {otherAdminFor(row.book.id)}
                      </span>
                    ) : (
                      <StatusChip status={row.status} />
                    )}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {row.pagesRead} / {row.book.pageCount} pages · {fmtShort(row.startDate)} →{" "}
                    {fmt(row.finishDate)} · {statusLabel(row.status)}
                  </p>
                  <div className="mt-2">
                    <MiniProgress value={row.pagesRead} max={row.book.pageCount} />
                  </div>

                  {isHere && !locked && (
                    <div className="mt-4 space-y-3 rounded-lg border border-border bg-card p-3">
                      <p className="text-xs tracking-wide text-muted-foreground uppercase">
                        Batch day {batchDayNumber(batch, today)} · day {row.dayInBook} of this book
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {masterTask(row.book.id, row.dayInBook ?? 1).topic}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Today's draft pages: {Math.min(row.cursor + 1, row.book.pageCount)} –{" "}
                        {Math.min(row.cursor + group.size, row.book.pageCount)}. English and Amharic
                        readers share this day and topic; only page numbers differ by edition.
                      </p>
                      {canPublishDuty ? (
                        <Button
                          onClick={() => setPublished((p) => ({ ...p, [publishKey]: true }))}
                          disabled={published[publishKey]}
                        >
                          {published[publishKey] ? (
                            <>
                              <CheckCircle2 className="size-4" aria-hidden /> Published
                            </>
                          ) : (
                            "Approve & publish"
                          )}
                        </Button>
                      ) : (
                        <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
                          Read-only. Daily task is assigned to {dailyTaskOwner}. Your duties here:{" "}
                          {assignment.duties.map((d) => DUTY_LABELS[d]).join(", ")}.
                        </p>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ol>

          {!activeVisible && (
            <p className="mt-4 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
              You are assigned only to{" "}
              {books.find((b) => b.id === assignment.assignedBookId)?.title}. This group is reading a
              different book right now, so there is nothing for you to publish today.
            </p>
          )}
        </CardContent>
      </Card>

      {completedToday && (
        <Card className="card-soft border-teal/50 bg-accent">
          <CardHeader>
            <CardTitle className="text-lg">Book complete</CardTitle>
            <p className="text-sm text-accent-foreground">
              {group.name} finished {completedToday.book.title} on {fmt(completedToday.finishDate)}.
              Nothing advances until you confirm.
            </p>
          </CardHeader>
          {next && (
            <CardContent className="space-y-3">
              <div className="rounded-lg border border-border bg-card p-3">
                <p className="text-sm font-semibold text-foreground">
                  Next: {next.book.title} · starts {fmt(next.startDate)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  First draft: pages 1 – {Math.min(group.size, next.book.pageCount)} ·{" "}
                  {masterTask(next.book.id, 1).topic}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setStartedNext((s) => ({ ...s, [next.book.id]: true }))}
                disabled={startedNext[next.book.id]}
              >
                {startedNext[next.book.id] ? "Next book started" : "Start next book"}
              </Button>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}
