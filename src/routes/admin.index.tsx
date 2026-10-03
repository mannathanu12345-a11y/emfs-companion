import { createFileRoute } from "@tanstack/react-router";
import { SuperAdminView } from "@/components/curriculum/SuperAdminView";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Overview — Super admin — EMFSC" },
      { name: "description", content: "Curriculum health, review requests and batch progress at a glance." },
      { property: "og:title", content: "Overview — Super admin — EMFSC" },
      { property: "og:description", content: "Curriculum health, review requests and batch progress at a glance." },
    ],
  }),
  component: SuperAdminView,
});
