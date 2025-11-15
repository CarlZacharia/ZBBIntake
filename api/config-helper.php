<?php
/**
 * Database Configuration Helper
 * Helps determine the correct database settings for your hosting environment
 */

// Common hosting database configurations to try
$configs_to_test = [
    [
        'name' => 'Local Development (XAMPP/WAMP)',
        'host' => 'localhost',
        'username' => 'root',
        'password' => '',
        'db_name' => 'zbbintake'
    ],
    [
        'name' => 'Local Development (Custom)',
        'host' => 'localhost',
        'username' => 'zbbintakeuser',
        'password' => 'zbbShakur~94',
        'db_name' => 'zbbintake'
    ],
    [
        'name' => 'Shared Hosting (cPanel style)',
        'host' => 'localhost',
        'username' => 'zbbintake_user', // Common pattern: accountname_username
        'password' => 'zbbShakur~94',
        'db_name' => 'zbbintake_zbbintake' // Common pattern: accountname_dbname
    ],
    [
        'name' => 'Remote Database',
        'host' => 'zbbintake.com', // Or your actual DB host
        'username' => 'zbbintakeuser',
        'password' => 'zbbShakur~94',
        'db_name' => 'zbbintake'
    ]
];

echo "<h2>Database Configuration Helper</h2>\n";
echo "<p>Testing different database configurations for zbbintake.com...</p>\n";

foreach ($configs_to_test as $index => $config) {
    echo "<h3>Config " . ($index + 1) . ": " . $config['name'] . "</h3>\n";
    echo "<strong>Settings:</strong><br>\n";
    echo "Host: " . $config['host'] . "<br>\n";
    echo "Database: " . $config['db_name'] . "<br>\n";
    echo "Username: " . $config['username'] . "<br>\n";
    echo "Password: " . str_repeat('*', strlen($config['password'])) . "<br>\n";

    try {
        $dsn = "mysql:host=" . $config['host'] . ";dbname=" . $config['db_name'] . ";charset=utf8mb4";
        $pdo = new PDO($dsn, $config['username'], $config['password'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_TIMEOUT => 5 // 5 second timeout
        ]);

        echo "<span style='color: green;'>✅ CONNECTION SUCCESSFUL!</span><br>\n";

        // Test if we can create a simple table
        try {
            $pdo->exec("CREATE TEMPORARY TABLE test_table (id INT PRIMARY KEY)");
            echo "<span style='color: green;'>✅ Can create tables</span><br>\n";
        } catch (PDOException $e) {
            echo "<span style='color: orange;'>⚠️ Limited permissions: " . $e->getMessage() . "</span><br>\n";
        }

        // If this config works, show the PHP code to use
        echo "<strong>✅ Use this configuration in database.php:</strong><br>\n";
        echo "<pre>\n";
        echo "private \$host = '" . $config['host'] . "';\n";
        echo "private \$db_name = '" . $config['db_name'] . "';\n";
        echo "private \$username = '" . $config['username'] . "';\n";
        echo "private \$password = '" . $config['password'] . "';\n";
        echo "</pre>\n";

        $pdo = null;
        break; // Stop testing once we find a working config

    } catch (PDOException $e) {
        echo "<span style='color: red;'>❌ Connection failed: " . $e->getMessage() . "</span><br>\n";
    }

    echo "<hr>\n";
}

// Instructions for hosting providers
echo "<h3>If none of the above work:</h3>\n";
echo "<ol>\n";
echo "<li><strong>Check your hosting control panel</strong> for database information</li>\n";
echo "<li><strong>Look for:</strong> Database host, database name, username, password</li>\n";
echo "<li><strong>Common locations:</strong> cPanel → MySQL Databases, Plesk → Databases</li>\n";
echo "<li><strong>Contact your hosting provider</strong> if you can't find database credentials</li>\n";
echo "</ol>\n";

echo "<h3>For zbbintake.com specifically:</h3>\n";
echo "<p>Since this is running on zbbintake.com, you likely need to:</p>\n";
echo "<ul>\n";
echo "<li>Log into your hosting control panel (cPanel, Plesk, etc.)</li>\n";
echo "<li>Find the MySQL/Database section</li>\n";
echo "<li>Create a database named 'zbbintake' (or similar)</li>\n";
echo "<li>Create a database user with full permissions to that database</li>\n";
echo "<li>Import the schema.sql file to create the tables</li>\n";
echo "</ul>\n";
?>
