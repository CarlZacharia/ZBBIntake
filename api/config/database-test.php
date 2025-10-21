<?php
/**
 * Database Configuration - Hosting Environment
 * Update these settings based on your hosting provider's database information
 */

class Database {
    // Update these settings for zbplans.com hosting environment
    private $host = 'localhost';           // Your DB host (usually 'localhost')
    private $db_name = 'zbplans';          // Your database name (might have a prefix)
    private $username = 'zbplansuser';     // Your database username (might have a prefix)
    private $password = 'ZB3ld3rl@w!';     // Your actual database password
    private $port = 3306;
    private $conn;

    /**
     * Get database connection
     */
    public function getConnection() {
        $this->conn = null;

        try {
            $dsn = "mysql:host=" . $this->host . ";port=" . $this->port . ";dbname=" . $this->db_name . ";charset=utf8mb4";

            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4",
                PDO::ATTR_TIMEOUT => 10 // 10 second timeout
            ];

            $this->conn = new PDO($dsn, $this->username, $this->password, $options);

            // Log successful connection
            error_log("Database connection successful for user: " . $this->username . " to database: " . $this->db_name);

        } catch(PDOException $exception) {
            // More detailed error logging
            $error_msg = "Database connection failed - Host: {$this->host}, DB: {$this->db_name}, User: {$this->username}, Error: " . $exception->getMessage();
            error_log($error_msg);

            // Check for common error patterns and provide helpful messages
            if (strpos($exception->getMessage(), 'Access denied') !== false) {
                error_log("SOLUTION: Check database username and password in hosting control panel");
            } elseif (strpos($exception->getMessage(), 'Unknown database') !== false) {
                error_log("SOLUTION: Create database '{$this->db_name}' in hosting control panel");
            } elseif (strpos($exception->getMessage(), "Can't connect to MySQL server") !== false) {
                error_log("SOLUTION: Check database host - might not be 'localhost' for this hosting provider");
            }

            throw new Exception("Database connection failed - check server error logs for details");
        }

        return $this->conn;
    }

    /**
     * Close database connection
     */
    public function closeConnection() {
        $this->conn = null;
    }

    /**
     * Test connection and return status
     */
    public function testConnection() {
        try {
            $conn = $this->getConnection();
            $this->closeConnection();
            return ['success' => true, 'message' => 'Connection successful'];
        } catch (Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
}

// If called directly, test the connection
if (basename($_SERVER['PHP_SELF']) == 'database.php') {
    header('Content-Type: application/json');
    $db = new Database();
    $result = $db->testConnection();
    echo json_encode($result);
}
?>
