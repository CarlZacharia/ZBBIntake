<?php
/**
 * Test Script for ZBB Intake API
 * Run this to test your PHP backend setup
 */

// Include required files
require_once 'config/database.php';
require_once 'helpers/response.php';

// Test database connection
function testDatabaseConnection() {
    try {
        $database = new Database();
        $conn = $database->getConnection();

        if ($conn) {
            echo "✅ Database connection successful\n";

            // Test if users table exists
            $stmt = $conn->query("SHOW TABLES LIKE 'users'");
            if ($stmt->rowCount() > 0) {
                echo "✅ Users table exists\n";

                // Test if table has expected columns
                $stmt = $conn->query("DESCRIBE users");
                $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
                $required_columns = ['user_id', 'email', 'password_hash', 'first_name', 'last_name'];

                $missing_columns = array_diff($required_columns, $columns);
                if (empty($missing_columns)) {
                    echo "✅ Users table has all required columns\n";
                } else {
                    echo "❌ Missing columns: " . implode(', ', $missing_columns) . "\n";
                }
            } else {
                echo "❌ Users table does not exist\n";
            }

        } else {
            echo "❌ Database connection failed\n";
        }
    } catch (Exception $e) {
        echo "❌ Database error: " . $e->getMessage() . "\n";
    }
}

// Test PHP extensions
function testPHPExtensions() {
    $required_extensions = ['pdo', 'pdo_mysql', 'json', 'openssl'];

    foreach ($required_extensions as $ext) {
        if (extension_loaded($ext)) {
            echo "✅ PHP extension '{$ext}' is loaded\n";
        } else {
            echo "❌ PHP extension '{$ext}' is NOT loaded\n";
        }
    }
}

// Test file permissions
function testFilePermissions() {
    $files_to_check = [
        'config/database.php',
        'helpers/jwt.php',
        'helpers/response.php',
        'helpers/validator.php',
        'models/user.php',
        'auth/register.php',
        'auth/login.php'
    ];

    foreach ($files_to_check as $file) {
        if (file_exists($file) && is_readable($file)) {
            echo "✅ File '{$file}' exists and is readable\n";
        } else {
            echo "❌ File '{$file}' is missing or not readable\n";
        }
    }
}

// Run tests
echo "=== ZBB Intake API Test Results ===\n\n";

echo "Testing PHP Extensions:\n";
testPHPExtensions();

echo "\nTesting File Permissions:\n";
testFilePermissions();

echo "\nTesting Database Connection:\n";
testDatabaseConnection();

echo "\n=== Test Complete ===\n";

// If running from web browser, format as JSON
if (isset($_SERVER['HTTP_HOST'])) {
    ob_clean();
    Response::success('API test completed', [
        'php_version' => PHP_VERSION,
        'server_info' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}
?>
