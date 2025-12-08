CREATE TABLE `events_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sub` text NOT NULL,
	`title` text NOT NULL,
	`subtitle` text NOT NULL,
	`description` text DEFAULT '',
	`type` text NOT NULL,
	`date` text NOT NULL,
	`time` text NOT NULL,
	`location` text NOT NULL,
	`race` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `events_table_sub_unique` ON `events_table` (`sub`);--> statement-breakpoint
CREATE INDEX `events_sub_idx` ON `events_table` (`sub`);