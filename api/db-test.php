<?php
/**
 * Database Connection Test and Setup Helper
 * Run this to test database connectivity and get setup instructions
 */

// Database configuration
$host = 'localhost';
$port = 3306;
$db_name = 'zbpcahos_zbplans';
$username = 'zbpcahos_zbplansuser';
$password = 'ZB3ld3rl@w!';

echo "<h2>ZBB Intake Database Connection Test</h2>\n";

// Test 1: Check if we can connect to MySQL server at all
echo "<h3>Test 1: MySQL Server Connection</h3>\n";
try {
    $dsn = "mysql:host=$host;port=$port;charset=utf8mb4";
    $pdo = new PDO($dsn, 'root', ''); // Try with root user first
    echo "✅ Successfully connected to MySQL server<br>\n";
    $pdo = null;
} catch (PDOException $e) {
    echo "❌ Cannot connect to MySQL server: " . $e->getMessage() . "<br>\n";
    echo "<strong>Solution:</strong> Make sure MySQL/MariaDB is running<br>\n";
}

// Test 2: Check if database exists
echo "<h3>Test 2: Database Existence</h3>\n";
try {
    $dsn = "mysql:host=$host;port=$port;charset=utf8mb4";
    $pdo = new PDO($dsn, 'root', ''); // Using root to check

    $stmt = $pdo->query("SHOW DATABASES LIKE '$db_name'");
    if ($stmt->rowCount() > 0) {
        echo "✅ Database '$db_name' exists<br>\n";
    } else {
        echo "❌ Database '$db_name' does not exist<br>\n";
        echo "<strong>Solution:</strong> Create the database first<br>\n";
    }
    $pdo = null;
} catch (PDOException $e) {
    echo "❌ Cannot check database: " . $e->getMessage() . "<br>\n";
}

// Test 3: Check if user exists and can connect
echo "<h3>Test 3: User Connection (without database)</h3>\n";
try {
    $dsn = "mysql:host=$host;port=$port;charset=utf8mb4";
    $pdo = new PDO($dsn, $username, $password);
    echo "✅ User '$username' can connect to MySQL server<br>\n";

    // Check what databases this user can see
    try {
        $stmt = $pdo->query("SHOW DATABASES");
        echo "<strong>Databases accessible to user '$username':</strong><br>\n";
        while ($row = $stmt->fetch()) {
            $dbname = $row['Database'];
            echo "- $dbname<br>\n";

            // Check if this is our target database
            if (strpos($dbname, 'zbplans') !== false) {
                echo "  <span style='color: green;'>👆 This looks like our database!</span><br>\n";
            }
        }
    } catch (PDOException $e) {
        echo "❌ Cannot list databases: " . $e->getMessage() . "<br>\n";
    }

    $pdo = null;
} catch (PDOException $e) {
    echo "❌ Cannot connect with user '$username': " . $e->getMessage() . "<br>\n";
    echo "<strong>Solution:</strong> User credentials are wrong<br>\n";
}

echo "<h3>Test 4: User Connection (with database)</h3>\n";
try {
    $dsn = "mysql:host=$host;port=$port;dbname=$db_name;charset=utf8mb4";
    $pdo = new PDO($dsn, $username, $password);
    echo "✅ Successfully connected with user '$username' to database '$db_name'<br>\n";

    // Test if we can query the users table
    try {
        $stmt = $pdo->query("SHOW TABLES LIKE 'users'");
        if ($stmt->rowCount() > 0) {
            echo "✅ Users table exists<br>\n";
        } else {
            echo "❌ Users table does not exist<br>\n";
            echo "<strong>Solution:</strong> Run the database schema script<br>\n";

            // Show what tables do exist
            try {
                $stmt = $pdo->query("SHOW TABLES");
                $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
                if (count($tables) > 0) {
                    echo "<strong>Existing tables in '$db_name':</strong> " . implode(', ', $tables) . "<br>\n";
                } else {
                    echo "<strong>Database '$db_name' is empty</strong><br>\n";
                }
            } catch (PDOException $e) {
                echo "Cannot list tables: " . $e->getMessage() . "<br>\n";
            }
        }
    } catch (PDOException $e) {
        echo "❌ Cannot access users table: " . $e->getMessage() . "<br>\n";
    }

    $pdo = null;
} catch (PDOException $e) {
    echo "❌ Cannot connect to database '$db_name' with user '$username': " . $e->getMessage() . "<br>\n";
    echo "<strong>Solution:</strong> Database doesn't exist or user lacks permissions<br>\n";
}

