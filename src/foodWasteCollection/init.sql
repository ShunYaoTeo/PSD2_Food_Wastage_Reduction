CREATE DATABASE IF NOT EXISTS foodwaste;
USE foodwaste;

GRANT ALL PRIVILEGES ON foodwaste.* TO 'psd2_user'@'localhost';

CREATE TABLE IF NOT EXISTS restaurants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    owner_id INT NOT NULL,
    FOREIGN KEY (owner_id) REFERENCES auth.user (id)
);

CREATE TABLE IF NOT EXISTS food_waste (
    id INT PRIMARY KEY AUTO_INCREMENT,
    weight FLOAT NOT NULL,
    restaurant_id INT NOT NULL,
    food_type VARCHAR(255),
    reason VARCHAR(255),
    donated BOOLEAN,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants (id)
);

CREATE TABLE IF NOT EXISTS menu (
    id INT PRIMARY KEY AUTO_INCREMENT,
    item_name VARCHAR(255) NOT NULL,
    item_price FLOAT NOT NULL,
    description VARCHAR(255),
    restaurant_id INT NOT NULL,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants (id)
);

CREATE TABLE IF NOT EXISTS sales (
    id INT PRIMARY KEY AUTO_INCREMENT,
    date DATE NOT NULL,
    revenue FLOAT NOT NULL,
    customers INT NOT NULL,
    restaurant_id INT NOT NULL,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants (id)
);

CREATE TABLE IF NOT EXISTS employees (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    schedule VARCHAR(255),
    restaurant_id INT NOT NULL,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants (id)
);

-- Insert statements for sample data
-- insert into restaurants table
INSERT INTO restaurants (name, location, owner_id) VALUES
    ('Hai Di Lao', '2 Jurong East Street 21', 3),
    ('TungLok Seafood', '181 Orchard Road', 4),
    ('The Three Peacocks', '8 Port Road, Labrador Park', 5);

-- insert into food_waste table
INSERT INTO food_waste (weight, restaurant_id, food_type, reason, donated) VALUES
    (2.5, 1, 'vegetables', 'expired', false),
    (1.0, 2, 'meat', 'overcooked', true),
    (0.5, 3, 'bread', 'stale', false);

-- insert into menu table
INSERT INTO menu (item_name, item_price, description, restaurant_id) VALUES
    ('Cheeseburger', 8.99, 'Juicy beef patty with melted cheese on a sesame seed bun', 2),
    ('Pepperoni Pizza', 12.99, 'Classic pizza topped with spicy pepperoni slices', 3),
    ('Caesar Salad', 7.99, 'Crisp romaine lettuce with Caesar dressing and croutons', 1);

-- insert into sales table
INSERT INTO sales (date, revenue, customers, restaurant_id) VALUES
    ('2023-02-09', 500.25, 100, 1),
    ('2023-02-09', 750.50, 200, 2),
    ('2023-02-09', 1000.75, 300, 3);

-- insert into employees table
INSERT INTO employees (name, role, schedule, restaurant_id) VALUES
    ('Ron Weasley', 'Manager', 'M-F 9-5', 1),
    ('Mathan', 'Chef', 'T-S 12-8', 2),
    ('Alastair', 'Waiter', 'W-M 4-10', 3);

