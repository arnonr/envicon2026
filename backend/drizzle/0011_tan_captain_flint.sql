ALTER TABLE `event_registrations` ADD `fee_type` enum('student','general') DEFAULT 'general' NOT NULL;--> statement-breakpoint
ALTER TABLE `event_registrations` ADD `fee` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `event_registrations` ADD `payment_slip_url` varchar(500);--> statement-breakpoint
ALTER TABLE `event_registrations` ADD `payment_status` enum('pending_verification','confirmed','rejected') DEFAULT 'pending_verification' NOT NULL;