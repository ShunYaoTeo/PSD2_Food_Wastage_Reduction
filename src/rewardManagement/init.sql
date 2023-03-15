CREATE DATABASE IF NOT EXISTS rewards;
USE rewards;

GRANT ALL PRIVILEGES ON rewards.* TO 'psd2_user'@'localhost';

CREATE TABLE IF NOT EXISTS user_points (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    points INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES auth.user (id)
);

CREATE TABLE IF NOT EXISTS rewards (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    point_value INT NOT NULL,
    description VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS user_reward (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    reward_id INT NOT NULL,
    claimed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES auth.user (id),
    FOREIGN KEY (reward_id) REFERENCES rewards (id)
);

INSERT INTO rewards (name, point_value, description) VALUES 
("$10 Voucher", 30, "$10 Capitaland Voucher"),
("$20 Voucher", 50, "$10 Capitaland Voucher"),
("$30 Voucher", 70, "$10 Capitaland Voucher"),
("$40 Voucher", 100, "$10 Capitaland Voucher");