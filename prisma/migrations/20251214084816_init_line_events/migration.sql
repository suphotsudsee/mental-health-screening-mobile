-- CreateTable
CREATE TABLE `line_events` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `event_type` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(64) NULL,
    `reply_token` VARCHAR(255) NULL,
    `message_type` VARCHAR(50) NULL,
    `message_text` TEXT NULL,
    `raw_json` JSON NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `line_events_user_id_idx`(`user_id`),
    INDEX `line_events_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
