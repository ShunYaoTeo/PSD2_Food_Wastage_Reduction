CREATE USER 'psd2_user'@'localhost' IDENTIFIED BY 'Auth123';

CREATE DATABASE IF NOT EXISTS auth;

GRANT ALL PRIVILEGES ON auth.* TO 'psd2_user'@'localhost';

USE auth;

CREATE TABLE IF NOT EXISTS user (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(255) NOT NULL,
	password VARCHAR(255) NOT NULL,
	admin BOOLEAN NOT NULL DEFAULT false,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS correlation_ids (
    id INT PRIMARY KEY AUTO_INCREMENT,
    correlation_id VARCHAR(255) NOT NULL,
    request_type VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO user (email, username, password, admin) VALUES ('shunyaoteo99@gmail.com', 'Shun Yao', 'Admin123', true);
INSERT INTO user (email, username, password, admin) VALUES ('test@test.com', 'tester619', 'test', true);
INSERT INTO user (email, username, password) VALUES ('haidilao@owner.com', 'HDLowner', 'haidilao');
INSERT INTO user (email, username, password) VALUES ('tunglok@owner.com', 'TLowner', 'tunglok');
INSERT INTO user (email, username, password) VALUES ('threepeacocks@owner.com','TPowner', 'threepeacocks');