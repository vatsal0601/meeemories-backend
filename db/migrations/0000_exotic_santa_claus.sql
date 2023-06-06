CREATE TABLE `media` (
	`id` serial AUTO_INCREMENT PRIMARY KEY NOT NULL,
	`memory_id` int NOT NULL,
	`media_type` enum('image','video') NOT NULL,
	`name` varchar(256) NOT NULL,
	`url` varchar(256) NOT NULL,
	`blurhash` varchar(256));
--> statement-breakpoint
CREATE TABLE `memeries` (
	`id` serial AUTO_INCREMENT PRIMARY KEY NOT NULL,
	`user_id` varchar(256) NOT NULL,
	`description` text);
