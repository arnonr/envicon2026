-- Round-based status migration: stage → backfill → enforce enum
-- Step 1: relax to VARCHAR so we can stage new values
ALTER TABLE `submissions` MODIFY COLUMN `status` VARCHAR(64) NOT NULL DEFAULT 'draft';

-- Step 2: backfill existing rows using latest review_rounds row to derive the round number
UPDATE `submissions` s
LEFT JOIN (
  SELECT submission_id, round_number,
         ROW_NUMBER() OVER (PARTITION BY submission_id ORDER BY round_number DESC) rn
  FROM `review_rounds`
) lr ON lr.submission_id = s.id AND lr.rn = 1
SET s.status = CASE
  WHEN s.status = 'draft' THEN 'draft'
  WHEN s.status = 'submitted' THEN CONCAT('submitted_round', COALESCE(lr.round_number, 1))
  WHEN s.status = 'under_review' THEN CONCAT('under_review_round', COALESCE(lr.round_number, 1))
  WHEN s.status = 'accepted' THEN CONCAT('passed_round', COALESCE(lr.round_number, 1))
  WHEN s.status = 'rejected' THEN CONCAT('rejected_round', COALESCE(lr.round_number, 1))
  WHEN s.status = 'revision_requested' THEN CONCAT('passed_round', COALESCE(lr.round_number, 1), '_with_revisions')
  ELSE s.status
END
WHERE s.status IN ('draft','submitted','under_review','accepted','rejected','revision_requested');

-- Step 3: enforce the strict enum
ALTER TABLE `submissions` MODIFY COLUMN `status` enum('draft','submitted_round1','under_review_round1','passed_round1','passed_round1_with_revisions','rejected_round1','submitted_round2','under_review_round2','passed_round2','passed_round2_with_revisions','rejected_round2') NOT NULL DEFAULT 'draft';
