ALTER TABLE `event_registrations` ADD `receipt_name` varchar(255);--> statement-breakpoint
ALTER TABLE `event_registrations` ADD `receipt_tax_id` varchar(20);--> statement-breakpoint
ALTER TABLE `event_registrations` ADD `receipt_address` text;--> statement-breakpoint
ALTER TABLE `submissions` ADD `receipt_name` varchar(255);--> statement-breakpoint
ALTER TABLE `submissions` ADD `receipt_tax_id` varchar(20);--> statement-breakpoint
ALTER TABLE `submissions` ADD `receipt_address` text;