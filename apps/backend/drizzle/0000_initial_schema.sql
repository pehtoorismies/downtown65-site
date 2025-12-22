CREATE TABLE `events_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`eventULID` text NOT NULL,
	`title` text NOT NULL,
	`subtitle` text NOT NULL,
	`description` text DEFAULT '',
	`eventType` text NOT NULL,
	`dateStart` text NOT NULL,
	`timeStart` text,
	`location` text NOT NULL,
	`race` integer DEFAULT false NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`createdBy` integer NOT NULL,
	FOREIGN KEY (`createdBy`) REFERENCES `users_table`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `events_table_eventULID_unique` ON `events_table` (`eventULID`);--> statement-breakpoint
CREATE INDEX `events_eventULID_idx` ON `events_table` (`eventULID`);--> statement-breakpoint
CREATE TABLE `users_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`auth0Sub` text NOT NULL,
	`nickname` text NOT NULL,
	`picture` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_table_auth0Sub_unique` ON `users_table` (`auth0Sub`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_table_nickname_unique` ON `users_table` (`nickname`);--> statement-breakpoint
CREATE INDEX `users_auth0Sub_idx` ON `users_table` (`auth0Sub`);