import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FlowStrip } from "@/components/curriculum/FlowStrip";
import { HowItFits } from "@/components/curriculum/HowItFits";
import { SuperAdminView } from "@/components/curriculum/SuperAdminView";
import { BatchAdminView } from "@/components/curriculum/BatchAdminView";
import { RoadmapView } from "@/components/curriculum/RoadmapView";
import { PaceAdminView } from "@/components/curriculum/PaceAdminView";
import { DEFAULT_SIMULATED_TODAY, batches } from "@/lib/curriculum/data";
import { toDate } from "@/lib/curriculum/schedule";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Curriculum & pacing — EMFSC Book Shelf" },
      {
        name: "description",
        content:
          "How the EMFSC reading curriculum is organised: global book catalog, batches, pace groups and pace admins, with a live roadmap.",
      },
      { property: "og:title", content: "Curriculum & pacing — EMFSC Book Shelf" },
      {
        property: "og:description",
        content:
          "Book catalog slots, batch calendars, 5/10/20/40-page groups and per-book pace admin duties, shown end to end.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CurriculumPage,
});

function CurriculumPage() {
  const [batchId, setBatchId] = useState(batches[0]!.id);
  const [todayIso, setTodayIso] = useState(DEFAULT_SIMULATED_TODAY);
  const [tab, setTab] = useState("super");

  const batch = batches.find((b) => b.id === batchId)!;
  const today = toDate(todayIso);

  return (
    <TooltipProvider delayDuration={200}>
      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="max-w-3xl">
          <p className="text-xs font-semibold tracking-[0.2em] text-teal-foreground uppercase">
            EMFSC Book Shelf
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground sm:text-4xl">
            How the curriculum is organised
          </h1>
          <p className="mt-3 text-base text-muted-foreground">
            One global catalog of books in slot order. Every batch reads it from slot 1 on its own
            calendar. Inside a batch, each pace group keeps its own cursor per book, and each pace
            admin publishes only for the groups and books they are assigned to.
          </p>
        </header>

        <section className="mt-8">
          <FlowStrip />
        </section>

        <section className="mt-6">
          <HowItFits />
        </section>

        <Card className="card-soft mt-8 border-border bg-card">
          <CardContent className="flex flex-wrap items-end gap-4 pt-6">
            <div className="grid gap-1.5">
              <Label htmlFor="batch">Batch</Label>
              <Select value={batchId} onValueChange={setBatchId}>
                <SelectTrigger id="batch" className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {batches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="today">Simulated today</Label>
              <Input
                id="today"
                type="date"
                className="w-48"
                value={todayIso}
                onChange={(e) => e.target.value && setTodayIso(e.target.value)}
              />
            </div>
            <p className="pb-2 text-sm text-muted-foreground">
              Showing the program as of {format(today, "EEEE, d MMMM yyyy")}.
            </p>
          </CardContent>
        </Card>

        <Tabs value={tab} onValueChange={setTab} className="mt-6">
          <TabsList className="flex-wrap">
            <TabsTrigger value="super">Super admin</TabsTrigger>
            <TabsTrigger value="batch">Batch admin</TabsTrigger>
            <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
            <TabsTrigger value="pace">Pace admin</TabsTrigger>
          </TabsList>

          <TabsContent value="super" className="mt-6">
            <SuperAdminView />
          </TabsContent>
          <TabsContent value="batch" className="mt-6">
            <BatchAdminView batch={batch} today={today} onOpenRoadmap={() => setTab("roadmap")} />
          </TabsContent>
          <TabsContent value="roadmap" className="mt-6">
            <RoadmapView batch={batch} today={today} />
          </TabsContent>
          <TabsContent value="pace" className="mt-6">
            <PaceAdminView batch={batch} today={today} />
          </TabsContent>
        </Tabs>
      </main>
    </TooltipProvider>
  );
}
