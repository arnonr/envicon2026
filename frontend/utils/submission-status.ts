export type ReviewType = "abstract" | "full_paper";

export type SubmissionStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "accepted"
  | "revision_requested"
  | "rejected";

export const STATUS_LABEL: Record<SubmissionStatus, string> = {
  draft: "ฉบับร่าง",
  submitted: "รอส่งประเมิน",
  under_review: "อยู่ระหว่างประเมิน",
  accepted: "ผ่านการพิจารณา",
  revision_requested: "ส่งกลับแก้ไข",
  rejected: "ไม่ผ่านการพิจารณา",
};

export const STATUS_COLOR: Record<SubmissionStatus, string> = {
  draft: "gray",
  submitted: "blue",
  under_review: "amber",
  accepted: "emerald",
  revision_requested: "teal",
  rejected: "red",
};

export const getStatusLabel = (status: string, currentRound = 0): string => {
  const base = STATUS_LABEL[status as SubmissionStatus] ?? status;
  if (status === "draft" || !currentRound || currentRound <= 0) return base;
  return `${base} (รอบ ${currentRound})`;
};

// Set to true to re-open new full paper submissions.
export const FULL_PAPER_SUBMISSION_OPEN = false;

export const canEdit = (s: SubmissionStatus) =>
  s === "draft" || s === "revision_requested";

export const canRevise = (s: SubmissionStatus) =>
  s === "revision_requested";

export const canCameraReady = (s: SubmissionStatus) =>
  s === "accepted";

export const canUploadFullPaper = (s: string) =>
  FULL_PAPER_SUBMISSION_OPEN || s === "revision_requested";

export const canUpdateFiles = (s: SubmissionStatus) =>
  s !== "rejected";

export const TERMINAL_STATUSES: SubmissionStatus[] = [
  "accepted",
  "revision_requested",
  "rejected",
];
