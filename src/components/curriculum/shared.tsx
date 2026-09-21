import { cn } from "@/lib/utils";
import type { BookStatus, Duty, Edition } from "@/lib/curriculum/types";
import { DUTY_LABELS } from "@/lib/curriculum/data";

export function SlotBadge({ slot }: { slot: number }) {
  return (
    <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-primary font-mono text-xs font-semibold text-primary-foreground">
      {slot}
    </span>
  );
}

export function EditionPills({ editions }: { editions: Edition[] }) {
  return (
    <span className="inline-flex gap-1">
      {editions.map((e) => (
        <span
          key={e}
          className="rounded-full border border-teal/50 bg-accent px-2 py-0.5 text-[10px] font-semibold tracking-wide text-accent-foreground"
        >
          {e}
        </span>
      ))}
    </span>
  );
}

const statusStyles: Record<BookStatus, string> = {
  done: "bg-teal/20 text-teal-foreground border-teal/40",
  current: "bg-primary text-primary-foreground border-primary",
  upNext: "bg-transparent text-foreground border-border",
  notStarted: "bg-muted text-muted-foreground border-transparent",
};

export function StatusChip({
  status,
  label,
  className,
}: {
  status: BookStatus;
  label?: string;
  className?: string;
}) {
  const text =
    label ??
    (status === "done"
      ? "Done"
      : status === "current"
        ? "You are here"
        : status === "upNext"
          ? "Up next"
          : "Locked");
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        statusStyles[status],
        className,
      )}
    >
      {text}
    </span>
  );
}

export function DutyChips({ duties }: { duties: Duty[] }) {
  return (
    <span className="inline-flex flex-wrap gap-1">
      {duties.map((d) => (
        <span
          key={d}
          className="rounded-full bg-surface-container px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
        >
          {DUTY_LABELS[d]}
        </span>
      ))}
    </span>
  );
}

export function MiniProgress({ value, max }: { value: number; max: number }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div
      className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <div
        className={cn("h-full rounded-full", pct >= 100 ? "bg-teal" : "bg-primary")}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
