CREATE TABLE `estate_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`label` text,
	`notes` text,
	`current_step` text DEFAULT 'intro' NOT NULL,
	`has_asset_data` integer DEFAULT false NOT NULL,
	`family_data` text NOT NULL,
	`asset_data` text NOT NULL,
	`tax_calculation` text NOT NULL,
	`diagnosis_summary` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `profile_action_items` (
	`profile_id` text NOT NULL,
	`item_key` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`priority` text NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	`due_date` text,
	`estimated_cost_yen` integer,
	`order_index` integer,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`profile_id`, `item_key`),
	FOREIGN KEY (`profile_id`) REFERENCES `estate_profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `profile_action_items_profile_idx` ON `profile_action_items` (`profile_id`);--> statement-breakpoint
CREATE TABLE `profile_family_members` (
	`profile_id` text NOT NULL,
	`member_key` text NOT NULL,
	`name` text NOT NULL,
	`relationship` text NOT NULL,
	`birth_date` text,
	`age` integer,
	`address` text,
	`is_deceased` integer DEFAULT false NOT NULL,
	`inheritance_share` real,
	`inheritance_amount_manen` integer,
	`inheritance_tax_manen` integer,
	`metadata` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`profile_id`, `member_key`),
	FOREIGN KEY (`profile_id`) REFERENCES `estate_profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `profile_family_members_profile_idx` ON `profile_family_members` (`profile_id`);--> statement-breakpoint
CREATE TABLE `user_email_addresses` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`email_address` text NOT NULL,
	`verification_status` text,
	`is_primary` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `user_email_addresses_user_idx` ON `user_email_addresses` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_addresses_email_idx` ON `user_email_addresses` (`email_address`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`liff_sub` text NOT NULL,
	`clerk_user_id` text,
	`external_id` text,
	`primary_email_address_id` text,
	`first_name` text,
	`last_name` text,
	`display_name` text,
	`image_url` text,
	`phone_number` text,
	`public_metadata` text,
	`unsafe_metadata` text,
	`last_login_at` integer,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_liff_sub_idx` ON `users` (`liff_sub`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_clerk_user_id_idx` ON `users` (`clerk_user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_external_id_idx` ON `users` (`external_id`);