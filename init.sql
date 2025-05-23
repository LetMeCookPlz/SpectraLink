SET NAMES utf8mb4;
ALTER DATABASE spectralink CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
SET GLOBAL event_scheduler = ON;

CREATE TABLE IF NOT EXISTS Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    PIB VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(64) NOT NULL,
    balance DECIMAL(10,2) UNSIGNED DEFAULT 0 NOT NULL,
    user_role ENUM('Client', 'Admin') DEFAULT 'Client' NOT NULL
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

INSERT INTO Users (PIB, email, password, user_role) VALUES ('admin', 'admin@mail.com', '$2a$04$6aquDUeFU2rjcijeJfG/oO2NH6eHbIlUw37WAo7hG5OooN5rotZ0S', 'Admin');

INSERT INTO Plans (name, price, volume, bandwidth) VALUES('Standard', 400, 250, 100);
INSERT INTO Plans (name, price, volume, bandwidth) VALUES('Premium', 800, 500, 200);
INSERT INTO Plans (name, price, volume, bandwidth) VALUES('Budget', 200, 100, 75);

DELIMITER //

CREATE EVENT IF NOT EXISTS monthly_billing
ON SCHEDULE EVERY 1 MONTH
STARTS TIMESTAMP(DATE_FORMAT(DATE_ADD(CURRENT_DATE(), INTERVAL 1 MONTH), '%Y-%m-01 00:00:00'))
ON COMPLETION PRESERVE ENABLE
DO
BEGIN
    DECLARE done BOOL DEFAULT FALSE;
    DECLARE v_connection_id INT;
    DECLARE v_user_id INT;
    DECLARE v_plan_id INT;
    DECLARE v_price DECIMAL(10,2);
    DECLARE v_balance DECIMAL(10,2);
    
    DECLARE cur CURSOR FOR 
        SELECT c.connection_id, c.user_id, c.plan_id, p.price
        FROM Connections c
        JOIN Plans p ON c.plan_id = p.plan_id
        WHERE c.status = 'Активне' AND c.recurring_billing = 1;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    UPDATE Connections
    SET status = 'Призупинене' 
    WHERE recurring_billing = 0 AND status = 'Активне';
		
    OPEN cur;
    
    read_loop: LOOP
        FETCH cur INTO v_connection_id, v_user_id, v_plan_id, v_price;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        START TRANSACTION;
        SELECT balance INTO v_balance FROM Users WHERE user_id = v_user_id FOR UPDATE;
        
        IF v_balance >= v_price THEN
            UPDATE Users SET balance = balance - v_price WHERE user_id = v_user_id;
            INSERT INTO Transactions (user_id, sum) VALUES (v_user_id, -v_price);
        ELSE
            UPDATE Connections SET status = 'Призупинене' WHERE connection_id = v_connection_id;
        END IF;
        
        COMMIT;
    END LOOP;
    
    CLOSE cur;
END //

DELIMITER ;