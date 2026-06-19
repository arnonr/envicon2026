ALTER TABLE `submissions` ADD COLUMN `presentation_format` enum('oral','poster') NULL;
--> statement-breakpoint
UPDATE `submissions` SET `presentation_format` = 'oral' WHERE `presentation_format` IS NULL;
--> statement-breakpoint
ALTER TABLE `submissions` MODIFY COLUMN `presentation_format` enum('oral','poster') NOT NULL;
--> statement-breakpoint
ALTER TABLE `submission_versions` ADD COLUMN `presentation_format` enum('oral','poster') NULL;
--> statement-breakpoint
UPDATE `submission_versions` SET `presentation_format` = 'oral' WHERE `presentation_format` IS NULL;
--> statement-breakpoint
ALTER TABLE `submission_versions` MODIFY COLUMN `presentation_format` enum('oral','poster') NOT NULL;
