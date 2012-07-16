
SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `multitube`
--

-- --------------------------------------------------------

--
-- Table structure for table `shortLinks`
--

CREATE TABLE IF NOT EXISTS `shortLinks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `video` varchar(512) NOT NULL,
  `code` varchar(512) NOT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8;
