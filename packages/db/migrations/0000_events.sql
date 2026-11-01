CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`source` text NOT NULL,
	`source_id` text NOT NULL,
	`source_url` text NOT NULL,
	`title` text NOT NULL,
	`type` text NOT NULL,
	`mode` text NOT NULL,
	`status` text NOT NULL,
	`description` text,
	`location` text,
	`city` text,
	`country` text,
	`starts_at` text,
	`ends_at` text,
	`submission_period` text,
	`organizer` text,
	`image_url` text,
	`tags` text DEFAULT '[]' NOT NULL,
	`prize_text` text,
	`scraped_at` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `events_source_identity_idx` ON `events` (`source`,`source_id`);--> statement-breakpoint
CREATE INDEX `events_starts_at_idx` ON `events` (`starts_at`);--> statement-breakpoint
CREATE INDEX `events_status_mode_idx` ON `events` (`status`,`mode`);