-- 짭방 데이터베이스 스키마

CREATE DATABASE IF NOT EXISTS jjabbang DEFAULT CHARACTER SET utf8mb4;
USE jjabbang;

-- 사용자
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  nickname VARCHAR(50) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  is_verified TINYINT(1) DEFAULT 0,
  is_banned TINYINT(1) DEFAULT 0,
  verify_token VARCHAR(255),
  reset_token VARCHAR(255),
  reset_token_expiry DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 매물
CREATE TABLE properties (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type ENUM('오피스텔', '연립다세대') NOT NULL,
  deal_type ENUM('매매', '전세/월세') NOT NULL,
  district VARCHAR(100),
  price INT,
  area DECIMAL(8,2),
  floor INT,
  deal_year VARCHAR(4),
  deal_month VARCHAR(2),
  lawd_cd VARCHAR(10),
  lat DECIMAL(10,7),
  lng DECIMAL(10,7),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_property (name, deal_type, district, deal_year, deal_month, area)
);

-- 즐겨찾기
CREATE TABLE favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  property_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_fav (user_id, property_id)
);

-- 인증 서류
CREATE TABLE certifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 리뷰
CREATE TABLE reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  property_id INT NOT NULL,
  noise TINYINT NOT NULL COMMENT '1~5점',
  sunlight TINYINT NOT NULL COMMENT '1~5점',
  water_pressure TINYINT NOT NULL COMMENT '1~5점',
  management_fee TINYINT NOT NULL COMMENT '1~5점',
  environment TINYINT NOT NULL COMMENT '1~5점',
  content TEXT,
  is_hidden TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_review (user_id, property_id)
);

-- 신고
CREATE TABLE reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  review_id INT NOT NULL,
  reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
);

-- 관리자 계정 생성 (비밀번호: admin1234 → bcrypt)
-- 실제 사용 시 비밀번호 변경 필요
INSERT INTO users (email, password, nickname, role, is_verified)
VALUES ('admin@jjab-bang.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHi2', '관리자', 'admin', 1);
