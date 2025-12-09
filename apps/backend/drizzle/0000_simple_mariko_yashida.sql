CREATE TABLE `events_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`eventULID` text NOT NULL,
	`title` text NOT NULL,
	`subtitle` text NOT NULL,
	`description` text DEFAULT '',
	`type` text NOT NULL,
	`date` text NOT NULL,
	`time` text NOT NULL,
	`location` text NOT NULL,
	`race` integer DEFAULT false NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`user_id` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users_table`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `events_table_eventULID_unique` ON `events_table` (`eventULID`);--> statement-breakpoint
CREATE INDEX `events_eventULID_idx` ON `events_table` (`eventULID`);--> statement-breakpoint
CREATE TABLE `users_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`auth0Sub` text NOT NULL,
	`email` text NOT NULL,
	`nickname` text NOT NULL,
	`name` text,
	`picture` text,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_table_auth0Sub_unique` ON `users_table` (`auth0Sub`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_table_email_unique` ON `users_table` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_table_nickname_unique` ON `users_table` (`nickname`);--> statement-breakpoint
CREATE INDEX `users_auth0Sub_idx` ON `users_table` (`auth0Sub`);