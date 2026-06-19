ALTER TABLE `submissions` ADD COLUMN `education_level` enum('bachelor','master','doctorate') NULL;
--> statement-breakpoint
UPDATE `submissions` SET `education_level` = 'bachelor' WHERE `education_level` IS NULL;
--> statement-breakpoint
ALTER TABLE `submissions` MODIFY COLUMN `education_level` enum('bachelor','master','doctorate') NOT NULL;
--> statement-breakpoint
ALTER TABLE `submission_versions` ADD COLUMN `education_level` enum('bachelor','master','doctorate') NULL;
--> statement-breakpoint
UPDATE `submission_versions` SET `education_level` = 'bachelor' WHERE `education_level` IS NULL;
--> statement-breakpoint
ALTER TABLE `submission_versions` MODIFY COLUMN `education_level` enum('bachelor','master','doctorate') NOT NULL;