// Display SQL commands to create database and user
echo "<h3>Database Setup Commands</h3>\n";
echo "<p>If the tests above failed, run these SQL commands as MySQL root user:</p>\n";
echo "<pre>\n";
echo "-- 1. Create the database\n";
echo "CREATE DATABASE IF NOT EXISTS $db_name;\n\n";

echo "-- 2. Create the user (try different host options)\n";
echo "CREATE USER '$username'@'localhost' IDENTIFIED BY '$password';\n";
echo "CREATE USER '$username'@'%' IDENTIFIED BY '$password';\n\n";

echo "-- 3. Grant permissions\n";
echo "GRANT ALL PRIVILEGES ON $db_name.* TO '$username'@'localhost';\n";
echo "GRANT ALL PRIVILEGES ON $db_name.* TO '$username'@'%';\n\n";

echo "-- 4. Refresh privileges\n";
echo "FLUSH PRIVILEGES;\n\n";

echo "-- 5. Verify user creation\n";
echo "SELECT User, Host FROM mysql.user WHERE User = '$username';\n";
echo "</pre>\n";

echo "<h3>Hosting Provider Troubleshooting</h3>\n";
echo "<p><strong>Based on your error pattern, here's what to check:</strong></p>\n";
echo "<ol>\n";
echo "<li><strong>In your hosting control panel (cPanel/Plesk):</strong><br>\n";
echo "   - Go to MySQL Databases section<br>\n";
echo "   - Verify database 'zbpcahos_zbplans' exists<br>\n";
echo "   - Verify user 'zbpcahos_zbplansuser' exists<br>\n";
echo "   - <strong>IMPORTANT:</strong> Make sure the user is assigned to the database!<br>\n";
echo "   - Look for 'Add User to Database' or similar option</li>\n";
echo "<li><strong>Check database name variations:</strong><br>\n";
echo "   - Try: zbpcahos_zbplans<br>\n";
echo "   - Try: zbplans (without prefix)<br>\n";
echo "   - Check if there's a different prefix</li>\n";
echo "<li><strong>Alternative database names to try:</strong><br>\n";

// Test common database name patterns
$db_patterns = [
    'zbplans',
    'zbpcahos_zbplans',
    'zbpcahoscom_zbplans',
    $username . '_zbplans'
];

foreach ($db_patterns as $test_db) {
    echo "   - $test_db<br>\n";
}

echo "</ol>\n";

// Display alternative credentials to try
echo "<h3>Alternative Configuration</h3>\n";
echo "<p>If you're using a hosting provider, you might need to:</p>\n";
echo "<ul>\n";
echo "<li>Use a different host (not 'localhost')</li>\n";
echo "<li>Use your hosting provider's database credentials</li>\n";
echo "<li>Use a database prefix (like youruser_zbplans)</li>\n";
echo "</ul>\n";

echo "<p><strong>Common hosting patterns:</strong></p>\n";
echo "<pre>\n";
echo "// For shared hosting\n";
echo "private \$host = 'localhost'; // or your DB host\n";
echo "private \$db_name = 'youraccount_zbplans';\n";
echo "private \$username = 'youraccount_zbplansuser';\n";
echo "private \$password = 'your_actual_password';\n";
echo "</pre>\n";

// Test JSON response capability
if (isset($_GET['json'])) {
    header('Content-Type: application/json');
    echo json_encode([
        'test_completed' => true,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}
?>
