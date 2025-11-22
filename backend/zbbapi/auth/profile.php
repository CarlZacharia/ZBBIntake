<?php
/**
 * User Profile Endpoint
 * GET /api/auth/profile.php
 * Requires JWT authentication
 */

// Handle CORS first
require_once '../cors.php';

// Include required files
require_once '../helpers/response.php';
require_once '../helpers/jwt.php';
require_once '../models/user.php';

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Response::error('Method not allowed', 405);
}

try {
    // Get JWT token from header
    $jwt_token = JWT::getBearerToken();

    if (!$jwt_token) {
        Response::error('Access token is required', 401);
    }

    // Decode JWT token
    $decoded_token = JWT::decode($jwt_token);

    if (!isset($decoded_token['user_id'])) {
        Response::error('Invalid access token', 401);
    }

    // Create user instance
    $user = new User();

    // Get user data
    $userData = $user->findById($decoded_token['user_id']);

    if (!$userData) {
        Response::error('User not found', 404);
    }

    Response::success('Profile retrieved successfully', [
        'user' => $userData
    ]);

} catch (Exception $e) {
    error_log("Profile error: " . $e->getMessage());

    if (strpos($e->getMessage(), 'expired') !== false) {
        Response::error('Access token has expired', 401);
    } else if (strpos($e->getMessage(), 'Invalid') !== false) {
        Response::error('Invalid access token', 401);
    } else {
        Response::error('Authentication failed', 401);
    }
}
?>
