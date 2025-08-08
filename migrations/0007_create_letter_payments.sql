CREATE TABLE `letter_payments` (
    `id` varchar(36) NOT NULL,
    `letter_id` varchar(36) NOT NULL,
    `payment_date` date NOT NULL,
    `amount` decimal(15,2) NOT NULL,
    `bsmv` decimal(15,2) NOT NULL DEFAULT '0',
    `receipt_no` varchar(50),
    `description` text,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`letter_id`) REFERENCES `guarantee_letters` (`id`) ON DELETE CASCADE
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
