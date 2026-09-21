import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const levels = [
  {
    title: "Global catalog",
    detail: "Slots 1..N, master tasks per book. Super admin only.",
  },
  {
    title: "Batch",
    detail: "Start date, reading days per week, offsets. Reads slots in order from slot 1.",
  },
  {
    title: "Pace group",
    detail: "5 / 10 / 20 / 40 pages a day. One cursor per book.",
  },
  {
    title: "Pace admin assignment",
    detail: "Duty plus an optional assigned book. Decides who publishes for which group and book.",
  },
];

const rules = [
  "The batch calendar is shared by all its groups: same reading days, same offsets.",
  "A group finishes a book when its cursor reaches the page count, then moves to the next slot's book. A 40-page group finishes sooner than a 5-page group, so groups in one batch can be on different books.",
  "Within a group, English and Amharic readers stay on the same day and topic; only page numbers differ by edition.",
  "A pace admin who is assigned to a book only sees and publishes for that book.",
];

export function HowItFits() {
  return (
    <Card className="card-soft border-border bg-card">
      <CardHeader>
        <CardTitle className="text-lg">How it fits together</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <ol className="space-y-2">
          {levels.map((level, i) => (
            <li key={level.title} style={{ paddingInlineStart: `${i * 14}px` }}>
              <div className="rounded-lg border border-border bg-surface-2 p-3">
                <p className="text-sm font-semibold text-foreground">
                  {i > 0 && <span className="mr-1 text-muted-foreground">↳</span>}
                  {level.title}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">{level.detail}</p>
              </div>
            </li>
          ))}
        </ol>
        <ul className="space-y-2 border-t border-border pt-4">
          {rules.map((rule) => (
            <li key={rule} className="flex gap-2 text-sm text-muted-foreground">
              <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-teal" />
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
