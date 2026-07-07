-- Food Store MVP - schema + seed data
-- Run this against MySQL before starting the backend:
--   mysql -u root -p < schema.sql

CREATE DATABASE IF NOT EXISTS food_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE food_store;

-- ---------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(150)  NOT NULL,
    email           VARCHAR(150)  NOT NULL UNIQUE,
    password_hash   VARCHAR(255)  NOT NULL,
    phone           VARCHAR(30),
    role            ENUM('CUSTOMER','ADMIN') NOT NULL DEFAULT 'CUSTOMER',
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
    id      BIGINT AUTO_INCREMENT PRIMARY KEY,
    name    VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS food_items (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(150) NOT NULL,
    description     TEXT,
    price           DECIMAL(10,2) NOT NULL,
    image_url       VARCHAR(255),
    category_id     BIGINT,
    is_available    BOOLEAN NOT NULL DEFAULT TRUE,
    stock_quantity  INT NOT NULL DEFAULT 0,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_food_items_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS orders (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT NOT NULL,
    status          ENUM('PENDING','CONFIRMED','COMPLETED','CANCELLED') NOT NULL DEFAULT 'PENDING',
    total_amount    DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS order_items (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id        BIGINT NOT NULL,
    food_item_id    BIGINT NOT NULL,
    quantity        INT NOT NULL,
    price           DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_order_items_food_item FOREIGN KEY (food_item_id) REFERENCES food_items(id)
);

CREATE TABLE IF NOT EXISTS carts (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT NOT NULL UNIQUE,
    CONSTRAINT fk_carts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cart_items (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    cart_id         BIGINT NOT NULL,
    food_item_id    BIGINT NOT NULL,
    quantity        INT NOT NULL,
    CONSTRAINT fk_cart_items_cart FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    CONSTRAINT fk_cart_items_food_item FOREIGN KEY (food_item_id) REFERENCES food_items(id) ON DELETE CASCADE,
    CONSTRAINT uq_cart_food UNIQUE (cart_id, food_item_id)
);

-- ---------------------------------------------------------------------
-- Seed data
-- ---------------------------------------------------------------------

-- Admin user, password = "Admin@123" (BCrypt hash, strength 10)
INSERT INTO users (name, email, password_hash, phone, role, active) VALUES
('Store Admin', 'admin@foodstore.com', '$2a$10$tRNTr6d40.YbWVymvURnMewhlOp9Cb9d6bHzQ9BRgzdpypq8xerKi', '9999999999', 'ADMIN', TRUE);

INSERT INTO categories (name) VALUES
('Pizza'), ('Burgers'), ('Beverages'), ('Desserts');

INSERT INTO food_items (name, description, price, image_url, category_id, is_available, stock_quantity) VALUES
('Margherita Pizza', 'Classic pizza with tomato, mozzarella and basil', 8.99, NULL, 1, TRUE, 50),
('Pepperoni Pizza', 'Pizza topped with pepperoni and mozzarella', 9.99, NULL, 1, TRUE, 50),
('Cheeseburger', 'Beef patty with cheese, lettuce and tomato', 6.49, NULL, 2, TRUE, 40),
('Veggie Burger', 'Grilled veggie patty with fresh toppings', 5.99, NULL, 2, TRUE, 40),
('Cola', '330ml chilled soft drink', 1.99, NULL, 3, TRUE, 100),
('Lemonade', 'Freshly squeezed lemonade', 2.49, NULL, 3, TRUE, 60),
('Chocolate Brownie', 'Rich chocolate brownie with walnuts', 3.99, NULL, 4, TRUE, 30),
('Ice Cream Cup', 'Vanilla ice cream cup', 2.99, NULL, 4, TRUE, 30);
