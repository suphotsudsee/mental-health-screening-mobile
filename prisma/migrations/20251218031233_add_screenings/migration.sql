-- CreateTable
CREATE TABLE `screenings` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `stress_level` INTEGER NULL,
    `two_q1` BOOLEAN NULL,
    `two_q2` BOOLEAN NULL,
    `two_q_risk` BOOLEAN NULL,
    `nine_q_score` INTEGER NULL,
    `nine_q_level` VARCHAR(64) NULL,
    `suicide_risk` BOOLEAN NULL,
    `line_user_id` VARCHAR(64) NULL,
    `line_group_id` VARCHAR(64) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `screenings_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
