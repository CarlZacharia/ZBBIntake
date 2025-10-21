<?php
/**
 * Simple API Test Endpoint
 * GET /api/ping.php
 */

// Handle CORS first
require_once 'cors.php';
require_once 'helpers/response.php';

Response::success('API is working!', [
    'timestamp' => date('Y-m-d H:i:s'),
    'server' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
    'php_version' => PHP_VERSION,
    'method' => $_SERVER['REQUEST_METHOD']
]);
?>