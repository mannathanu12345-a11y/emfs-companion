const steps = [
  "Super admin adds a book to the global catalog; the system assigns the next slot",
  "Amharic and English editions of one title share the same slot",
  "Master tasks are written once per book, per reading day",
  "A batch sets its start date, reading days per week, and offsets",
  "The batch reads the catalog in slot order, starting at slot 1",
  "Members choose a pace group: 5, 10, 20 or 40 pages a day",
  "Each pace group moves through the books in slot order; each pace admin sees only their own groups and books",
];

export function FlowStrip() {
  return (
    <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((step, i) => (
        <li
          key={step}
          className="card-soft rise-in flex gap-3 rounded-xl border border-border bg-card p-4"
          style={{ animationDelay: `${i * 40}ms` }}
        >
          <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-accent font-mono text-xs font-semibold text-accent-foreground">
            {i + 1}
          </span>
          <p className="text-sm leading-snug text-muted-foreground">{step}</p>
        </li>
      ))}
    </ol>
  );
}
