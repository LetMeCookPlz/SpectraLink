SET NAMES utf8mb4;
ALTER DATABASE spectralink CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    PIB VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(64) NOT NULL,
    balance DECIMAL(10,2) UNSIGNED DEFAULT 0 NOT NULL,
    user_type ENUM('Customer', 'Employee', 'Admin') DEFAULT 'Customer' NOT NULL
);

CREATE TABLE IF NOT EXISTS Plans (
    plan_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30) NOT NULL UNIQUE,
    price INT UNSIGNED NOT NULL,
    volume INT UNSIGNED NOT NULL,
    bandwidth SMALLINT UNSIGNED NOT NULL
);

CREATE TABLE IF NOT EXISTS Connections (
    connection_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    plan_id INT NOT NULL,
    address VARCHAR(60) NOT NULL,
    connection_type ENUM('Коаксідальне', 'Оптоволокно', 'DSL') NOT NULL,
    status ENUM('Очікується', 'Активне', 'Призупинене') DEFAULT 'Очікується' NOT NULL,
    recurring_billing BOOL DEFAULT 1 NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES Plans(plan_id)
);

CREATE TABLE IF NOT EXISTS Transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    sum DECIMAL(10,2) NOT NULL,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE SET NULL
);

INSERT INTO Users (PIB, email, password, user_type) VALUES ('admin', 'admin@mail.com', '$2a$04$6aquDUeFU2rjcijeJfG/oO2NH6eHbIlUw37WAo7hG5OooN5rotZ0S', 'Admin');

INSERT INTO Plans (name, price, volume, bandwidth) VALUES('Standard', 400, 250, 100);
INSERT INTO Plans (name, price, volume, bandwidth) VALUES('Premium', 800, 500, 200);
INSERT INTO Plans (name, price, volume, bandwidth) VALUES('Budget', 200, 100, 75);