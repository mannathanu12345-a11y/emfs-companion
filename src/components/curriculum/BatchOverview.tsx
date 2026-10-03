import { MiniProgress } from "./shared";
import type { AdminBatch, Person } from "@/lib/curriculum/admin-store";
import type { PaceGroup } from "@/lib/curriculum/types";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Read-only batch summary. Reusable by super admin detail page and batch admin dashboard. */
export function BatchOverview({ batch, groups, admins }: { batch: AdminBatch; groups: PaceGroup[]; admins: Person[] }) {
  const members = groups.reduce((s, g) => s + g.members, 0);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2 text-center">
        {[["Status", batch.status], ["Groups", groups.length], ["Members", members]].map(([k, v]) => (
          <div key={k} className="rounded-xl bg-card py-3 card-soft">
            <p className="text-lg font-semibold capitalize text-foreground">{v}</p>
            <p className="text-[11px] text-muted-foreground">{k}</p>
          </div>
        ))}
      </div>
      <section className="rounded-2xl border border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground">Schedule</h3>
        <p className="mt-1 text-xs text-muted-foreground">Starts {batch.startDate}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {DAYS.map((d, i) => (
            <span key={d} className={`rounded-full px-2.5 py-1 text-xs ${batch.readingDays.includes(i) ? "bg-primary text-primary-foreground" : "bg-surface-2 text-muted-foreground"}`}>{d}</span>
          ))}
        </div>
      </section>
      <section className="rounded-2xl border border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground">Batch admins</h3>
        {admins.length === 0 ? (
          <p className="mt-2 rounded-lg bg-gold/15 px-2 py-1 text-xs text-foreground">No batch admin assigned yet</p>
        ) : (
          <ul className="mt-2 space-y-1">
            {admins.map((a) => <li key={a.id} className="text-sm text-foreground">{a.name} <span className="text-xs text-muted-foreground">· {a.phone}</span></li>)}
          </ul>
        )}
      </section>
      <section className="rounded-2xl border border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground">Pace groups</h3>
        <div className="mt-2 space-y-2">
          {groups.length === 0 && <p className="text-sm text-muted-foreground">No pace groups yet.</p>}
          {groups.map((g, i) => (
            <div key={g.id} className="rounded-xl bg-surface-2 p-3">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-foreground">{g.name}</span>
                <span className="text-xs text-muted-foreground">{g.members} members</span>
              </div>
              <div className="mt-2"><MiniProgress value={(i + 1) * 15} max={100} /></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
