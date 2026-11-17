ALTER TABLE `submissions` ADD COLUMN `current_round` int NOT NULL DEFAULT 0;

ALTER TABLE `submissions` MODIFY COLUMN `status` varchar(64) NOT NULL DEFAULT 'draft';

UPDATE `submissions` SET `current_round` = 1, `status` = 'submitted' WHERE `status` = 'submitted_round1';
UPDATE `submissions` SET `current_round` = 1, `status` = 'under_review' WHERE `status` = 'under_review_round1';
UPDATE `submissions` SET `current_round` = 1, `status` = 'accepted' WHERE `status` = 'passed_round1';
UPDATE `submissions` SET `current_round` = 1, `status` = 'revision_requested' WHERE `status` = 'passed_round1_with_revisions';
UPDATE `submissions` SET `current_round` = 1, `status` = 'rejected' WHERE `status` = 'rejected_round1';

UPDATE `submissions` SET `current_round` = 2, `status` = 'submitted' WHERE `status` = 'submitted_round2';
UPDATE `submissions` SET `current_round` = 2, `status` = 'under_review' WHERE `status` = 'under_review_round2';
UPDATE `submissions` SET `current_round` = 2, `status` = 'accepted' WHERE `status` = 'passed_round2';
UPDATE `submissions` SET `current_round` = 2, `status` = 'revision_requested' WHERE `status` = 'passed_round2_with_revisions';
UPDATE `submissions` SET `current_round` = 2, `status` = 'rejected' WHERE `status` = 'rejected_round2';

ALTER TABLE `submissions`
  MODIFY COLUMN `status` enum('draft','submitted','under_review','accepted','revision_requested','rejected') NOT NULL DEFAULT 'draft';

ALTER TABLE `review_rounds`
  ADD COLUMN `review_type` enum('abstract','full_paper') NOT NULL DEFAULT 'abstract' AFTER `round_number`,
  ADD COLUMN `blind_file_url` varchar(500) NULL AFTER `review_type`;
