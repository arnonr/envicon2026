ALTER TABLE `submissions` ADD COLUMN `round1_file_url` varchar(500) NULL;
--> statement-breakpoint
ALTER TABLE `submissions` ADD COLUMN `round1_file_type` enum('abstract','full_paper') NULL;