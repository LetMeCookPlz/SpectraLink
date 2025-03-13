CREATE TABLE IF NOT EXISTS Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    PIB VARCHAR(30) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(64) NOT NULL,
    balance INT UNSIGNED DEFAULT 0,
    user_type ENUM('Customer', 'Employee', 'Admin') DEFAULT 'Customer'
);

CREATE TABLE IF NOT EXISTS Plans (
    plan_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30) NOT NULL UNIQUE,
    price INT UNSIGNED NOT NULL,
    volume INT UNSIGNED,
    bandwidth SMALLINT UNSIGNED NOT NULL
);

CREATE TABLE IF NOT EXISTS Connections (
    connection_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    plan_id INT NOT NULL,
    address VARCHAR(60) NOT NULL,
    connection_type ENUM('Coaxidal', 'Fiber', 'DSL') NOT NULL,
    status BOOL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES Plans(plan_id)
);

CREATE TABLE IF NOT EXISTS Transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    sum INT NOT NULL,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

INSERT INTO Users (PIB, email, password, user_type) VALUES ('admin', 'admin@mail.com', '$2a$04$6aquDUeFU2rjcijeJfG/oO2NH6eHbIlUw37WAo7hG5OooN5rotZ0S', 'Admin');