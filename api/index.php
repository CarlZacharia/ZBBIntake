<?php
/**
 * API Index File
 * Basic routing and API information
 */

// Include required files
require_once 'helpers/response.php';

// Handle CORS
Response::handleCORS();

// API Information
$api_info = [
    'name' => 'ZBB Intake API',
    'version' => '1.0.0',
    'description' => 'Estate Planning Intake System API',
    'endpoints' => [
        'auth' => [
            'POST /api/auth/register.php' => 'User registration',
            'POST /api/auth/login.php' => 'User login',
            'GET /api/auth/profile.php' => 'Get user profile (requires auth)',
            'POST /api/auth/logout.php' => 'User logout'
        ]
    ],
    'authentication' => 'Bearer JWT Token',
    'content_type' => 'application/json'
];

Response::success('ZBB Intake API', $api_info);
?>
