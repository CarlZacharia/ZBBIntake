<?php
/**
 * Database Schema Import Helper
 * Run this once to create the database tables
 */

require_once 'config/database.php';

try {
    $database = new Database();
    $conn = $database->getConnection();

    echo "<h2>Database Schema Import</h2>\n";

    // Read the schema file
    $schema_file = '../database/schema.sql';
    if (!file_exists($schema_file)) {
        echo "❌ Schema file not found: $schema_file<br>\n";
        echo "Please upload the database/schema.sql file to your server.<br>\n";
        exit;
    }

    $schema = file_get_contents($schema_file);
    if (!$schema) {
        echo "❌ Could not read schema file<br>\n";
        exit;
    }

    echo "✅ Schema file loaded<br>\n";

    // Split into individual statements
    $statements = array_filter(array_map('trim', explode(';', $schema)));

    $success_count = 0;
    $error_count = 0;

    foreach ($statements as $statement) {
        if (empty($statement) || strpos($statement, '--') === 0) {
            continue; // Skip empty lines and comments
        }

        try {
            $conn->exec($statement);
            $success_count++;

            // Extract table name for logging
            if (preg_match('/CREATE TABLE\s+`?(\w+)`?/i', $statement, $matches)) {
                echo "✅ Created table: " . $matches[1] . "<br>\n";
            }
        } catch (PDOException $e) {
            $error_count++;
            echo "❌ Error executing statement: " . $e->getMessage() . "<br>\n";
            echo "Statement: " . substr($statement, 0, 100) . "...<br>\n";
        }
    }

    echo "<hr>\n";
    echo "<strong>Import Summary:</strong><br>\n";
    echo "✅ Successful statements: $success_count<br>\n";
    echo "❌ Failed statements: $error_count<br>\n";

    if ($error_count === 0) {
        echo "<br><span style='color: green; font-size: 18px;'>🎉 Database schema imported successfully!</span><br>\n";
        echo "<p>You can now test user registration at: <a href='../'>your application</a></p>\n";
    } else {
        echo "<br><span style='color: orange;'>⚠️ Some statements failed. Check the errors above.</span><br>\n";
    }

    // Test if users table was created
    try {
        $stmt = $conn->query("DESCRIBE users");
        echo "<br>✅ Users table structure:<br>\n";
        echo "<table border='1' cellpadding='5'>\n";
        echo "<tr><th>Column</th><th>Type</th><th>Key</th></tr>\n";
        while ($row = $stmt->fetch()) {
            echo "<tr><td>{$row['Field']}</td><td>{$row['Type']}</td><td>{$row['Key']}</td></tr>\n";
        }
        echo "</table>\n";
    } catch (PDOException $e) {
        echo "❌ Could not verify users table: " . $e->getMessage() . "<br>\n";
    }

} catch (Exception $e) {
    echo "❌ Database connection failed: " . $e->getMessage() . "<br>\n";
    echo "Please check your database credentials in config/database.php<br>\n";
}
?>
