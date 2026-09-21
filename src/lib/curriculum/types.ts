export type Edition = "EN" | "AM";

export type Duty = "daily_task" | "reflection" | "inspiration" | "attendance";

export interface Book {
  id: string;
  slot: number;
  title: string;
  author: string;
  pageCount: number;
  editions: Edition[];
}

export interface PacingOffset {
  id: string;
  label: string;
  /** ISO date, inclusive */
  startDate: string;
  /** whole days skipped */
  days: number;
}

export interface Batch {
  id: string;
  name: string;
  startDate: string;
  /** 0 = Sunday ... 6 = Saturday */
  readingDaysPerWeek: number[];
  offsets: PacingOffset[];
}

export interface PaceGroup {
  id: string;
  batchId: string;
  name: string;
  /** pages per reading day */
  size: number;
  members: number;
}

export interface PaceAdminAssignment {
  groupId: string;
  duties: Duty[];
  /** when set, this admin only handles this one book for the group */
  assignedBookId?: string;
}

export interface PaceAdmin {
  id: string;
  name: string;
  assignments: PaceAdminAssignment[];
}

export interface MasterTask {
  bookId: string;
  /** 1-based day within the book */
  day: number;
  topic: string;
}

export type BookStatus = "done" | "current" | "upNext" | "notStarted";

export interface BookProgress {
  book: Book;
  status: BookStatus;
  pagesRead: number;
  /** pages read before today's session */
  cursor: number;
  startIndex: number;
  endIndex: number;
  startDate: Date;
  finishDate: Date;
  /** 1-based reading day within this book that "today" falls on, or null */
  dayInBook: number | null;
}
