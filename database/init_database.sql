-- ========================================================
-- INIT DATABASE SCRIPT FOR CLOUD (TiDB Cloud / Aiven / MySQL)
-- Du an Ban Sach Book Shop - Ho tro CV & Portfolio Live Demo
-- ========================================================

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `books`;
DROP TABLE IF EXISTS `payment_methods`;
DROP TABLE IF EXISTS `order_status`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `order_details`;
DROP TABLE IF EXISTS `reviews`;
DROP TABLE IF EXISTS `favorites`;
DROP TABLE IF EXISTS `discounts`;
DROP TABLE IF EXISTS `discount_applications`;
DROP TABLE IF EXISTS `contacts`;

-- 1. categories
CREATE TABLE `categories` (
  `category_id` varchar(10) NOT NULL,
  `category_name` varchar(50) NOT NULL,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `category_name` (`category_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 2. users
CREATE TABLE `users` (
  `user_id` varchar(10) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(128) NOT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `role` varchar(20) DEFAULT 'customer',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 3. books
CREATE TABLE `books` (
  `book_id` varchar(10) NOT NULL,
  `title` varchar(200) NOT NULL,
  `author` varchar(100) NOT NULL,
  `publisher` varchar(100) DEFAULT NULL,
  `publication_year` int DEFAULT NULL,
  `category_id` varchar(10) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock_quantity` int DEFAULT '0',
  `sold_quantity` int DEFAULT '0',
  `description` text,
  `cover_image_url` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`book_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `books_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`) ON DELETE CASCADE,
  CONSTRAINT `books_chk_1` CHECK ((`price` >= 0)),
  CONSTRAINT `books_chk_2` CHECK ((`stock_quantity` >= 0)),
  CONSTRAINT `books_chk_3` CHECK ((`sold_quantity` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 4. payment_methods
CREATE TABLE `payment_methods` (
  `payment_method_id` varchar(10) NOT NULL,
  `method_name` varchar(100) NOT NULL,
  `description` text,
  `status` varchar(20) DEFAULT 'active',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`payment_method_id`),
  UNIQUE KEY `method_name` (`method_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 5. order_status
CREATE TABLE `order_status` (
  `status_id` varchar(10) NOT NULL,
  `status_name` varchar(50) NOT NULL,
  PRIMARY KEY (`status_id`),
  UNIQUE KEY `status_name` (`status_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 6. orders
CREATE TABLE `orders` (
  `order_id` varchar(10) NOT NULL,
  `user_id` varchar(10) DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `status_id` varchar(10) DEFAULT NULL,
  `shipping_address` varchar(255) DEFAULT NULL,
  `payment_method_id` varchar(10) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`order_id`),
  KEY `user_id` (`user_id`),
  KEY `payment_method_id` (`payment_method_id`),
  KEY `status_id` (`status_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods` (`payment_method_id`) ON DELETE SET NULL,
  CONSTRAINT `orders_ibfk_3` FOREIGN KEY (`status_id`) REFERENCES `order_status` (`status_id`) ON DELETE SET NULL,
  CONSTRAINT `orders_chk_1` CHECK ((`total_amount` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 7. order_details
CREATE TABLE `order_details` (
  `detail_id` int NOT NULL AUTO_INCREMENT,
  `order_id` varchar(10) DEFAULT NULL,
  `book_id` varchar(10) DEFAULT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`detail_id`),
  KEY `order_id` (`order_id`),
  KEY `book_id` (`book_id`),
  CONSTRAINT `order_details_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE,
  CONSTRAINT `order_details_ibfk_2` FOREIGN KEY (`book_id`) REFERENCES `books` (`book_id`) ON DELETE CASCADE,
  CONSTRAINT `order_details_chk_1` CHECK ((`quantity` > 0)),
  CONSTRAINT `order_details_chk_2` CHECK ((`unit_price` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 8. reviews
CREATE TABLE `reviews` (
  `review_id` int NOT NULL AUTO_INCREMENT,
  `book_id` varchar(10) DEFAULT NULL,
  `user_id` varchar(10) DEFAULT NULL,
  `rating` int DEFAULT NULL,
  `comment` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`review_id`),
  UNIQUE KEY `book_id` (`book_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`book_id`) REFERENCES `books` (`book_id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_chk_1` CHECK ((`rating` between 1 and 5))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 9. favorites
CREATE TABLE `favorites` (
  `favorite_id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(10) DEFAULT NULL,
  `book_id` varchar(10) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`favorite_id`),
  UNIQUE KEY `user_id` (`user_id`,`book_id`),
  KEY `book_id` (`book_id`),
  CONSTRAINT `favorites_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `favorites_ibfk_2` FOREIGN KEY (`book_id`) REFERENCES `books` (`book_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 10. discounts
CREATE TABLE `discounts` (
  `discount_id` varchar(10) NOT NULL,
  `voucher_code` varchar(20) NOT NULL,
  `discount_percentage` decimal(5,2) DEFAULT NULL,
  `expiry_date` datetime NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`discount_id`),
  UNIQUE KEY `voucher_code` (`voucher_code`),
  CONSTRAINT `discounts_chk_1` CHECK ((`discount_percentage` between 1 and 100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 11. discount_applications
CREATE TABLE `discount_applications` (
  `application_id` int NOT NULL AUTO_INCREMENT,
  `order_id` varchar(10) DEFAULT NULL,
  `discount_id` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`application_id`),
  UNIQUE KEY `order_id` (`order_id`,`discount_id`),
  KEY `discount_id` (`discount_id`),
  CONSTRAINT `discount_applications_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE,
  CONSTRAINT `discount_applications_ibfk_2` FOREIGN KEY (`discount_id`) REFERENCES `discounts` (`discount_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 12. contacts
CREATE TABLE `contacts` (
  `contact_id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(10) DEFAULT NULL,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `subject` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `status` varchar(20) DEFAULT 'pending',
  `admin_response` text,
  `sent_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `responded_at` datetime DEFAULT NULL,
  PRIMARY KEY (`contact_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `contacts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ========================================================
-- INSERT INITIAL SEED DATA (20 BOOKS, USERS, CATEGORIES...)
-- ========================================================

-- Data for categories
INSERT INTO `categories` (`category_id`, `category_name`) VALUES ('CAT006', 'Biography');
INSERT INTO `categories` (`category_id`, `category_name`) VALUES ('CAT008', 'Business');
INSERT INTO `categories` (`category_id`, `category_name`) VALUES ('CAT001', 'Fiction');
INSERT INTO `categories` (`category_id`, `category_name`) VALUES ('CAT005', 'History');
INSERT INTO `categories` (`category_id`, `category_name`) VALUES ('CAT010', 'Mystery');
INSERT INTO `categories` (`category_id`, `category_name`) VALUES ('CAT002', 'Non-Fiction');
INSERT INTO `categories` (`category_id`, `category_name`) VALUES ('CAT009', 'Romance');
INSERT INTO `categories` (`category_id`, `category_name`) VALUES ('CAT003', 'Science');
INSERT INTO `categories` (`category_id`, `category_name`) VALUES ('CAT007', 'Self-Help');
INSERT INTO `categories` (`category_id`, `category_name`) VALUES ('CAT004', 'Technology');

-- Data for users
INSERT INTO `users` (`user_id`, `full_name`, `email`, `password`, `phone`, `address`, `role`, `created_at`) VALUES ('U001', 'John Doe', 'john.doe@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWU2u3ZU', '0123456789', '123 Main St, New York', 'customer', '2026-01-16 02:44:03');
INSERT INTO `users` (`user_id`, `full_name`, `email`, `password`, `phone`, `address`, `role`, `created_at`) VALUES ('U002', 'Jane Smith', 'jane.smith@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWU2u3ZU', '0987654321', '456 Oak Ave, Los Angeles', 'customer', '2026-01-16 02:44:03');
INSERT INTO `users` (`user_id`, `full_name`, `email`, `password`, `phone`, `address`, `role`, `created_at`) VALUES ('U003', 'Admin User', 'admin@bookshop.com', '$2b$12$ygJ1yRIe4EiykGdji044L.vECYmrIP2g5H55skogIUuPLttwMqyFO', '0111222333', '789 Admin Blvd, Chicago', 'admin', '2026-01-16 02:44:03');
INSERT INTO `users` (`user_id`, `full_name`, `email`, `password`, `phone`, `address`, `role`, `created_at`) VALUES ('U004', 'Alice Johnson', 'alice.j@email.com', '$2b$12$ygJ1yRIe4EiykGdji044L.vECYmrIP2g5H55skogIUuPLttwMqyFO', '0444555666', '321 Pine St, Boston', 'customer', '2026-01-16 02:44:03');
INSERT INTO `users` (`user_id`, `full_name`, `email`, `password`, `phone`, `address`, `role`, `created_at`) VALUES ('U005', 'Bob Williams', 'bob.w@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWU2u3ZU', '0777888999', '654 Elm St, Seattle', 'customer', '2026-01-16 02:44:03');
INSERT INTO `users` (`user_id`, `full_name`, `email`, `password`, `phone`, `address`, `role`, `created_at`) VALUES ('U006', 'Bùi Xuân Văn', 'van@gmail.com', '$2b$12$8h18f21n9MwgEdURBtH96OtGtAKJtA9eWpPZjWojzlsV6ty9IOCO6', '0653345652', '34 Thanh Khê', 'customer', '2026-01-15 20:52:41');
INSERT INTO `users` (`user_id`, `full_name`, `email`, `password`, `phone`, `address`, `role`, `created_at`) VALUES ('U007', 'Công Trung', 'trung@gmail.com', '$2b$12$5DHnxc.GPQaqhtD3nks5cuXEQhJejQZcvBmIAahv3avHaGLo9vL1i', '0876543234', '67 Nguyễn Trãi', 'customer', '2026-01-15 20:58:18');
INSERT INTO `users` (`user_id`, `full_name`, `email`, `password`, `phone`, `address`, `role`, `created_at`) VALUES ('U008', 'Dạ Trần', 'thtnv6789@gmail.com', '$2b$12$hX80v6N3heDw3IvigWMoXuQOCumyRCCRSlmZfDwbF6N.1/O6GNJt6', '0567890765', '34 Lê Hải', 'customer', '2026-01-15 20:59:32');
INSERT INTO `users` (`user_id`, `full_name`, `email`, `password`, `phone`, `address`, `role`, `created_at`) VALUES ('U009', 'Nguyễn Văn Viên', 'thtnv9876@gmail.com', '$2b$12$HhNRKK8ck2CFDHJ99C1MuOKt1ZxfRWWOo7CNQcH.ri08B.xe0fnQ2', '6666669999', '07 La Hà Đà Nẵng', 'customer', '2026-01-16 11:14:53');
INSERT INTO `users` (`user_id`, `full_name`, `email`, `password`, `phone`, `address`, `role`, `created_at`) VALUES ('U010', 'Viên Nguyễn', 'viennhan673@gmail.com', '$2b$12$e0nSC3qopq0BitwEmycr.eAtxR2ZC/fIfEdiTuDgd03ohAr/7Sd0e', '', NULL, 'customer', '2026-01-16 11:21:17');

-- Data for books
INSERT INTO `books` (`book_id`, `title`, `author`, `publisher`, `publication_year`, `category_id`, `price`, `stock_quantity`, `sold_quantity`, `description`, `cover_image_url`, `created_at`, `updated_at`) VALUES ('B001', 'Nhà Giả Kim', 'Paulo Coelho', 'Nhã Nam', 2021, 'CAT005', 85000.00, 50, 150, 'Câu chuyện về hành trình khám phá bản thân.', 'nhaGiaKim.jpg', '2026-01-16 02:44:03', '2026-01-16 02:44:03');
INSERT INTO `books` (`book_id`, `title`, `author`, `publisher`, `publication_year`, `category_id`, `price`, `stock_quantity`, `sold_quantity`, `description`, `cover_image_url`, `created_at`, `updated_at`) VALUES ('B002', 'Lược Sử Thời Gian', 'Stephen Hawking', 'Trẻ', 2020, 'CAT006', 120000.00, 27, 3, 'Khám phá bí ẩn của vũ trụ.', 'luocSuThoiGian.jpg', '2026-01-16 02:44:03', '2026-10-01 03:09:58');
INSERT INTO `books` (`book_id`, `title`, `author`, `publisher`, `publication_year`, `category_id`, `price`, `stock_quantity`, `sold_quantity`, `description`, `cover_image_url`, `created_at`, `updated_at`) VALUES ('B003', 'Đắc Nhân Tâm', 'Dale Carnegie', 'Trẻ', 2019, 'CAT007', 100000.00, 34, 6, 'Cẩm nang giao tiếp và quản lý mối quan hệ.', 'dacNhanTam.jpg', '2026-01-16 02:44:03', '2026-01-15 22:16:33');
INSERT INTO `books` (`book_id`, `title`, `author`, `publisher`, `publication_year`, `category_id`, `price`, `stock_quantity`, `sold_quantity`, `description`, `cover_image_url`, `created_at`, `updated_at`) VALUES ('B004', 'Dế Mèn Phiêu Lưu Ký', 'Tô Hoài', 'Kim Đồng', 2022, 'CAT010', 50000.00, 60, 150, 'Câu chuyện thiếu nhi nổi tiếng của Việt Nam.', 'deMenPhieuLuuKy.jpg', '2026-01-16 02:44:03', '2026-01-16 02:44:03');
INSERT INTO `books` (`book_id`, `title`, `author`, `publisher`, `publication_year`, `category_id`, `price`, `stock_quantity`, `sold_quantity`, `description`, `cover_image_url`, `created_at`, `updated_at`) VALUES ('B005', 'Lịch Sử Việt Nam', 'Nguyễn Văn Y', 'Giáo Dục', 2023, 'CAT005', 150000.00, 20, 0, 'Tài liệu về lịch sử dân tộc Việt Nam.', 'lichSuVietNam.jpg', '2026-01-16 02:44:03', '2026-01-16 02:44:03');
INSERT INTO `books` (`book_id`, `title`, `author`, `publisher`, `publication_year`, `category_id`, `price`, `stock_quantity`, `sold_quantity`, `description`, `cover_image_url`, `created_at`, `updated_at`) VALUES ('B006', 'Thiên Đường Mùa Hè', 'John Green', 'NXB Văn Học', 2021, 'CAT009', 95000.00, 50, 0, 'Một câu chuyện tình yêu đầy cảm xúc.', 'thienDuongMuaHe.jpg', '2026-01-16 02:44:03', '2026-01-16 02:44:03');
INSERT INTO `books` (`book_id`, `title`, `author`, `publisher`, `publication_year`, `category_id`, `price`, `stock_quantity`, `sold_quantity`, `description`, `cover_image_url`, `created_at`, `updated_at`) VALUES ('B007', 'Đi Tìm Lẽ Sống', 'Viktor Frankl', 'Đà Nẵng', 2020, 'CAT007', 130000.00, 40, 150, 'Cuốn sách giúp tìm lại ý nghĩa cuộc sống.', 'diTimLeSong.jpg', '2026-01-16 02:44:03', '2026-01-16 02:44:03');
INSERT INTO `books` (`book_id`, `title`, `author`, `publisher`, `publication_year`, `category_id`, `price`, `stock_quantity`, `sold_quantity`, `description`, `cover_image_url`, `created_at`, `updated_at`) VALUES ('B008', 'Khoa Học Về Tương Lai', 'Carl Sagan', 'Trẻ', 2018, 'CAT003', 110000.00, 60, 0, 'Khám phá tương lai của khoa học và công nghệ.', 'khoaHocVeTuongLai.jpg', '2026-01-16 02:44:03', '2026-01-16 02:44:03');
INSERT INTO `books` (`book_id`, `title`, `author`, `publisher`, `publication_year`, `category_id`, `price`, `stock_quantity`, `sold_quantity`, `description`, `cover_image_url`, `created_at`, `updated_at`) VALUES ('B009', 'Chìa Khóa Thành Công', 'Napoleon Hill', 'Lao Động', 2017, 'CAT008', 80000.00, 35, 150, 'Cẩm nang phát triển bản thân và thành công.', 'chiaKhoaThanhCong.jpg', '2026-01-16 02:44:03', '2026-01-16 02:44:03');
INSERT INTO `books` (`book_id`, `title`, `author`, `publisher`, `publication_year`, `category_id`, `price`, `stock_quantity`, `sold_quantity`, `description`, `cover_image_url`, `created_at`, `updated_at`) VALUES ('B010', 'Vương Quốc Thực Vật', 'Richard Dawkins', 'Tri Thức', 2019, 'CAT002', 140000.00, 25, 0, 'Nghiên cứu về thế giới thực vật.', 'vuongQuocThucVat.jpg', '2026-01-16 02:44:03', '2026-01-16 02:44:03');
INSERT INTO `books` (`book_id`, `title`, `author`, `publisher`, `publication_year`, `category_id`, `price`, `stock_quantity`, `sold_quantity`, `description`, `cover_image_url`, `created_at`, `updated_at`) VALUES ('B011', 'Bí Ẩn Vũ Trụ', 'Stephen Hawking', 'Trẻ', 2022, 'CAT004', 100000.00, 29, 151, 'Kiến thức khoa học về vũ trụ.', 'biAnVuTru.jpg', '2026-01-16 02:44:03', '2026-01-16 11:16:41');
INSERT INTO `books` (`book_id`, `title`, `author`, `publisher`, `publication_year`, `category_id`, `price`, `stock_quantity`, `sold_quantity`, `description`, `cover_image_url`, `created_at`, `updated_at`) VALUES ('B012', 'Bản Đồ Tâm Hồn', 'Thích Nhất Hạnh', 'Hồng Đức', 2020, 'CAT002', 95000.00, 45, 0, 'Hướng dẫn cách sống tỉnh thức.', 'banDoTamHon.jpg', '2026-01-16 02:44:03', '2026-01-16 02:44:03');
INSERT INTO `books` (`book_id`, `title`, `author`, `publisher`, `publication_year`, `category_id`, `price`, `stock_quantity`, `sold_quantity`, `description`, `cover_image_url`, `created_at`, `updated_at`) VALUES ('B013', 'Cuộc Sống Đúng Nghĩa', 'Mark Manson', 'NXB Thế Giới', 2021, 'CAT010', 85000.00, 50, 0, 'Một góc nhìn thực tế về cuộc sống.', 'cuocSongDungNghia.jpg', '2026-01-16 02:44:03', '2026-01-16 02:44:03');
INSERT INTO `books` (`book_id`, `title`, `author`, `publisher`, `publication_year`, `category_id`, `price`, `stock_quantity`, `sold_quantity`, `description`, `cover_image_url`, `created_at`, `updated_at`) VALUES ('B014', 'Mật Mã Da Vinci', 'Dan Brown', 'Kim Đồng', 2018, 'CAT003', 120000.00, 40, 150, 'Tiểu thuyết trinh thám – lịch sử.', 'matMaDaVinci.jpg', '2026-01-16 02:44:03', '2026-01-16 02:44:03');
INSERT INTO `books` (`book_id`, `title`, `author`, `publisher`, `publication_year`, `category_id`, `price`, `stock_quantity`, `sold_quantity`, `description`, `cover_image_url`, `created_at`, `updated_at`) VALUES ('B015', 'Những Điều Kỳ Diệu Của Cuộc Sống', 'Haruki Murakami', 'NXB Văn Học', 2022, 'CAT006', 130000.00, 55, 0, 'Những điều kỳ diệu trong đời sống thường ngày.', 'nhungDieuKyDieuCuaCuocSong.jpg', '2026-01-16 02:44:03', '2026-01-16 02:44:03');
INSERT INTO `books` (`book_id`, `title`, `author`, `publisher`, `publication_year`, `category_id`, `price`, `stock_quantity`, `sold_quantity`, `description`, `cover_image_url`, `created_at`, `updated_at`) VALUES ('B016', 'Atomic Habits', 'James Clear', 'Avery', 2020, 'CAT007', 125000.00, 45, 200, 'Phương pháp xây dựng thói quen tốt và loại bỏ thói quen xấu.', 'atomicHabits.jpg', '2026-01-16 02:44:03', '2026-01-16 02:44:03');
INSERT INTO `books` (`book_id`, `title`, `author`, `publisher`, `publication_year`, `category_id`, `price`, `stock_quantity`, `sold_quantity`, `description`, `cover_image_url`, `created_at`, `updated_at`) VALUES ('B017', 'Clean Code', 'Robert C. Martin', 'Prentice Hall', 2018, 'CAT004', 180000.00, 30, 120, 'Hướng dẫn viết mã sạch cho lập trình viên.', 'cleanCode.jpg', '2026-01-16 02:44:03', '2026-01-16 02:44:03');
INSERT INTO `books` (`book_id`, `title`, `author`, `publisher`, `publication_year`, `category_id`, `price`, `stock_quantity`, `sold_quantity`, `description`, `cover_image_url`, `created_at`, `updated_at`) VALUES ('B018', 'Sapiens: Lược Sử Loài Người', 'Yuval Noah Harari', 'NXB Tri Thức', 2019, 'CAT005', 160000.00, 35, 90, 'Câu chuyện tiến hóa của loài người từ cổ đại đến hiện đại.', 'sapiens.jpg', '2026-01-16 02:44:03', '2026-01-16 02:44:03');
INSERT INTO `books` (`book_id`, `title`, `author`, `publisher`, `publication_year`, `category_id`, `price`, `stock_quantity`, `sold_quantity`, `description`, `cover_image_url`, `created_at`, `updated_at`) VALUES ('B019', 'Think and Grow Rich', 'Napoleon Hill', 'NXB Lao Động', 2017, 'CAT008', 90000.00, 40, 150, 'Bí quyết thành công và tư duy làm giàu.', 'thinkAndGrowRich.jpg', '2026-01-16 02:44:03', '2026-01-16 02:44:03');
INSERT INTO `books` (`book_id`, `title`, `author`, `publisher`, `publication_year`, `category_id`, `price`, `stock_quantity`, `sold_quantity`, `description`, `cover_image_url`, `created_at`, `updated_at`) VALUES ('B020', 'The Psychology of Money', 'Morgan Housel', 'Harriman House', 2021, 'CAT008', 140000.00, 50, 110, 'Tâm lý học về cách con người quản lý tiền bạc.', 'psychologyOfMoney.jpg', '2026-01-16 02:44:03', '2026-01-16 02:44:03');

-- Data for payment_methods
INSERT INTO `payment_methods` (`payment_method_id`, `method_name`, `description`, `status`, `created_at`) VALUES ('PM001', 'Cash on Delivery (COD)', 'Pay with cash when receiving the product', 'active', '2026-01-16 02:44:03');
INSERT INTO `payment_methods` (`payment_method_id`, `method_name`, `description`, `status`, `created_at`) VALUES ('PM002', 'Credit Card', 'Pay with Visa, Mastercard, or other credit cards', 'active', '2026-01-16 02:44:03');
INSERT INTO `payment_methods` (`payment_method_id`, `method_name`, `description`, `status`, `created_at`) VALUES ('PM003', 'VNPay', 'Pay via VNPay e-wallet', 'active', '2026-01-16 02:44:03');
INSERT INTO `payment_methods` (`payment_method_id`, `method_name`, `description`, `status`, `created_at`) VALUES ('PM004', 'MoMo', 'Pay via MoMo e-wallet', 'active', '2026-01-16 02:44:03');
INSERT INTO `payment_methods` (`payment_method_id`, `method_name`, `description`, `status`, `created_at`) VALUES ('PM005', 'Bank Transfer', 'Direct bank transfer', 'active', '2026-01-16 02:44:03');

-- Data for order_status
INSERT INTO `order_status` (`status_id`, `status_name`) VALUES ('ST005', 'cancelled');
INSERT INTO `order_status` (`status_id`, `status_name`) VALUES ('ST004', 'completed');
INSERT INTO `order_status` (`status_id`, `status_name`) VALUES ('ST002', 'confirmed');
INSERT INTO `order_status` (`status_id`, `status_name`) VALUES ('ST001', 'processing');
INSERT INTO `order_status` (`status_id`, `status_name`) VALUES ('ST003', 'shipping');

-- Data for orders
INSERT INTO `orders` (`order_id`, `user_id`, `total_amount`, `status_id`, `shipping_address`, `payment_method_id`, `created_at`) VALUES ('O001', 'U001', 45000.97, 'ST003', '123 Main St, New York', 'PM001', '2026-01-15 10:30:00');
INSERT INTO `orders` (`order_id`, `user_id`, `total_amount`, `status_id`, `shipping_address`, `payment_method_id`, `created_at`) VALUES ('O002', 'U002', 180000.99, 'ST004', '456 Oak Ave, Los Angeles', 'PM003', '2026-01-10 14:15:00');
INSERT INTO `orders` (`order_id`, `user_id`, `total_amount`, `status_id`, `shipping_address`, `payment_method_id`, `created_at`) VALUES ('O003', 'U004', 67000.98, 'ST002', '321 Pine St, Boston', 'PM002', '2025-12-05 09:45:00');
INSERT INTO `orders` (`order_id`, `user_id`, `total_amount`, `status_id`, `shipping_address`, `payment_method_id`, `created_at`) VALUES ('O004', 'U001', 420000.99, 'ST003', '123 Main St, New York', 'PM004', '2025-02-10 16:20:00');
INSERT INTO `orders` (`order_id`, `user_id`, `total_amount`, `status_id`, `shipping_address`, `payment_method_id`, `created_at`) VALUES ('O005', 'U005', 190000.99, 'ST001', '654 Elm St, Seattle', 'PM001', '2025-02-28 11:00:00');
INSERT INTO `orders` (`order_id`, `user_id`, `total_amount`, `status_id`, `shipping_address`, `payment_method_id`, `created_at`) VALUES ('O006', 'U002', 250000.00, 'ST004', '456 Oak Ave, Los Angeles', 'PM002', '2026-01-05 09:20:00');
INSERT INTO `orders` (`order_id`, `user_id`, `total_amount`, `status_id`, `shipping_address`, `payment_method_id`, `created_at`) VALUES ('O007', 'U003', 180000.00, 'ST003', '789 Admin Blvd, Chicago', 'PM004', '2026-01-18 15:40:00');
INSERT INTO `orders` (`order_id`, `user_id`, `total_amount`, `status_id`, `shipping_address`, `payment_method_id`, `created_at`) VALUES ('O008', 'U004', 320000.00, 'ST004', '321 Pine St, Boston', 'PM003', '2025-12-12 11:10:00');
INSERT INTO `orders` (`order_id`, `user_id`, `total_amount`, `status_id`, `shipping_address`, `payment_method_id`, `created_at`) VALUES ('O009', 'U005', 150000.00, 'ST005', '654 Elm St, Seattle', 'PM001', '2025-12-20 18:30:00');
INSERT INTO `orders` (`order_id`, `user_id`, `total_amount`, `status_id`, `shipping_address`, `payment_method_id`, `created_at`) VALUES ('O010', 'U001', 210000.00, 'ST004', '123 Main St, New York', 'PM002', '2025-11-05 10:00:00');
INSERT INTO `orders` (`order_id`, `user_id`, `total_amount`, `status_id`, `shipping_address`, `payment_method_id`, `created_at`) VALUES ('O011', 'U002', 99000.00, 'ST001', '456 Oak Ave, Los Angeles', 'PM003', '2025-11-25 14:45:00');
INSERT INTO `orders` (`order_id`, `user_id`, `total_amount`, `status_id`, `shipping_address`, `payment_method_id`, `created_at`) VALUES ('O012', 'U003', 275000.00, 'ST002', '789 Admin Blvd, Chicago', 'PM004', '2025-10-08 16:20:00');
INSERT INTO `orders` (`order_id`, `user_id`, `total_amount`, `status_id`, `shipping_address`, `payment_method_id`, `created_at`) VALUES ('O013', 'U004', 340000.00, 'ST004', '321 Pine St, Boston', 'PM005', '2025-10-28 09:15:00');
INSERT INTO `orders` (`order_id`, `user_id`, `total_amount`, `status_id`, `shipping_address`, `payment_method_id`, `created_at`) VALUES ('O014', 'U008', 130000.00, 'ST001', '34 Lê Hải', 'PM002', '2026-01-15 21:01:39');
INSERT INTO `orders` (`order_id`, `user_id`, `total_amount`, `status_id`, `shipping_address`, `payment_method_id`, `created_at`) VALUES ('O015', 'U004', 130000.00, 'ST001', '321 Pine St, Boston', 'PM002', '2026-01-15 21:29:30');
INSERT INTO `orders` (`order_id`, `user_id`, `total_amount`, `status_id`, `shipping_address`, `payment_method_id`, `created_at`) VALUES ('O016', 'U004', 130000.00, 'ST001', '321 Pine St, Boston', 'PM002', '2026-01-15 21:31:35');
INSERT INTO `orders` (`order_id`, `user_id`, `total_amount`, `status_id`, `shipping_address`, `payment_method_id`, `created_at`) VALUES ('O017', 'U004', 130000.00, 'ST001', '321 Pine St, Boston', 'PM002', '2026-01-15 22:07:57');
INSERT INTO `orders` (`order_id`, `user_id`, `total_amount`, `status_id`, `shipping_address`, `payment_method_id`, `created_at`) VALUES ('O018', 'U004', 130000.00, 'ST001', '321 Pine St, Boston', 'PM002', '2026-01-15 22:14:48');
INSERT INTO `orders` (`order_id`, `user_id`, `total_amount`, `status_id`, `shipping_address`, `payment_method_id`, `created_at`) VALUES ('O019', 'U008', 130000.00, 'ST001', '34 Lê Hải', 'PM002', '2026-01-15 22:16:33');
INSERT INTO `orders` (`order_id`, `user_id`, `total_amount`, `status_id`, `shipping_address`, `payment_method_id`, `created_at`) VALUES ('O020', 'U009', 130000.00, 'ST001', '07 La Hà Đà Nẵng', 'PM002', '2026-01-16 11:16:41');
INSERT INTO `orders` (`order_id`, `user_id`, `total_amount`, `status_id`, `shipping_address`, `payment_method_id`, `created_at`) VALUES ('O021', 'U009', 150000.00, 'ST001', '07 La Hà Đà Nẵng', 'PM001', '2026-10-01 03:06:39');
INSERT INTO `orders` (`order_id`, `user_id`, `total_amount`, `status_id`, `shipping_address`, `payment_method_id`, `created_at`) VALUES ('O022', 'U009', 150000.00, 'ST001', '07 La Hà Đà Nẵng', 'PM002', '2026-10-01 03:07:17');
INSERT INTO `orders` (`order_id`, `user_id`, `total_amount`, `status_id`, `shipping_address`, `payment_method_id`, `created_at`) VALUES ('O023', 'U009', 150000.00, 'ST003', '07 La Hà Đà Nẵng', 'PM002', '2026-10-01 03:09:58');

-- Data for order_details
INSERT INTO `order_details` (`detail_id`, `order_id`, `book_id`, `quantity`, `unit_price`) VALUES (1, 'O001', 'B001', 2, 150000.99);
INSERT INTO `order_details` (`detail_id`, `order_id`, `book_id`, `quantity`, `unit_price`) VALUES (2, 'O001', 'B002', 1, 140000.99);
INSERT INTO `order_details` (`detail_id`, `order_id`, `book_id`, `quantity`, `unit_price`) VALUES (3, 'O002', 'B003', 1, 180000.99);
INSERT INTO `order_details` (`detail_id`, `order_id`, `book_id`, `quantity`, `unit_price`) VALUES (4, 'O003', 'B005', 1, 42000.99);
INSERT INTO `order_details` (`detail_id`, `order_id`, `book_id`, `quantity`, `unit_price`) VALUES (5, 'O003', 'B006', 1, 240000.99);
INSERT INTO `order_details` (`detail_id`, `order_id`, `book_id`, `quantity`, `unit_price`) VALUES (6, 'O004', 'B005', 1, 420000.99);
INSERT INTO `order_details` (`detail_id`, `order_id`, `book_id`, `quantity`, `unit_price`) VALUES (7, 'O005', 'B007', 1, 190000.99);
INSERT INTO `order_details` (`detail_id`, `order_id`, `book_id`, `quantity`, `unit_price`) VALUES (8, 'O006', 'B003', 1, 100000.00);
INSERT INTO `order_details` (`detail_id`, `order_id`, `book_id`, `quantity`, `unit_price`) VALUES (9, 'O006', 'B009', 1, 150000.00);
INSERT INTO `order_details` (`detail_id`, `order_id`, `book_id`, `quantity`, `unit_price`) VALUES (10, 'O007', 'B012', 2, 90000.00);
INSERT INTO `order_details` (`detail_id`, `order_id`, `book_id`, `quantity`, `unit_price`) VALUES (11, 'O008', 'B005', 1, 150000.00);
INSERT INTO `order_details` (`detail_id`, `order_id`, `book_id`, `quantity`, `unit_price`) VALUES (12, 'O008', 'B011', 1, 170000.00);
INSERT INTO `order_details` (`detail_id`, `order_id`, `book_id`, `quantity`, `unit_price`) VALUES (13, 'O009', 'B010', 1, 150000.00);
INSERT INTO `order_details` (`detail_id`, `order_id`, `book_id`, `quantity`, `unit_price`) VALUES (14, 'O010', 'B014', 1, 120000.00);
INSERT INTO `order_details` (`detail_id`, `order_id`, `book_id`, `quantity`, `unit_price`) VALUES (15, 'O010', 'B001', 1, 90000.00);
INSERT INTO `order_details` (`detail_id`, `order_id`, `book_id`, `quantity`, `unit_price`) VALUES (16, 'O011', 'B004', 1, 50000.00);
INSERT INTO `order_details` (`detail_id`, `order_id`, `book_id`, `quantity`, `unit_price`) VALUES (17, 'O011', 'B007', 1, 49000.00);
INSERT INTO `order_details` (`detail_id`, `order_id`, `book_id`, `quantity`, `unit_price`) VALUES (18, 'O012', 'B013', 2, 85000.00);
INSERT INTO `order_details` (`detail_id`, `order_id`, `book_id`, `quantity`, `unit_price`) VALUES (19, 'O012', 'B006', 1, 105000.00);
INSERT INTO `order_details` (`detail_id`, `order_id`, `book_id`, `quantity`, `unit_price`) VALUES (20, 'O013', 'B002', 1, 120000.00);
INSERT INTO `order_details` (`detail_id`, `order_id`, `book_id`, `quantity`, `unit_price`) VALUES (21, 'O013', 'B015', 1, 220000.00);
INSERT INTO `order_details` (`detail_id`, `order_id`, `book_id`, `quantity`, `unit_price`) VALUES (22, 'O014', 'B003', 1, 100000.00);
INSERT INTO `order_details` (`detail_id`, `order_id`, `book_id`, `quantity`, `unit_price`) VALUES (23, 'O015', 'B003', 1, 100000.00);
INSERT INTO `order_details` (`detail_id`, `order_id`, `book_id`, `quantity`, `unit_price`) VALUES (24, 'O016', 'B003', 1, 100000.00);
INSERT INTO `order_details` (`detail_id`, `order_id`, `book_id`, `quantity`, `unit_price`) VALUES (25, 'O017', 'B003', 1, 100000.00);
INSERT INTO `order_details` (`detail_id`, `order_id`, `book_id`, `quantity`, `unit_price`) VALUES (26, 'O018', 'B003', 1, 100000.00);
INSERT INTO `order_details` (`detail_id`, `order_id`, `book_id`, `quantity`, `unit_price`) VALUES (27, 'O019', 'B003', 1, 100000.00);
INSERT INTO `order_details` (`detail_id`, `order_id`, `book_id`, `quantity`, `unit_price`) VALUES (28, 'O020', 'B011', 1, 100000.00);
INSERT INTO `order_details` (`detail_id`, `order_id`, `book_id`, `quantity`, `unit_price`) VALUES (29, 'O021', 'B002', 1, 120000.00);
INSERT INTO `order_details` (`detail_id`, `order_id`, `book_id`, `quantity`, `unit_price`) VALUES (30, 'O022', 'B002', 1, 120000.00);
INSERT INTO `order_details` (`detail_id`, `order_id`, `book_id`, `quantity`, `unit_price`) VALUES (31, 'O023', 'B002', 1, 120000.00);

-- Data for reviews
INSERT INTO `reviews` (`review_id`, `book_id`, `user_id`, `rating`, `comment`, `created_at`) VALUES (1, 'B001', 'U001', 5, 'An absolute masterpiece! A must-read classic.', '2024-01-16 10:00:00');
INSERT INTO `reviews` (`review_id`, `book_id`, `user_id`, `rating`, `comment`, `created_at`) VALUES (2, 'B002', 'U002', 5, 'Powerful and moving story. Highly recommend!', '2024-01-22 15:30:00');
INSERT INTO `reviews` (`review_id`, `book_id`, `user_id`, `rating`, `comment`, `created_at`) VALUES (3, 'B003', 'U004', 4, 'Fascinating perspective on human history. Very insightful.', '2024-02-06 12:00:00');
INSERT INTO `reviews` (`review_id`, `book_id`, `user_id`, `rating`, `comment`, `created_at`) VALUES (4, 'B005', 'U001', 5, 'Essential reading for every software developer!', '2024-02-11 09:15:00');
INSERT INTO `reviews` (`review_id`, `book_id`, `user_id`, `rating`, `comment`, `created_at`) VALUES (5, 'B007', 'U005', 5, 'Life-changing book about building better habits.', '2024-03-01 14:45:00');

-- Data for favorites
INSERT INTO `favorites` (`favorite_id`, `user_id`, `book_id`, `created_at`) VALUES (1, 'U001', 'B001', '2024-01-10 08:00:00');
INSERT INTO `favorites` (`favorite_id`, `user_id`, `book_id`, `created_at`) VALUES (2, 'U001', 'B005', '2024-01-12 10:30:00');
INSERT INTO `favorites` (`favorite_id`, `user_id`, `book_id`, `created_at`) VALUES (3, 'U002', 'B002', '2024-01-18 14:00:00');
INSERT INTO `favorites` (`favorite_id`, `user_id`, `book_id`, `created_at`) VALUES (4, 'U004', 'B007', '2024-02-01 09:00:00');
INSERT INTO `favorites` (`favorite_id`, `user_id`, `book_id`, `created_at`) VALUES (5, 'U005', 'B006', '2024-02-15 13:30:00');

-- Data for discounts
INSERT INTO `discounts` (`discount_id`, `voucher_code`, `discount_percentage`, `expiry_date`, `created_at`) VALUES ('D001', 'NEWYEAR2024', 15.00, '2026-12-31 23:59:59', '2024-01-01 00:00:00');
INSERT INTO `discounts` (`discount_id`, `voucher_code`, `discount_percentage`, `expiry_date`, `created_at`) VALUES ('D002', 'WELCOME10', 10.00, '2026-12-31 23:59:59', '2024-01-01 00:00:00');
INSERT INTO `discounts` (`discount_id`, `voucher_code`, `discount_percentage`, `expiry_date`, `created_at`) VALUES ('D003', 'SUMMER25', 25.00, '2026-08-31 23:59:59', '2024-06-01 00:00:00');

-- Data for discount_applications
INSERT INTO `discount_applications` (`application_id`, `order_id`, `discount_id`) VALUES (1, 'O001', 'D002');
INSERT INTO `discount_applications` (`application_id`, `order_id`, `discount_id`) VALUES (2, 'O003', 'D001');

-- Data for contacts
INSERT INTO `contacts` (`contact_id`, `user_id`, `full_name`, `email`, `subject`, `message`, `status`, `admin_response`, `sent_at`, `responded_at`) VALUES (1, 'U001', 'John Doe', 'john.doe@email.com', 'Question about delivery', 'Hi, I would like to know the estimated delivery time for my order.', 'resolved', 'Hello John, your order will be delivered within 3-5 business days. Thank you!', '2024-01-17 10:00:00', '2024-01-17 14:30:00');
INSERT INTO `contacts` (`contact_id`, `user_id`, `full_name`, `email`, `subject`, `message`, `status`, `admin_response`, `sent_at`, `responded_at`) VALUES (2, 'U002', 'Jane Smith', 'jane.smith@email.com', 'Book recommendation', 'Can you recommend some good science fiction books?', 'resolved', 'We recommend checking out our Fiction category. Some popular titles include 1984 and The Da Vinci Code.', '2024-01-23 11:00:00', '2024-01-23 15:00:00');
INSERT INTO `contacts` (`contact_id`, `user_id`, `full_name`, `email`, `subject`, `message`, `status`, `admin_response`, `sent_at`, `responded_at`) VALUES (3, NULL, 'Guest User', 'guest@email.com', 'Store hours inquiry', 'What are your store operating hours?', 'pending', NULL, '2024-02-28 09:00:00', NULL);

SET FOREIGN_KEY_CHECKS = 1;
