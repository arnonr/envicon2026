import { and, desc, eq, inArray, or, sql, type SQL } from "drizzle-orm";
import { db } from "../db";
import { reviewRounds, reviews, STATUS_LABEL, submissions, users } from "../db/schema";

export interface AdminSubmissionFilterQuery {
  search?: string;
  status?: string;
  paymentStatus?: string;
  track?: string;
  presentationFormat?: string;
  reviewerId?: string;
  submitterType?: string;
  educationLevel?: string;
  wantsFullPaper?: string;
  fileStatus?: string;
}

export interface LatestRoundReviewSummary {
  assigned: number;
  completed: number;
  reviewerNames: string[];
}

const VALID_PAYMENT_STATUSES = new Set(["unpaid", "pending_verification", "verified", "rejected"]);
const VALID_PRESENTATION_FORMATS = new Set(["oral", "poster"]);
const VALID_SUBMITTER_TYPES = new Set(["student", "general"]);
const VALID_EDUCATION_LEVELS = new Set(["bachelor", "master", "doctorate"]);
const VALID_WANTS_FULL_PAPER = new Set(["0", "1"]);
const VALID_FILE_STATUSES = new Set(["has_abstract", "has_full_paper", "missing_full_paper", "no_files"]);

export function escapeLikePattern(raw: string): string {
  return raw.replace(/[\\%_]/g, "\\$&");
}

function buildHasAbstractSql(): SQL {
  return sql`(${submissions.abstractFileUrl} IS NOT NULL OR ${submissions.abstractWordFileUrl} IS NOT NULL OR (${submissions.round1FileUrl} IS NOT NULL AND (${submissions.round1FileType} IS NULL OR ${submissions.round1FileType} != 'full_paper')))`;
}

function buildHasFullPaperSql(): SQL {
  return sql`(${submissions.fullPaperFileUrl} IS NOT NULL OR ${submissions.fullPaperWordFileUrl} IS NOT NULL OR (${submissions.round1FileUrl} IS NOT NULL AND ${submissions.round1FileType} IS NOT NULL AND ${submissions.round1FileType} = 'full_paper'))`;
}

