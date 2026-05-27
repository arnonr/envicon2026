-- MySQL dump 10.13  Distrib 9.5.0, for macos26.0 (arm64)
--
-- Host: localhost    Database: envicon2026
-- ------------------------------------------------------
-- Server version	9.5.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ 'cd1182ea-a9e5-11f0-9a3d-d980f653bcb3:1-57623';

--
-- Table structure for table `event_registrations`
--

DROP TABLE IF EXISTS `event_registrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event_registrations` (
  `id` varchar(36) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `affiliation` varchar(500) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `event_registrations_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `event_registrations`
--

LOCK TABLES `event_registrations` WRITE;
/*!40000 ALTER TABLE `event_registrations` DISABLE KEYS */;
INSERT INTO `event_registrations` VALUES ('14208be8-2e94-437c-a79d-f6b46719c93e','tong','asdwqdwq','wqdwqwqd','wqdqwdA@dsad.com','2026-05-21 07:14:54');
/*!40000 ALTER TABLE `event_registrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `registrations`
--

DROP TABLE IF EXISTS `registrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registrations` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `type` enum('student','general') NOT NULL,
  `payment_status` enum('pending','confirmed') NOT NULL DEFAULT 'pending',
  `confirmed_by` varchar(36) DEFAULT NULL,
  `registered_at` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `registrations_user_id_users_id_fk` (`user_id`),
  KEY `registrations_confirmed_by_users_id_fk` (`confirmed_by`),
  CONSTRAINT `registrations_confirmed_by_users_id_fk` FOREIGN KEY (`confirmed_by`) REFERENCES `users` (`id`),
  CONSTRAINT `registrations_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registrations`
--

LOCK TABLES `registrations` WRITE;
/*!40000 ALTER TABLE `registrations` DISABLE KEYS */;
/*!40000 ALTER TABLE `registrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviewer_assignments`
--

DROP TABLE IF EXISTS `reviewer_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviewer_assignments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `reviewer_id` varchar(36) NOT NULL,
  `track` int NOT NULL,
  `max_papers` int NOT NULL DEFAULT '5',
  PRIMARY KEY (`id`),
  KEY `reviewer_assignments_reviewer_id_users_id_fk` (`reviewer_id`),
  CONSTRAINT `reviewer_assignments_reviewer_id_users_id_fk` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviewer_assignments`
--

LOCK TABLES `reviewer_assignments` WRITE;
/*!40000 ALTER TABLE `reviewer_assignments` DISABLE KEYS */;
/*!40000 ALTER TABLE `reviewer_assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` varchar(36) NOT NULL,
  `submission_id` varchar(36) NOT NULL,
  `reviewer_id` varchar(36) NOT NULL,
  `score` int DEFAULT NULL,
  `recommendation` enum('accept','reject','revise') DEFAULT NULL,
  `comments_to_author` text,
  `comments_to_editor` text,
  `status` enum('pending','completed') NOT NULL DEFAULT 'pending',
  `assigned_at` timestamp NOT NULL DEFAULT (now()),
  `completed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `reviews_submission_id_submissions_id_fk` (`submission_id`),
  KEY `reviews_reviewer_id_users_id_fk` (`reviewer_id`),
  CONSTRAINT `reviews_reviewer_id_users_id_fk` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`id`),
  CONSTRAINT `reviews_submission_id_submissions_id_fk` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `revisions`
--

DROP TABLE IF EXISTS `revisions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `revisions` (
  `id` varchar(36) NOT NULL,
  `submission_id` varchar(36) NOT NULL,
  `version` int NOT NULL,
  `file_url` varchar(500) NOT NULL,
  `changelog` text,
  `submitted_at` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `revisions_submission_id_submissions_id_fk` (`submission_id`),
  CONSTRAINT `revisions_submission_id_submissions_id_fk` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `revisions`
--

LOCK TABLES `revisions` WRITE;
/*!40000 ALTER TABLE `revisions` DISABLE KEYS */;
/*!40000 ALTER TABLE `revisions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `submissions`
--

DROP TABLE IF EXISTS `submissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `submissions` (
  `id` varchar(36) NOT NULL,
  `author_id` varchar(36) NOT NULL,
  `title` varchar(500) NOT NULL,
  `abstract` text,
  `keywords` varchar(500) DEFAULT NULL,
  `track` int NOT NULL,
  `status` enum('draft','pending_payment','payment_verifying','submitted','under_review','accepted','rejected','revision_requested') NOT NULL DEFAULT 'draft',
  `abstract_file_url` varchar(500) DEFAULT NULL,
  `full_paper_file_url` varchar(500) DEFAULT NULL,
  `submitted_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  `title_en` varchar(500) DEFAULT NULL,
  `creators` text,
  `submitter_type` enum('student','general') NOT NULL DEFAULT 'student',
  `payment_slip_url` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `submissions_author_id_users_id_fk` (`author_id`),
  CONSTRAINT `submissions_author_id_users_id_fk` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `submissions`
--

LOCK TABLES `submissions` WRITE;
/*!40000 ALTER TABLE `submissions` DISABLE KEYS */;
INSERT INTO `submissions` VALUES ('15e28607-faa6-4a1b-afff-e1f5cdd9cf8e','cf7b8cf8-c303-4b9f-b5b3-ce55f03a9a33','กกกก','กกไก','ไกหฟก, dsadsad',1,'accepted','/envicon2026/api/files/abstract-15e28607-faa6-4a1b-afff-e1f5cdd9cf8e-1779344516751.pdf',NULL,'2026-05-20 23:21:57','2026-05-21 11:42:44','กกก','[{\"firstName\":\"wqdwqd\",\"lastName\":\"wqdwqdwqdwqd\"}]','general','/envicon2026/api/files/slip-15e28607-faa6-4a1b-afff-e1f5cdd9cf8e-1779344527354.jpeg');
/*!40000 ALTER TABLE `submissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` varchar(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `affiliation` varchar(500) DEFAULT NULL,
  `role` enum('author','reviewer','admin') NOT NULL DEFAULT 'author',
  `oauth_provider` varchar(50) DEFAULT NULL,
  `oauth_id` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  `phone` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('7cba5e27-0d6d-4b58-95b8-b96f1d9737d5','tongfreedom1@gmail.com','$2b$10$tRS0dAIpSn7LUF2sqnmXNuRnlqzkbz861jZesk5zFQWnbmqtEAOty','ddddd','ddddd','admin',NULL,NULL,'2026-05-19 04:02:35','2026-05-21 07:17:04','0803332323'),('cf7b8cf8-c303-4b9f-b5b3-ce55f03a9a33','tongfreedom@gmail.com','$2b$10$tRS0dAIpSn7LUF2sqnmXNuRnlqzkbz861jZesk5zFQWnbmqtEAOty','dd','wdwqd','author',NULL,NULL,'2026-05-19 04:02:35','2026-05-19 04:02:35','0803332323'),('ef42d93a-091e-416a-a211-4d0f323ea1ca','author@envicon.ac.th','$2b$10$tRS0dAIpSn7LUF2sqnmXNuRnlqzkbz861jZesk5zFQWnbmqtEAOty','ดร.ทดสอบ ระบบ','มจพ.','author',NULL,NULL,'2026-04-09 11:02:21','2026-05-21 07:17:13',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'envicon2026'
--
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-25 13:53:16
