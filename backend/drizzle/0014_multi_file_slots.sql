ALTER TABLE `revisions` ADD `abstract_file_url` varchar(500);--> statement-breakpoint
ALTER TABLE `revisions` ADD `abstract_word_file_url` varchar(500);--> statement-breakpoint
ALTER TABLE `revisions` ADD `full_paper_file_url` varchar(500);--> statement-breakpoint
ALTER TABLE `revisions` ADD `full_paper_word_file_url` varchar(500);--> statement-breakpoint
ALTER TABLE `submission_versions` ADD `abstract_file_url` varchar(500);--> statement-breakpoint
ALTER TABLE `submission_versions` ADD `abstract_word_file_url` varchar(500);--> statement-breakpoint
ALTER TABLE `submission_versions` ADD `full_paper_file_url` varchar(500);--> statement-breakpoint
ALTER TABLE `submission_versions` ADD `full_paper_word_file_url` varchar(500);--> statement-breakpoint
ALTER TABLE `submissions` ADD `abstract_word_file_url` varchar(500);--> statement-breakpoint
ALTER TABLE `submissions` ADD `full_paper_word_file_url` varchar(500);