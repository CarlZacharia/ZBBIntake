<?php
// Load environment variables from .env manually
$env = parse_ini_file(__DIR__ . '/.env');
$host = $env['DB_HOST'];
$user = $env['DB_USER'];
$pass = $env['DB_PASSWORD'];
$dbname = $env['DB_NAME'];

$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
