import { addDays, differenceInCalendarDays, format, parseISO, startOfDay } from "date-fns";
import type { Batch, Book, BookProgress, BookStatus, PacingOffset } from "./types";

export function toDate(iso: string): Date {
  return startOfDay(parseISO(iso));
}

export function fmt(date: Date): string {
  return format(date, "d MMM yyyy");
}

export function fmtShort(date: Date): string {
  return format(date, "d MMM");
}

export interface OffsetWindow {
  offset: PacingOffset;
  start: Date;
  end: Date;
}

export function offsetWindows(batch: Batch): OffsetWindow[] {
  return batch.offsets.map((offset) => {
    const start = toDate(offset.startDate);
    return { offset, start, end: addDays(start, offset.days - 1) };
  });
}

function isPaused(date: Date, windows: OffsetWindow[]): boolean {
  return windows.some((w) => date >= w.start && date <= w.end);
}

/** Every reading date of the batch calendar, shared by all of its groups. */
export function readingDays(batch: Batch, count = 420): Date[] {
  const windows = offsetWindows(batch);
  const days: Date[] = [];
  let cursor = toDate(batch.startDate);
  let guard = 0;
  while (days.length < count && guard < count * 6) {
    if (batch.readingDaysPerWeek.includes(cursor.getDay()) && !isPaused(cursor, windows)) {
      days.push(cursor);
    }
    cursor = addDays(cursor, 1);
    guard += 1;
  }
  return days;
}

/** Reading days completed on or before the simulated today. */
export function elapsedReadingDays(days: Date[], today: Date): number {
  let n = 0;
  for (const day of days) {
    if (day <= today) n += 1;
    else break;
  }
  return n;
}

/**
 * One cursor per book, per group. A group reads books strictly in slot order
 * and only moves on when its cursor reaches the book's page count.
 */
export function groupTimeline(
  batch: Batch,
  size: number,
  catalog: Book[],
  today: Date,
): BookProgress[] {
  const days = readingDays(batch);
  const elapsed = elapsedReadingDays(days, today);
  const ordered = [...catalog].sort((a, b) => a.slot - b.slot);

  let startIndex = 0;
  let firstUnstartedSeen = false;

  return ordered.map((book) => {
    const dayCount = Math.ceil(book.pageCount / size);
    const endIndex = startIndex + dayCount - 1;
    const daysDone = Math.min(Math.max(elapsed - startIndex, 0), dayCount);
    const pagesRead = Math.min(daysDone * size, book.pageCount);
    const cursor = Math.min(Math.max(daysDone - 1, 0) * size, book.pageCount);

    let status: BookStatus;
    if (pagesRead >= book.pageCount) {
      status = "done";
    } else if (pagesRead > 0) {
      status = "current";
    } else if (!firstUnstartedSeen) {
      status = "upNext";
      firstUnstartedSeen = true;
    } else {
      status = "notStarted";
    }
    if (status === "current") firstUnstartedSeen = true;

    const result: BookProgress = {
      book,
      status,
      pagesRead,
      cursor: status === "current" ? cursor : pagesRead,
      startIndex,
      endIndex,
      startDate: days[Math.min(startIndex, days.length - 1)]!,
      finishDate: days[Math.min(endIndex, days.length - 1)]!,
      dayInBook: elapsed > startIndex && elapsed <= endIndex + 1 ? elapsed - startIndex : null,
    };
    startIndex = endIndex + 1;
    return result;
  });
}

export function batchDayNumber(batch: Batch, today: Date): number {
  return elapsedReadingDays(readingDays(batch), today);
}

/** Percentage position of a date inside a [from, to] window. */
export function percentBetween(date: Date, from: Date, to: Date): number {
  const span = Math.max(differenceInCalendarDays(to, from), 1);
  const at = differenceInCalendarDays(date, from);
  return Math.min(Math.max((at / span) * 100, 0), 100);
}

export function statusLabel(status: BookStatus): string {
  return status === "done"
    ? "Done"
    : status === "current"
      ? "Current"
      : status === "upNext"
        ? "Up next"
        : "Not started";
}
