-- memo_review_session
CREATE TABLE `memo_review_session` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `completed_at` BIGINT NOT NULL DEFAULT (UNIX_TIMESTAMP()),
  `memo_count` INT NOT NULL,
  `source` VARCHAR(256) NOT NULL DEFAULT 'review'
);

CREATE INDEX idx_memo_review_session_user ON `memo_review_session`(`user_id`, `completed_at`);

-- memo_review
CREATE TABLE `memo_review` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `memo_id` INT NOT NULL,
  `reviewed_at` BIGINT NOT NULL DEFAULT (UNIX_TIMESTAMP()),
  `source` VARCHAR(256) NOT NULL DEFAULT 'review',
  `session_id` INT,
  FOREIGN KEY (`session_id`) REFERENCES `memo_review_session`(`id`)
);

CREATE INDEX idx_memo_review_user ON `memo_review`(`user_id`);
CREATE INDEX idx_memo_review_user_time ON `memo_review`(`user_id`, `reviewed_at`);
CREATE INDEX idx_memo_review_user_memo ON `memo_review`(`user_id`, `memo_id`);