export function buildAdminSubmissionWhere(
  query: AdminSubmissionFilterQuery,
): { ok: true; where: SQL | undefined } | { ok: false; error: string } {
  const conditions: SQL[] = [];

  const trimmedSearch = query.search?.trim();
  if (trimmedSearch) {
    const pattern = `%${escapeLikePattern(trimmedSearch.toLowerCase())}%`;
    const searchOr = or(
      sql`LOWER(${submissions.title}) LIKE ${pattern} ESCAPE '\\\\'`,
      sql`LOWER(${submissions.titleEn}) LIKE ${pattern} ESCAPE '\\\\'`,
      sql`LOWER(${submissions.creators}) LIKE ${pattern} ESCAPE '\\\\'`,
      sql`LOWER(REPLACE(${submissions.creators}, '","lastName":"', ' ')) LIKE ${pattern} ESCAPE '\\\\'`,
      sql`LOWER(${users.name}) LIKE ${pattern} ESCAPE '\\\\'`,
      sql`LOWER(${users.email}) LIKE ${pattern} ESCAPE '\\\\'`,
      sql`LOWER(${users.affiliation}) LIKE ${pattern} ESCAPE '\\\\'`,
    );
    if (searchOr) conditions.push(searchOr);
  }

  if (query.status) {
    if (!(query.status in STATUS_LABEL)) {
      return { ok: false, error: `Invalid status: ${query.status}` };
    }
    conditions.push(eq(submissions.status, query.status as (typeof submissions.status.enumValues)[number]));
  }

  if (query.paymentStatus) {
    if (!VALID_PAYMENT_STATUSES.has(query.paymentStatus)) {
      return { ok: false, error: `Invalid paymentStatus: ${query.paymentStatus}` };
    }
    conditions.push(
      eq(submissions.paymentStatus, query.paymentStatus as (typeof submissions.paymentStatus.enumValues)[number]),
    );
  }

  if (query.track) {
    const trackNum = Number(query.track);
    if (!Number.isInteger(trackNum) || trackNum < 1 || trackNum > 7) {
      return { ok: false, error: `Invalid track: ${query.track}` };
    }
    conditions.push(eq(submissions.track, trackNum));
  }

  if (query.presentationFormat) {
    if (!VALID_PRESENTATION_FORMATS.has(query.presentationFormat)) {
      return { ok: false, error: `Invalid presentationFormat: ${query.presentationFormat}` };
    }
    conditions.push(
      eq(
        submissions.presentationFormat,
        query.presentationFormat as (typeof submissions.presentationFormat.enumValues)[number],
      ),
    );
  }

  if (query.submitterType) {
    if (!VALID_SUBMITTER_TYPES.has(query.submitterType)) {
      return { ok: false, error: `Invalid submitterType: ${query.submitterType}` };
    }
    conditions.push(
      eq(submissions.submitterType, query.submitterType as (typeof submissions.submitterType.enumValues)[number]),
    );
  }

  if (query.educationLevel) {
    if (!VALID_EDUCATION_LEVELS.has(query.educationLevel)) {
      return { ok: false, error: `Invalid educationLevel: ${query.educationLevel}` };
    }
    conditions.push(
      eq(submissions.educationLevel, query.educationLevel as (typeof submissions.educationLevel.enumValues)[number]),
    );
  }

  if (query.wantsFullPaper !== undefined && query.wantsFullPaper !== "") {
    if (!VALID_WANTS_FULL_PAPER.has(query.wantsFullPaper)) {
      return { ok: false, error: `Invalid wantsFullPaper: ${query.wantsFullPaper}` };
    }
    conditions.push(eq(submissions.wantsFullPaper, Number(query.wantsFullPaper)));
  }

  const trimmedReviewerId = query.reviewerId?.trim();
  if (trimmedReviewerId) {
    if (trimmedReviewerId === "unassigned") {
      conditions.push(
        sql`NOT EXISTS (
          SELECT 1
          FROM ${reviews} r
          INNER JOIN ${reviewRounds} rr ON rr.id = r.round_id
          WHERE rr.submission_id = ${submissions.id}
            AND rr.round_number = (
              SELECT MAX(rr2.round_number)
              FROM ${reviewRounds} rr2
              WHERE rr2.submission_id = ${submissions.id}
            )
        )`,
      );
    } else {
      conditions.push(
        sql`EXISTS (
          SELECT 1
          FROM ${reviews} r
          WHERE r.submission_id = ${submissions.id}
            AND r.reviewer_id = ${trimmedReviewerId}
        )`,
      );
    }
  }

  if (query.fileStatus) {
    if (!VALID_FILE_STATUSES.has(query.fileStatus)) {
      return { ok: false, error: `Invalid fileStatus: ${query.fileStatus}` };
    }
    const hasAbstract = buildHasAbstractSql();
    const hasFullPaper = buildHasFullPaperSql();
    if (query.fileStatus === "has_abstract") {
      conditions.push(hasAbstract);
    } else if (query.fileStatus === "has_full_paper") {
      conditions.push(hasFullPaper);
    } else if (query.fileStatus === "missing_full_paper") {
      conditions.push(sql`(${submissions.wantsFullPaper} = 1 AND NOT ${hasFullPaper})`);
    } else if (query.fileStatus === "no_files") {
      conditions.push(sql`(NOT ${hasAbstract} AND NOT ${hasFullPaper})`);
    }
  }

  return {
    ok: true,
    where: conditions.length ? and(...conditions) : undefined,
  };
}

export async function loadLatestRoundReviewSummaries(
  submissionIds: string[],
): Promise<Map<string, LatestRoundReviewSummary>> {
  const summaryBySubmission = new Map<string, LatestRoundReviewSummary>();
  if (!submissionIds.length) return summaryBySubmission;

  const roundRows = await db
    .select({
      id: reviewRounds.id,
      submissionId: reviewRounds.submissionId,
    })
    .from(reviewRounds)
    .where(inArray(reviewRounds.submissionId, submissionIds))
    .orderBy(desc(reviewRounds.roundNumber));

  const latestRoundBySubmission = new Map<string, string>();
  const submissionByRoundId = new Map<string, string>();
  for (const round of roundRows) {
    if (!latestRoundBySubmission.has(round.submissionId)) {
      latestRoundBySubmission.set(round.submissionId, round.id);
      submissionByRoundId.set(round.id, round.submissionId);
    }
  }

  const latestRoundIds = [...latestRoundBySubmission.values()];
  if (!latestRoundIds.length) return summaryBySubmission;

  const reviewRows = await db
    .select({
      roundId: reviews.roundId,
      status: reviews.status,
      reviewerName: users.name,
    })
    .from(reviews)
    .innerJoin(users, eq(reviews.reviewerId, users.id))
    .where(inArray(reviews.roundId, latestRoundIds))
    .orderBy(reviews.assignedAt);

  for (const row of reviewRows) {
    const submissionId = submissionByRoundId.get(row.roundId);
    if (!submissionId) continue;
    const summary = summaryBySubmission.get(submissionId) ?? {
      assigned: 0,
      completed: 0,
      reviewerNames: [],
    };
    summary.assigned += 1;
    if (row.status === "completed") summary.completed += 1;
    if (row.reviewerName && !summary.reviewerNames.includes(row.reviewerName)) {
      summary.reviewerNames.push(row.reviewerName);
    }
    summaryBySubmission.set(submissionId, summary);
  }

  return summaryBySubmission;
}
