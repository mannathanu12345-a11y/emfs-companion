import { useState } from "react";
import { isSameDay } from "date-fns";
import { CheckCircle2, Lock, Users, BookOpen, MessageSquare, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DutyChips, EditionPills, MiniProgress, SlotBadge, StatusChip } from "./shared";
import { DUTY_LABELS, batches, books, masterTask, paceAdmins, paceGroups } from "@/lib/curriculum/data";
import { batchDayNumber, fmt, fmtShort, groupTimeline } from "@/lib/curriculum/schedule";
import type { Batch, Duty } from "@/lib/curriculum/types";
import { cn } from "@/lib/utils";

type Tab = "today" | "roadmap" | "members";

// Hard-coded member summary (prototype)
const MEMBERS = [
  { name: "Abdurahman K.", reflected: true, present: true, streak: 12 },
  { name: "Fatuma H.", reflected: true, present: true, streak: 9 },
  { name: "Musa J.", reflected: false, present: true, streak: 3 },
  { name: "Hanan S.", reflected: false, present: false, streak: 0 },
  { name: "Ikram A.", reflected: true, present: true, streak: 15 },
];

export function PaceAdminView({ today }: { batch: Batch; today: Date }) {
  const [adminId, setAdminId] = useState(paceAdmins[0]!.id);
  const admin = paceAdmins.find((a) => a.id === adminId)!;
  const entries = admin.assignments.map((a) => {
    const group = paceGroups.find((g) => g.id === a.groupId)!;
    return { assignment: a, group, batch: batches.find((b) => b.id === group.batchId)! };
  });
  const [groupId, setGroupId] = useState(entries[0]!.group.id);
  const entry = entries.find((e) => e.group.id === groupId) ?? entries[0]!;
  const { group, assignment, batch } = entry;
  const [tab, setTab] = useState<Tab>("today");
  const [published, setPublished] = useState<Record<string, boolean>>({});
  const [startedNext, setStartedNext] = useState(false);

  const rows = groupTimeline(batch, group.size, books, today);
  const ci = rows.findIndex((r) => r.status === "current");
  const current = rows[ci >= 0 ? ci : rows.length - 1]!;
  const next = rows[(ci >= 0 ? ci : rows.length - 1) + 1];
  const finishedToday = rows.find((r) => r.status === "done" && isSameDay(r.finishDate, today));
  const has = (d: Duty) => assignment.duties.includes(d);
  const locked = assignment.assignedBookId !== undefined && assignment.assignedBookId !== current.book.id;
  const step = current.dayInBook ?? 1;
  const from = Math.min(current.cursor + 1, current.book.pageCount);
  const to = Math.min(current.cursor + group.size, current.book.pageCount);
  const totalSteps = Math.ceil(current.book.pageCount / group.size);

  // Pioneer or follower: did another batch with the same pace already pass this step?
  const leader = paceGroups
    .filter((g) => g.size === group.size && g.batchId !== batch.id)
    .map((g) => {
      const b = batches.find((x) => x.id === g.batchId)!;
      const r = groupTimeline(b, g.size, books, today).find((x) => x.book.id === current.book.id)!;
      return { b, passed: r.pagesRead >= to };
    })
    .find((x) => x.passed);
  const topic = masterTask(current.book.id, step).topic;
  const key = `${group.id}:${current.book.id}:${step}`;

  const [title, setTitle] = useState("");
  const [hl, setHl] = useState("");
  const [q, setQ] = useState("");
  const shownTitle = leader ? topic : title;
  const shownHl = leader ? ["Sincerity before action", "Guard the tongue", "Small consistent deeds"] : hl.split("\n").filter(Boolean);
  const shownQ = leader ? "Which passage today challenged a habit you hold?" : q;

  const reflected = MEMBERS.filter((m) => m.reflected).length;
  const present = MEMBERS.filter((m) => m.present).length;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {/* Who + which group */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Select value={adminId} onValueChange={(v) => { setAdminId(v); const a = paceAdmins.find((x) => x.id === v)!; setGroupId(a.assignments[0]!.groupId); }}>
          <SelectTrigger aria-label="Pace admin"><SelectValue /></SelectTrigger>
          <SelectContent>{paceAdmins.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={group.id} onValueChange={setGroupId}>
          <SelectTrigger aria-label="My groups"><SelectValue /></SelectTrigger>
          <SelectContent>
            {entries.map((e) => <SelectItem key={e.group.id} value={e.group.id}>{e.batch.name} · {e.group.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Group header */}
      <Card className="card-soft border-border bg-card">
        <CardContent className="space-y-3 pt-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">{batch.name} · day {batchDayNumber(batch, today)}</p>
              <h2 className="text-xl font-semibold text-foreground">{group.name}</h2>
            </div>
            <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", leader ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground")}>
              {leader ? `Follower of ${leader.b.name}` : "Pioneer"}
            </span>
          </div>
          <DutyChips duties={assignment.duties} />
          <div className="grid grid-cols-3 gap-2 text-center">
            <Stat icon={<Users className="size-4" />} value={group.members} label="Members" />
            <Stat icon={<BookOpen className="size-4" />} value={`${step}/${totalSteps}`} label="Step" />
            <Stat icon={<MessageSquare className="size-4" />} value={`${Math.round((reflected / MEMBERS.length) * 100)}%`} label="Reflected" />
          </div>
          {entries.length > 1 && (
            <p className="text-xs text-muted-foreground">You manage {entries.length} groups. Switch above to publish for each.</p>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-1 rounded-xl bg-surface-container p-1">
        {(["today", "roadmap", "members"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn("rounded-lg py-2 text-sm font-medium capitalize", tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")}>
            {t === "today" ? "Today" : t}
          </button>
        ))}
      </div>

      {tab === "today" && (
        <div className="space-y-4">
          {locked ? (
            <Note><Lock className="mr-1 inline size-3" />You only handle {books.find((b) => b.id === assignment.assignedBookId)?.title}. Nothing to publish today.</Note>
          ) : (
            <Card className="border-border bg-card">
              <CardContent className="space-y-3 pt-5">
                <div className="flex items-center gap-2">
                  <SlotBadge slot={current.book.slot} />
                  <span className="font-semibold text-foreground">{current.book.title}</span>
                  <EditionPills editions={current.book.editions} />
                </div>
                <p className="text-sm text-muted-foreground">Step {step} of {totalSteps} · pages {from}–{to}</p>
                {leader && <Note>Pre-filled from the shared task bank (written by {leader.b.name}). Review and approve.</Note>}
                {has("daily_task") ? (
                  <>
                    <Input placeholder="Task title" value={shownTitle} readOnly={!!leader} onChange={(e) => setTitle(e.target.value)} />
                    <Textarea placeholder="Core highlights (one per line)" value={shownHl.join("\n")} readOnly={!!leader} onChange={(e) => setHl(e.target.value)} />
                    <Textarea placeholder="Reflection question" value={shownQ} readOnly={!!leader} onChange={(e) => setQ(e.target.value)} />
                    <div className="flex flex-wrap gap-2">
                      <Button disabled={published[key]} onClick={() => setPublished((p) => ({ ...p, [key]: true }))}>
                        {published[key] ? <><CheckCircle2 className="size-4" /> Published</> : leader ? "Approve & publish" : "Publish & save to bank"}
                      </Button>
                      {leader && <Button variant="outline">Edit for this batch</Button>}
                      {leader && <Button variant="ghost">Suggest edit</Button>}
                    </div>
                  </>
                ) : (
                  <Note>Read-only. Daily task is not your duty. Your duties: {assignment.duties.map((d) => DUTY_LABELS[d]).join(", ")}.</Note>
                )}
              </CardContent>
            </Card>
          )}

          {/* Other duties */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {has("reflection") && <DutyCard title="Reflections" value={`${reflected}/${MEMBERS.length} submitted`} action="Review reflections" />}
            {has("attendance") && <DutyCard title="Attendance" value={`${present}/${MEMBERS.length} present`} action="Mark attendance" />}
            {has("inspiration") && <DutyCard title="Inspiration" value="Not posted today" action="Post reminder" />}
          </div>

          {/* Telegram preview */}
          {!locked && (
            <div>
              <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Telegram preview</p>
              <div className="rounded-2xl border border-border bg-surface-2 p-4 text-sm text-foreground">
                <p className="font-semibold">📚 EMFSC Daily Reading — Day {step}</p>
                <p className="mt-2 font-medium">{current.book.title}</p>
                <p>🇬🇧 English: pp {from}–{to}</p>
                {current.book.editions.includes("AM") && <p>🇪🇹 Amharic: ገጽ {from}–{to}</p>}
                {shownTitle && <p className="mt-2">📖 {shownTitle}</p>}
                {shownHl.length > 0 && <ul className="mt-1 list-disc pl-5">{shownHl.map((h) => <li key={h}>{h}</li>)}</ul>}
                {shownQ && <p className="mt-2 italic">💡 {shownQ}</p>}
                <p className="mt-2">⏰ Submit reflection by 9:00 PM EAT</p>
                <p className="mt-3 text-xs text-muted-foreground">#{batch.name.replace(" ", "")} #Pace{group.size} — {admin.name}</p>
              </div>
            </div>
          )}

          {(finishedToday || current.pagesRead >= current.book.pageCount - group.size) && next && (
            <Card className="border-teal/50 bg-accent">
              <CardContent className="space-y-2 pt-5">
                <p className="font-semibold text-accent-foreground">Book almost done</p>
                <p className="text-sm text-accent-foreground">Next: {next.book.title} · starts {fmt(next.startDate)}</p>
                <Button variant="outline" disabled={startedNext} onClick={() => setStartedNext(true)}>
                  {startedNext ? "Next book started" : "Start next book"}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {tab === "roadmap" && (
        <ol className="relative space-y-3 border-l-2 border-border pl-4">
          {rows.map((r) => (
            <li key={r.book.id} className="relative">
              <span className={cn("absolute -left-[23px] top-4 size-3 rounded-full border-2 border-card", r.status === "done" ? "bg-teal" : r.status === "current" ? "bg-primary" : "bg-muted")} />
              <div className="rounded-xl border border-border bg-card p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-sm font-semibold text-foreground"><SlotBadge slot={r.book.slot} />{r.book.title}</span>
                  <StatusChip status={r.status} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{r.pagesRead}/{r.book.pageCount} pages · {fmtShort(r.startDate)} → {fmt(r.finishDate)}</p>
                <div className="mt-2"><MiniProgress value={r.pagesRead} max={r.book.pageCount} /></div>
              </div>
            </li>
          ))}
        </ol>
      )}

      {tab === "members" && (
        <Card className="border-border bg-card">
          <CardContent className="divide-y divide-border pt-2">
            {MEMBERS.map((m) => (
              <div key={m.name} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-medium text-foreground">{m.name}</p>
                  <p className="text-xs text-muted-foreground">{m.streak}-day streak</p>
                </div>
                <div className="flex gap-1">
                  <Pill ok={m.reflected} label="Reflection" />
                  <Pill ok={m.present} label="Present" />
                </div>
              </div>
            ))}
            <p className="pt-3 text-xs text-muted-foreground">Showing 5 of {group.members} members (sample).</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: React.ReactNode; label: string }) {
  return (
    <div className="rounded-lg bg-surface-2 p-2">
      <div className="flex justify-center text-muted-foreground">{icon}</div>
      <p className="font-semibold text-foreground">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

function DutyCard({ title, value, action }: { title: string; value: string; action: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <p className="flex items-center gap-1 text-sm font-semibold text-foreground"><CalendarCheck className="size-4" />{title}</p>
      <p className="text-xs text-muted-foreground">{value}</p>
      <Button size="sm" variant="outline" className="mt-2 w-full">{action}</Button>
    </div>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">{children}</p>;
}

function Pill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[11px]", ok ? "bg-teal/20 text-foreground" : "bg-muted text-muted-foreground")}>
      {ok ? "✓" : "–"} {label}
    </span>
  );
}
