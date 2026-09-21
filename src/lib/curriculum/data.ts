import type { Batch, Book, Duty, MasterTask, PaceAdmin, PaceGroup } from "./types";

export const DUTY_LABELS: Record<Duty, string> = {
  daily_task: "Daily task",
  reflection: "Reflection",
  inspiration: "Inspiration",
  attendance: "Attendance",
};

export const books: Book[] = [
  {
    id: "book-sealed-nectar",
    slot: 1,
    title: "The Sealed Nectar",
    author: "Safiur Rahman Mubarakpuri",
    pageCount: 320,
    editions: ["EN", "AM"],
  },
  {
    id: "book-purification",
    slot: 2,
    title: "Purification of the Heart",
    author: "Hamza Yusuf",
    pageCount: 180,
    editions: ["EN", "AM"],
  },
  {
    id: "book-quran-companion",
    slot: 3,
    title: "The Qur'an Companion",
    author: "Sarah Al-Amin",
    pageCount: 240,
    editions: ["EN"],
  },
];

export const batches: Batch[] = [
  {
    id: "batch-4",
    name: "Batch 4",
    startDate: "2026-06-01",
    readingDaysPerWeek: [1, 2, 3, 4, 5],
    offsets: [
      { id: "off-eid", label: "Eid break +3d", startDate: "2026-07-13", days: 3 },
      { id: "off-exams", label: "Exam week +5d", startDate: "2026-10-05", days: 5 },
    ],
  },
  {
    id: "batch-5",
    name: "Batch 5",
    startDate: "2026-08-17",
    readingDaysPerWeek: [0, 2, 4, 6],
    offsets: [{ id: "off-travel", label: "Travel pause +2d", startDate: "2026-09-28", days: 2 }],
  },
];

export const paceGroups: PaceGroup[] = [
  { id: "g-b4-5", batchId: "batch-4", name: "5-page group", size: 5, members: 42 },
  { id: "g-b4-10", batchId: "batch-4", name: "10-page group", size: 10, members: 58 },
  { id: "g-b4-20", batchId: "batch-4", name: "20-page group", size: 20, members: 31 },
  { id: "g-b4-40", batchId: "batch-4", name: "40-page group", size: 40, members: 17 },
  { id: "g-b5-10", batchId: "batch-5", name: "10-page group", size: 10, members: 26 },
  { id: "g-b5-20", batchId: "batch-5", name: "20-page group", size: 20, members: 14 },
];

export const paceAdmins: PaceAdmin[] = [
  {
    id: "pa-amina",
    name: "Amina Yusuf",
    assignments: [
      { groupId: "g-b4-5", duties: ["daily_task", "reflection", "inspiration", "attendance"] },
      { groupId: "g-b4-10", duties: ["daily_task", "reflection", "inspiration", "attendance"] },
      { groupId: "g-b4-20", duties: ["daily_task", "reflection", "inspiration", "attendance"] },
      { groupId: "g-b4-40", duties: ["daily_task", "reflection", "inspiration", "attendance"] },
    ],
  },
  {
    id: "pa-hafsa",
    name: "Hafsa Nuru",
    assignments: [
      {
        groupId: "g-b4-10",
        duties: ["daily_task", "attendance"],
        assignedBookId: "book-purification",
      },
    ],
  },
  {
    id: "pa-zeynab",
    name: "Zeynab Ali",
    assignments: [{ groupId: "g-b4-20", duties: ["reflection"] }],
  },
];

const topicsBySlot: Record<number, string[]> = {
  1: [
    "Arabia before the message",
    "The tribe of Quraysh",
    "Birth and childhood",
    "The years of trade",
    "The cave of Hira",
    "The first revelation",
    "The secret call",
    "Open preaching",
    "The boycott",
    "The year of sorrow",
  ],
  2: [
    "What the heart holds",
    "Miserliness",
    "Wantonness",
    "Hatred and its cure",
    "Iniquity",
    "Envy",
    "Relying on other than God",
    "Displeasure with destiny",
    "Ostentation",
    "Vanity",
  ],
  3: [
    "How the Qur'an was revealed",
    "Makkan and Madinan chapters",
    "Themes of the opening",
    "Stories as instruction",
    "Parables",
    "Law and mercy",
    "Reciting with attention",
    "Memory and review",
    "Living the verses",
    "Closing reflections",
  ],
};

export function masterTask(bookId: string, day: number): MasterTask {
  const book = books.find((b) => b.id === bookId)!;
  const list = topicsBySlot[book.slot] ?? topicsBySlot[1];
  return { bookId, day, topic: list[(day - 1) % list.length] };
}

export const DEFAULT_SIMULATED_TODAY = "2026-09-21";
