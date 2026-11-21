import type { ReviewType, SubmissionStatus } from "../db/schema";
import { STATUS_LABEL } from "../db/schema";

// Set to true to re-open new full paper submissions.
export const FULL_PAPER_SUBMISSION_OPEN = false;
export const FULL_PAPER_CLOSED_MESSAGE = "ปิดรับบทความฉบับสมบูรณ์ (Full Paper) แล้ว";

export const isDraft = (s: SubmissionStatus) => s === "draft";

export const canEdit = (s: SubmissionStatus) =>
  s === "draft" || s === "revision_requested";

export const canRevise = (s: SubmissionStatus) =>
  s === "revision_requested";

export const canCameraReady = (s: SubmissionStatus) =>
  s === "accepted";

export const canUploadFullPaper = (s: SubmissionStatus) =>
  FULL_PAPER_SUBMISSION_OPEN || s === "revision_requested";

export const canReplaceFile = (s: SubmissionStatus) =>
  s === "submitted";

export const canUpdateFiles = (s: SubmissionStatus) =>
  s !== "rejected";

export const isUnderReview = (s: SubmissionStatus) =>
  s === "under_review";

export const isSubmitted = (s: SubmissionStatus) =>
  s === "submitted";

export const isTerminal = (s: SubmissionStatus) =>
  s === "accepted" || s === "revision_requested" || s === "rejected";

export const TERMINAL_STATUSES: SubmissionStatus[] = [
  "accepted",
  "revision_requested",
  "rejected",
];

export const RE_REVIEW_STATUSES: SubmissionStatus[] = [
  "revision_requested",
];

export const ALL_NON_DRAFT: SubmissionStatus[] = [
  "submitted",
  "under_review",
  "accepted",
  "revision_requested",
  "rejected",
];

export const getStatusLabel = (status: SubmissionStatus, currentRound = 0): string => {
  const base = STATUS_LABEL[status] ?? status;
  if (status === "draft" || currentRound <= 0) return base;
  return `${base} (รอบ ${currentRound})`;
};

export const statusAfterDecision = (
  decision: "accept" | "reject" | "revise",
): SubmissionStatus => {
  if (decision === "accept") return "accepted";
  if (decision === "reject") return "rejected";
  return "revision_requested";
};

export const statusAfterSendReview = (): SubmissionStatus => "under_review";

export const statusAfterReviseUpload = (currentStatus: SubmissionStatus): SubmissionStatus | null => {
  if (currentStatus === "revision_requested") return "submitted";
  return null;
};

export const statusAfterFileUpload = (
  currentStatus: SubmissionStatus,
  hasUploadedFullPaper: boolean,
  latestReleasedReviewType?: ReviewType | null,
): SubmissionStatus | null => {
  if (currentStatus === "draft") return "submitted";
  const reviseStatus = statusAfterReviseUpload(currentStatus);
  if (reviseStatus) return reviseStatus;
  if (currentStatus === "accepted" && hasUploadedFullPaper && latestReleasedReviewType === "abstract") {
    return "submitted";
  }
  return null;
};
