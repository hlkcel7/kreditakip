CREATE TABLE IF NOT EXISTS `banks` (
    `id` varchar(36) NOT NULL,
    `name` text NOT NULL,
    `code` text,
    `branch_name` text,
    `contact_person` text,
    `phone` text,
    `email` text,
    `address` text,
    `status` text NOT NULL DEFAULT 'active',
    `created_at` datetime NOT NULL,
    PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `projects` (
    `id` varchar(36) NOT NULL,
    `name` text NOT NULL,
    `description` text,
    `status` text NOT NULL DEFAULT 'active',
    `created_at` datetime NOT NULL,
    PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `currencies` (
    `id` varchar(36) NOT NULL,
    `code` text NOT NULL,
    `name` text NOT NULL,
    `symbol` text,
    `status` text NOT NULL DEFAULT 'active',
    PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `exchange_rates` (
    `id` varchar(36) NOT NULL,
    `currency_code` text NOT NULL,
    `rate` decimal(10,2) NOT NULL,
    `date` date NOT NULL,
    `status` text NOT NULL DEFAULT 'active',
    PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `credits` (
    `id` varchar(36) NOT NULL,
    `project_id` varchar(36) NOT NULL,
    `bank_id` varchar(36) NOT NULL,
    `amount` decimal(10,2) NOT NULL,
    `currency` text NOT NULL,
    `interest_rate` decimal(5,2) NOT NULL,
    `start_date` date NOT NULL,
    `end_date` date NOT NULL,
    `payment_period` text NOT NULL,
    `description` text,
    `bsmv_rate` decimal(5,2),
    `kkdf_rate` decimal(5,2),
    `status` text NOT NULL DEFAULT 'active',
    `created_at` datetime NOT NULL,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`),
    FOREIGN KEY (`bank_id`) REFERENCES `banks` (`id`)
);

CREATE TABLE IF NOT EXISTS `guarantee_letters` (
    `id` varchar(36) NOT NULL,
    `project_id` varchar(36) NOT NULL,
    `bank_id` varchar(36) NOT NULL,
    `type` text NOT NULL,
    `amount` decimal(10,2) NOT NULL,
    `currency` text NOT NULL,
    `commission_rate` decimal(5,2) NOT NULL,
    `commission_period` text NOT NULL,
    `start_date` date NOT NULL,
    `end_date` date NOT NULL,
    `beneficiary` text NOT NULL,
    `description` text,
    `reference_no` text,
    `status` text NOT NULL DEFAULT 'active',
    `created_at` datetime NOT NULL,
    `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`),
    FOREIGN KEY (`bank_id`) REFERENCES `banks` (`id`)
);
