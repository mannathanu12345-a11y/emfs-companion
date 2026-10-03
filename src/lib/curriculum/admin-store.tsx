import { createContext, useContext, useState, type ReactNode } from "react";
import { batches as seedBatches, books as seedBooks, paceGroups as seedGroups } from "./data";
import type { Book, PaceGroup } from "./types";

export type Role = "super_admin" | "batch_admin" | "pace_admin";
export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super admin",
  batch_admin: "Batch admin",
  pace_admin: "Pace admin",
};

export type BatchStatus = "upcoming" | "active" | "finished";
export interface AdminBatch {
  id: string;
  name: string;
  startDate: string;
  status: BatchStatus;
  readingDays: number[];
  adminIds: string[];
}
export interface Person {
  id: string;
  name: string;
  phone: string;
}

export const people: Person[] = [
  { id: "u-bilal", name: "Ustadh Bilal", phone: "+251 911 000 101" },
  { id: "u-hanna", name: "Sr. Hanna", phone: "+251 911 000 102" },
  { id: "u-yusuf", name: "Br. Yusuf", phone: "+251 911 000 103" },
  { id: "u-amina", name: "Amina Yusuf", phone: "+251 911 000 104" },
];

interface Store {
  role: Role;
  setRole: (r: Role) => void;
  batches: AdminBatch[];
  saveBatch: (b: AdminBatch) => void;
  deleteBatch: (id: string) => void;
  groups: PaceGroup[];
  saveGroup: (g: PaceGroup) => void;
  deleteGroup: (id: string) => void;
  books: Book[];
  saveBook: (b: Book) => void;
  deleteBook: (id: string) => void;
  moveBook: (id: string, dir: -1 | 1) => void;
}

const Ctx = createContext<Store | null>(null);

const upsert = <T extends { id: string }>(list: T[], item: T) =>
  list.some((x) => x.id === item.id) ? list.map((x) => (x.id === item.id ? item : x)) : [...list, item];

export function AdminStoreProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("super_admin");
  const [batches, setBatches] = useState<AdminBatch[]>(() => [
    ...seedBatches.map((b, i) => ({
      id: b.id,
      name: b.name,
      startDate: b.startDate,
      status: "active" as const,
      readingDays: b.readingDaysPerWeek,
      adminIds: i === 0 ? ["u-bilal"] : ["u-hanna"],
    })),
    { id: "batch-6", name: "Batch 6", startDate: "2026-11-01", status: "upcoming", readingDays: [1, 2, 3, 4, 5], adminIds: [] },
  ]);
  const [groups, setGroups] = useState<PaceGroup[]>(seedGroups);
  const [books, setBooks] = useState<Book[]>(seedBooks);

  const reslot = (l: Book[]) => l.map((b, i) => ({ ...b, slot: i + 1 }));

  return (
    <Ctx.Provider
      value={{
        role,
        setRole,
        batches,
        saveBatch: (b) => setBatches((s) => upsert(s, b)),
        deleteBatch: (id) => {
          setBatches((s) => s.filter((b) => b.id !== id));
          setGroups((s) => s.filter((g) => g.batchId !== id));
        },
        groups,
        saveGroup: (g) => setGroups((s) => upsert(s, g)),
        deleteGroup: (id) => setGroups((s) => s.filter((g) => g.id !== id)),
        books,
        saveBook: (b) => setBooks((s) => reslot(upsert(s, b).sort((a, c) => a.slot - c.slot))),
        deleteBook: (id) => setBooks((s) => reslot(s.filter((b) => b.id !== id))),
        moveBook: (id, dir) =>
          setBooks((s) => {
            const i = s.findIndex((b) => b.id === id);
            const j = i + dir;
            if (j < 0 || j >= s.length) return s;
            const n = [...s];
            [n[i], n[j]] = [n[j]!, n[i]!];
            return reslot(n);
          }),
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAdminStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useAdminStore outside provider");
  return s;
}
