type BuildQuestionSetParams = {
  chapterCodes: string[];
  maxPerChapter: number;
  total: number;
};

export function buildQuestionSet(params: BuildQuestionSetParams) {
  const { chapterCodes, maxPerChapter, total } = params;
  return {
    mode: "balanced",
    chapterCodes,
    maxPerChapter,
    total,
  };
}
import type { PoolClient } from "pg";

export async function getSubjectQuestionCount(
  client: PoolClient,
  license: string,
  subject: string,
): Promise<number> {
  const result = await client.query<{ total: string }>(
    `
      SELECT COUNT(*)::text AS total
      FROM public.diagnostic_questions
      WHERE source_type = 'ai_original'
        AND license = $1
        AND subject = $2
    `,
    [license, subject],
  );
  return Number(result.rows[0]?.total ?? 0);
}

export async function getChapterQuestionCount(
  client: PoolClient,
  license: string,
  subject: string,
  chapterCode: string,
): Promise<number> {
  const result = await client.query<{ total: string }>(
    `
      SELECT COUNT(*)::text AS total
      FROM public.diagnostic_questions
      WHERE source_type = 'ai_original'
        AND license = $1
        AND subject = $2
        AND chapter_code = $3
    `,
    [license, subject, chapterCode],
  );
  return Number(result.rows[0]?.total ?? 0);
}

