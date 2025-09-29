-- Drop and recreate test database
DROP DATABASE IF EXISTS almatar_loyalty_test;
CREATE DATABASE almatar_loyalty_test;
USE almatar_loyalty_test;

-- Create users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  points_balance INT DEFAULT 0,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_status (status)
);

-- Create transfers table
CREATE TABLE transfers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sender_id INT NOT NULL,
  recipient_email VARCHAR(255) NOT NULL,
  recipient_id INT NULL,
  points INT NOT NULL,
  status ENUM('pending', 'confirmed', 'expired', 'cancelled') DEFAULT 'pending',
  token VARCHAR(255) UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  confirmed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_sender_id (sender_id),
  INDEX idx_recipient_email (recipient_email),
  INDEX idx_status (status),
  INDEX idx_expires_at (expires_at)
);