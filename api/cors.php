<?php
/**
 * CORS Handler
 * Handle all CORS preflight requests
 */

// Set CORS headers for all requests
header('Access-Control-Allow-Origin: http://localhost:4200');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Max-Age: 86400'); // Cache preflight for 24 hours

// Prevent any redirects for OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    header('Content-Length: 0');
    exit(0);
}

// Ensure no output before this point that could cause redirects
ob_start();
?>
