-- SQL script for local development only
-- Events are not supported on Cloud SQL
-- The monthly billing must be implemented via Cloud Scheduler

SET GLOBAL event_scheduler = ON;

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