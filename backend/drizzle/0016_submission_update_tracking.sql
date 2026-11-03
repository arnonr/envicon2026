ALTER TABLE `submissions` ADD `author_updated_at` timestamp NULL DEFAULT NULL;--> statement-breakpoint
ALTER TABLE `submissions` ADD `author_update_summary` varchar(500);--> statement-breakpoint
ALTER TABLE `submissions` ADD `author_updated_slots` varchar(255);--> statement-breakpoint
ALTER TABLE `submissions` ADD `admin_seen_at` timestamp NULL DEFAULT NULL;
