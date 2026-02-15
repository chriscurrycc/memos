-- memo_review_session_cache
CREATE TABLE `memo_review_session_cache` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL UNIQUE,
  `created_at` BIGINT NOT NULL DEFAULT (UNIX_TIMESTAMP()),
  `completed_at` BIGINT,
  `memo_ids` JSON NOT NULL,
  `total_count` INT NOT NULL DEFAULT 0
);
