import { useState } from "react";
import { CalendarOff, Plus, Trash2, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MiniProgress } from "./shared";
import { batches, books, paceAdmins, paceGroups, DUTY_LABELS } from "@/lib/curriculum/data";
import { batchDayNumber, fmt, groupTimeline, toDate } from "@/lib/curriculum/schedule";
import type { Batch, Duty } from "@/lib/curriculum/types";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DUTIES = Object.keys(DUTY_LABELS) as Duty[];

type Brk = { id: string; label: string; start: string; days: number; scope: string };
type Adm = { id: string; name: string; groupId: string; duties: Duty[]; bookId?: string | undefined };

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4 card-soft">
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function BatchAdminView({ batch: initial, today }: { batch: Batch; today: Date; onOpenRoadmap?: () => void }) {
  const [batchId, setBatchId] = useState(initial.id);
  const batch = batches.find((b) => b.id === batchId)!;
  const groups = paceGroups.filter((g) => g.batchId === batchId);

  const [days, setDays] = useState<Record<string, number[]>>(
    Object.fromEntries(batches.map((b) => [b.id, b.readingDaysPerWeek])),
  );
  const [breaks, setBreaks] = useState<Brk[]>(
    batches.flatMap((b) => b.offsets.map((o) => ({ id: o.id, label: o.label, start: o.startDate, days: o.days, scope: `all:${b.id}` }))),
  );
  const [admins, setAdmins] = useState<Adm[]>(
    paceAdmins.flatMap((a) => a.assignments.map((s) => ({ id: `${a.id}-${s.groupId}`, name: a.name, groupId: s.groupId, duties: s.duties, bookId: s.assignedBookId }))),
  );
  const [form, setForm] = useState({ label: "", start: "", days: 3, scope: "all" });
  const [adding, setAdding] = useState<string | null>(null);
  const [newName, setNewName] = useState("");

  const active = days[batchId] ?? [];
  const batchBreaks = breaks.filter((b) => b.scope === `all:${batchId}` || groups.some((g) => g.id === b.scope));
  const liveBatch: Batch = { ...batch, readingDaysPerWeek: active.length ? active : [1] };

  const toggleDay = (d: number) =>
    setDays((s) => ({ ...s, [batchId]: active.includes(d) ? active.filter((x) => x !== d) : [...active, d].sort() }));

  const addBreak = () => {
    if (!form.label || !form.start) return;
    setBreaks((s) => [...s, { id: crypto.randomUUID(), label: form.label, start: form.start, days: form.days, scope: form.scope === "all" ? `all:${batchId}` : form.scope }]);
    setForm({ label: "", start: "", days: 3, scope: "all" });
  };

  const patchAdmin = (id: string, p: Partial<Adm>) => setAdmins((s) => s.map((a) => (a.id === id ? { ...a, ...p } : a)));

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {/* Batch switcher */}
      <div className="rounded-2xl border border-border bg-card p-4 card-soft">
        <label className="text-xs font-medium tracking-wide text-muted-foreground uppercase" htmlFor="bsel">You manage</label>
        <select id="bsel" value={batchId} onChange={(e) => setBatchId(e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-input bg-background px-3 text-base font-semibold text-foreground">
          {batches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          {[["Day", batchDayNumber(liveBatch, today)], ["Groups", groups.length], ["Members", groups.reduce((s, g) => s + g.members, 0)]].map(([k, v]) => (
            <div key={k} className="rounded-xl bg-surface-2 py-2">
              <p className="text-lg font-semibold text-foreground">{v}</p>
              <p className="text-[11px] text-muted-foreground">{k}</p>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Started {fmt(toDate(batch.startDate))}</p>
      </div>

      {/* Pace progress */}
      <Section title="Pace group progress" hint="Where each group is right now.">
        <div className="space-y-3">
          {groups.map((g) => {
            const t = groupTimeline(liveBatch, g.size, books, today);
            const cur = t.find((x) => x.status === "current") ?? t.find((x) => x.status === "upNext") ?? t[t.length - 1]!;
            const done = t.filter((x) => x.status === "done").length;
            return (
              <div key={g.id} className="rounded-xl bg-surface-2 p-3">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold text-foreground">{g.size} pages/day</span>
                  <span className="text-xs text-muted-foreground">{done}/{t.length} books done</span>
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{cur.book.title} · p. {cur.pagesRead}/{cur.book.pageCount}</p>
                <div className="mt-2"><MiniProgress value={cur.pagesRead} max={cur.book.pageCount} /></div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Reading days */}
      <Section title="Reading days" hint="Tap to turn a day on or off for the whole batch.">
        <div className="grid grid-cols-7 gap-1.5">
          {DAYS.map((d, i) => {
            const on = active.includes(i);
            return (
              <button key={d} onClick={() => toggleDay(i)} aria-pressed={on}
                className={`h-11 rounded-xl text-xs font-semibold transition-colors ${on ? "bg-primary text-primary-foreground" : "bg-surface-2 text-muted-foreground"}`}>
                {d}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{active.length} reading days a week</p>
      </Section>

      {/* Breaks */}
      <Section title="Breaks" hint="Pause the whole batch, or just one pace group. Only you set breaks; pace admins can ask you.">
        <ul className="space-y-2">
          {batchBreaks.length === 0 && <li className="text-sm text-muted-foreground">No breaks yet.</li>}
          {batchBreaks.map((b) => {
            const g = groups.find((x) => x.id === b.scope);
            return (
              <li key={b.id} className="flex items-center gap-3 rounded-xl bg-surface-2 p-3">
                <CalendarOff className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{b.label}</p>
                  <p className="text-xs text-muted-foreground">{fmt(toDate(b.start))} · {b.days} days · {g ? g.name : "Whole batch"}</p>
                </div>
                <button aria-label="Remove break" onClick={() => setBreaks((s) => s.filter((x) => x.id !== b.id))} className="p-2 text-muted-foreground hover:text-destructive">
                  <Trash2 className="size-4" />
                </button>
              </li>
            );
          })}
        </ul>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Input className="col-span-2 h-11" placeholder="Break name, e.g. Eid" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
          <Input className="h-11" type="date" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} />
          <Input className="h-11" type="number" min={1} value={form.days} onChange={(e) => setForm({ ...form, days: Number(e.target.value) || 1 })} aria-label="Days" />
          <select value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value })} className="col-span-2 h-11 rounded-md border border-input bg-background px-3 text-sm">
            <option value="all">Whole batch</option>
            {groups.map((g) => <option key={g.id} value={g.id}>Only {g.name}</option>)}
          </select>
          <Button className="col-span-2 h-11" onClick={addBreak}><Plus className="size-4" /> Add break</Button>
        </div>
      </Section>

      {/* Pace admins */}
      <Section title="Pace admins" hint="Who runs each group, and what they can post.">
        <div className="space-y-3">
          {groups.map((g) => {
            const list = admins.filter((a) => a.groupId === g.id);
            return (
              <div key={g.id} className="rounded-xl border border-border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">{g.name}</span>
                  <span className="text-xs text-muted-foreground">{g.members} members</span>
                </div>
                {!list.some((a) => a.duties.includes("daily_task")) && (
                  <p className="mt-2 rounded-lg bg-gold/15 px-2 py-1 text-xs text-foreground">No one posts the daily task yet</p>
                )}
                <div className="mt-2 space-y-2">
                  {list.map((a) => (
                    <div key={a.id} className="rounded-lg bg-surface-2 p-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">{a.name}</span>
                        <button aria-label="Remove admin" onClick={() => setAdmins((s) => s.filter((x) => x.id !== a.id))} className="p-1 text-muted-foreground hover:text-destructive"><X className="size-4" /></button>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {DUTIES.map((d) => {
                          const on = a.duties.includes(d);
                          return (
                            <button key={d} aria-pressed={on} onClick={() => patchAdmin(a.id, { duties: on ? a.duties.filter((x) => x !== d) : [...a.duties, d] })}
                              className={`rounded-full px-3 py-1.5 text-xs font-medium ${on ? "bg-primary text-primary-foreground" : "border border-border bg-background text-muted-foreground"}`}>
                              {DUTY_LABELS[d]}
                            </button>
                          );
                        })}
                      </div>
                      <select value={a.bookId ?? ""} onChange={(e) => patchAdmin(a.id, { bookId: e.target.value || undefined })} className="mt-2 h-10 w-full rounded-md border border-input bg-background px-2 text-sm">
                        <option value="">All books</option>
                        {books.map((b) => <option key={b.id} value={b.id}>Only: {b.title}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
                {adding === g.id ? (
                  <div className="mt-2 flex gap-2">
                    <Input autoFocus className="h-10" placeholder="Name or phone" value={newName} onChange={(e) => setNewName(e.target.value)} />
                    <Button className="h-10" onClick={() => { if (newName) setAdmins((s) => [...s, { id: crypto.randomUUID(), name: newName, groupId: g.id, duties: ["daily_task"] }]); setNewName(""); setAdding(null); }}>Add</Button>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" className="mt-2 w-full" onClick={() => setAdding(g.id)}><UserPlus className="size-4" /> Add pace admin</Button>
                )}
              </div>
            );
          })}
        </div>
      </Section>
    </div>
  );
}
