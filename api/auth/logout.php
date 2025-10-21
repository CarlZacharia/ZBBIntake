<?php
/**
 * Logout Endpoint
 * POST /api/auth/logout.php
 * Note: With JWT, logout is typically handled on the client side by removing the token
 * This endpoint can be used for logging/tracking purposes
 */

// Handle CORS first
require_once '../cors.php';

// Include required files
require_once '../helpers/response.php';
require_once '../helpers/jwt.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Method not allowed', 405);
}

try {
    // Get JWT token from header (optional for logout)
    $jwt_token = JWT::getBearerToken();

    if ($jwt_token) {
        // Decode token to get user info for logging
        try {
            $decoded_token = JWT::decode($jwt_token);
            $user_id = $decoded_token['user_id'] ?? null;

            // Log the logout event
            error_log("User logout: User ID " . $user_id . " logged out at " . date('Y-m-d H:i:s'));

        } catch (Exception $e) {
            // Token might be expired or invalid, but that's okay for logout
            error_log("Logout with invalid/expired token: " . $e->getMessage());
        }
    }

    Response::success('Logged out successfully', [
        'message' => 'Please remove the token from client storage'
    ]);

} catch (Exception $e) {
    error_log("Logout error: " . $e->getMessage());
    Response::error('An error occurred during logout', 500);
}
?>
