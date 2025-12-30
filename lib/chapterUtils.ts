import { getChapterDisplayName } from "@/lib/chapterNames";

export function extractChapterId(code?: string | null) {
  if (!code) return null;
  const normalized = code.trim();
  const match = normalized.match(/C?(\d+)/i);
  if (match?.[1]) {
    const parsed = Number.parseInt(match[1], 10);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  const firstSegment = normalized.split(".")[0];
  const parsedSegment = Number.parseInt(firstSegment, 10);
  return Number.isNaN(parsedSegment) ? null : parsedSegment;
}

export function resolveChapterName(
  chapterId?: number | null,
  fallbackLabel?: string | null,
) {
  return getChapterDisplayName(chapterId ?? undefined, fallbackLabel ?? null);
}

