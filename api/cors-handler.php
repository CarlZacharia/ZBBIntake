<?php
/**
 * Global CORS Preflight Handler
 * Place this file in your web root as cors-handler.php
 */

// Set all CORS headers
header('Access-Control-Allow-Origin: http://localhost:4200');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Max-Age: 86400');

// For OPTIONS requests, just return success
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    header('Content-Length: 0');
    exit();
}

// For all other requests, return a simple success message
header('Content-Type: application/json');
echo json_encode([
    'success' => true,
    'message' => 'CORS handler working',
    'method' => $_SERVER['REQUEST_METHOD'],
    'timestamp' => date('Y-m-d H:i:s')
]);
?>
