<?php
/**
 * User Login Endpoint
 * POST /api/auth/login.php
 */

// Handle CORS first
require_once '../cors.php';

// Include required files
require_once '../helpers/response.php';
require_once '../helpers/validator.php';
require_once '../helpers/jwt.php';
require_once '../models/user.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Method not allowed', 405);
}

// Get POST data
$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
$required_fields = ['email', 'password'];
$validation_errors = Validator::validateRequired($input, $required_fields);

if (!empty($validation_errors)) {
    Response::error('Validation failed', 400, $validation_errors);
}

// Extract and sanitize input
$email = Validator::sanitize($input['email']);
$password = $input['password'];

// Additional validation
$errors = [];

// Validate email format
if (!Validator::isValidEmail($email)) {
    $errors[] = 'Please enter a valid email address';
}

if (empty($password)) {
    $errors[] = 'Password is required';
}

if (!empty($errors)) {
    Response::error('Validation failed', 400, $errors);
}

try {
    // Create user instance
    $user = new User();

    // Find user by email
    $userData = $user->findByEmail($email);

    if (!$userData) {
        Response::error('Invalid email or password', 401);
    }

    // Verify password
    if (!$user->verifyPassword($password, $userData['password_hash'])) {
        Response::error('Invalid email or password', 401);
    }

    // Check if account is active
    if (!$userData['is_active']) {
        Response::error('Account is deactivated. Please contact support.', 403);
    }

    // Update last login
    $user->updateLastLogin($userData['user_id']);

    // Remove sensitive data
    unset($userData['password_hash']);

    // Create JWT payload
    $jwt_payload = [
        'user_id' => $userData['user_id'],
        'email' => $userData['email'],
        'first_name' => $userData['first_name'],
        'last_name' => $userData['last_name']
    ];

    // Generate JWT token
    $jwt_token = JWT::encode($jwt_payload);

    // Prepare response data
    $response_data = [
        'user' => $userData,
        'token' => $jwt_token,
        'expires_in' => 86400 // 24 hours in seconds
    ];

    Response::success('Login successful', $response_data);

} catch (Exception $e) {
    error_log("Login error: " . $e->getMessage());
    Response::error('An error occurred during login. Please try again.', 500);
}
?>
