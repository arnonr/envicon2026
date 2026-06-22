import type { SubmissionStatus } from "../db/schema";

export const ROUND_OF: Record<SubmissionStatus, 0 | 1 | 2> = {
  draft: 0,
  submitted_round1: 1,
  under_review_round1: 1,
  passed_round1: 1,
  passed_round1_with_revisions: 1,
  rejected_round1: 1,
  submitted_round2: 2,
  under_review_round2: 2,
  passed_round2: 2,
  passed_round2_with_revisions: 2,
  rejected_round2: 2,
};

export const isDraft = (s: SubmissionStatus) => s === "draft";

export const canEdit = (s: SubmissionStatus) =>
  s === "draft" || s === "passed_round1_with_revisions" || s === "passed_round2_with_revisions";

export const canRevise = (s: SubmissionStatus) =>
  s === "passed_round1_with_revisions" || s === "passed_round2_with_revisions";

export const canCameraReady = (s: SubmissionStatus) =>
  s === "passed_round1" || s === "passed_round2";

export const canReplaceFile = (s: SubmissionStatus) =>
  s === "submitted_round1" || s === "submitted_round2";

export const isUnderReview = (s: SubmissionStatus) =>
  s === "under_review_round1" || s === "under_review_round2";

export const isSubmitted = (s: SubmissionStatus) =>
  s === "submitted_round1" || s === "submitted_round2";

export const isTerminal = (s: SubmissionStatus) =>
  /^rejected_round[12]$|^passed_round[12](_with_revisions)?$/.test(s);

export const TERMINAL_STATUSES: SubmissionStatus[] = [
  "passed_round1",
  "passed_round1_with_revisions",
  "rejected_round1",
  "passed_round2",
  "passed_round2_with_revisions",
  "rejected_round2",
];

export const RE_REVIEW_STATUSES: SubmissionStatus[] = [
  "passed_round1_with_revisions",
  "passed_round2_with_revisions",
];

export const ALL_NON_DRAFT: SubmissionStatus[] = [
  "submitted_round1",
  "under_review_round1",
  "passed_round1",
  "passed_round1_with_revisions",
  "rejected_round1",
  "submitted_round2",
  "under_review_round2",
  "passed_round2",
  "passed_round2_with_revisions",
  "rejected_round2",
];

export const statusAfterDecision = (
  roundNumber: number,
  decision: "accept" | "reject" | "revise",
): SubmissionStatus => {
  if (decision === "accept") return `passed_round${roundNumber}` as SubmissionStatus;
  if (decision === "reject") return `rejected_round${roundNumber}` as SubmissionStatus;
  return `passed_round${roundNumber}_with_revisions` as SubmissionStatus;
};

export const statusAfterSendReview = (roundNumber: number): SubmissionStatus =>
  `under_review_round${roundNumber}` as SubmissionStatus;

export const statusAfterReviseUpload = (currentStatus: SubmissionStatus): SubmissionStatus | null => {
  if (currentStatus === "passed_round1_with_revisions") return "submitted_round2";
  if (currentStatus === "passed_round2_with_revisions") return "submitted_round2";
  return null;
};
