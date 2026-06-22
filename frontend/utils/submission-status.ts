export type SubmissionStatus =
  | "draft"
  | "submitted_round1"
  | "under_review_round1"
  | "passed_round1"
  | "passed_round1_with_revisions"
  | "rejected_round1"
  | "submitted_round2"
  | "under_review_round2"
  | "passed_round2"
  | "passed_round2_with_revisions"
  | "rejected_round2";

export const STATUS_LABEL: Record<SubmissionStatus, string> = {
  draft: "ร่าง",
  submitted_round1: "ส่งรอบที่ 1 แล้ว",
  under_review_round1: "อยู่ระหว่างรีวิวรอบที่ 1",
  passed_round1: "ผ่านรอบที่ 1",
  passed_round1_with_revisions: "ผ่านรอบที่ 1 แบบมีข้อแก้ไข",
  rejected_round1: "ไม่ผ่านรอบที่ 1",
  submitted_round2: "ส่งรอบที่ 2 แล้ว",
  under_review_round2: "อยู่ระหว่างรีวิวรอบที่ 2",
  passed_round2: "ผ่านรอบที่ 2",
  passed_round2_with_revisions: "ผ่านรอบที่ 2 แบบมีข้อแก้ไข",
  rejected_round2: "ไม่ผ่านรอบที่ 2",
};

export const STATUS_COLOR: Record<SubmissionStatus, string> = {
  draft: "gray",
  submitted_round1: "blue",
  under_review_round1: "amber",
  passed_round1: "green",
  passed_round1_with_revisions: "teal",
  rejected_round1: "red",
  submitted_round2: "blue",
  under_review_round2: "amber",
  passed_round2: "emerald",
  passed_round2_with_revisions: "teal",
  rejected_round2: "red",
};

export const ROUND_OF: Record<SubmissionStatus, 0 | 1 | 2> = {
  draft: 0,
  submitted_round1: 1, under_review_round1: 1,
  passed_round1: 1, passed_round1_with_revisions: 1, rejected_round1: 1,
  submitted_round2: 2, under_review_round2: 2,
  passed_round2: 2, passed_round2_with_revisions: 2, rejected_round2: 2,
};

export const canEdit = (s: SubmissionStatus) =>
  s === "draft" || s === "passed_round1_with_revisions" || s === "passed_round2_with_revisions";

export const canRevise = (s: SubmissionStatus) =>
  s === "passed_round1_with_revisions" || s === "passed_round2_with_revisions";

export const canCameraReady = (s: SubmissionStatus) =>
  s === "passed_round1" || s === "passed_round2";

export const TERMINAL_STATUSES: SubmissionStatus[] = [
  "passed_round1",
  "passed_round1_with_revisions",
  "rejected_round1",
  "passed_round2",
  "passed_round2_with_revisions",
  "rejected_round2",
];
