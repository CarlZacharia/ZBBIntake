<?php
/**
 * Database Configuration
 * Handles database connection for ZBB Intake system
 */

require_once __DIR__ . '/../helpers/env.php';

class Database {
    private $host;
    private $db_name;
    private $username;
    private $password;
    private $port;
    private $conn;

    public function __construct() {
        Env::load();
        $this->host = Env::get('DB_HOST', 'localhost');
        $this->db_name = Env::get('DB_NAME', 'zbbintake');
        $this->username = Env::get('DB_USER', 'zbbintakeuser');
        $this->password = Env::get('DB_PASSWORD', '');
        $this->port = (int) Env::get('DB_PORT', 3306);
    }

    /**
     * Get database connection
     */
    public function getConnection() {
        $this->conn = null;

        try {
            $dsn = sprintf(
                'mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4',
                $this->host,
                $this->port,
                $this->db_name
            );

            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
            ];

            $this->conn = new PDO($dsn, $this->username, $this->password, $options);

        } catch(PDOException $exception) {
            error_log("Connection error: " . $exception->getMessage());
            throw new Exception("Database connection failed");
        }

        return $this->conn;
    }

    /**
     * Close database connection
     */
    public function closeConnection() {
        $this->conn = null;
    }
}
?>
