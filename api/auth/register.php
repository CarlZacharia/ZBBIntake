<?php
/**
 * User Registration Endpoint
 * POST /api/auth/register.php
 */

// Handle CORS first
require_once '../cors.php';

// Include required files
require_once '../helpers/response.php';
require_once '../helpers/validator.php';
require_once '../models/user.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Method not allowed', 405);
}

// Get POST data
$input = json_decode(file_get_contents('php://input'), true);

// Debug logging - remove in production
error_log("Registration data received: " . json_encode($input));

// Validate required fields
$required_fields = ['email', 'password', 'confirmPassword', 'firstName', 'lastName'];
$validation_errors = Validator::validateRequired($input, $required_fields);

if (!empty($validation_errors)) {
    error_log("Validation errors: " . json_encode($validation_errors));
    Response::error('Validation failed', 400, $validation_errors);
}

// Extract and sanitize input
$email = Validator::sanitize($input['email']);
$password = $input['password'];
$confirmPassword = $input['confirmPassword'];
$firstName = Validator::sanitize($input['firstName']);
$middleName = isset($input['middleName']) ? Validator::sanitize($input['middleName']) : null;
$lastName = Validator::sanitize($input['lastName']);
$suffix = isset($input['suffix']) ? Validator::sanitize($input['suffix']) : null;
$phone = isset($input['phone']) ? Validator::sanitize($input['phone']) : null;
$preferredContact = isset($input['preferredContactMethod']) ? $input['preferredContactMethod'] : 'email';
$userCategory = isset($input['userCategory']) ? strtolower(trim($input['userCategory'])) : 'enduser';
$facilityName = isset($input['facilityName']) ? Validator::sanitize($input['facilityName']) : null;

// Additional validation
$errors = [];

// Validate email format
if (!Validator::isValidEmail($email)) {
    $errors[] = 'Please enter a valid email address';
}

// Validate password
if (!Validator::isValidPassword($password)) {
    $errors[] = 'Password must be at least 6 characters long';
}

// Check if passwords match
if ($password !== $confirmPassword) {
    $errors[] = 'Passwords do not match';
}

// Validate names
if (!Validator::isValidName($firstName)) {
    $errors[] = 'First name contains invalid characters';
}

if (!Validator::isValidName($lastName)) {
    $errors[] = 'Last name contains invalid characters';
}

if ($middleName && !Validator::isValidName($middleName)) {
    $errors[] = 'Middle name contains invalid characters';
}

// Validate phone if provided
if ($phone && !Validator::isValidPhone($phone)) {
    $errors[] = 'Please enter a valid 10-digit phone number';
}

// Validate preferred contact method
$allowed_contact_methods = ['email', 'phone', 'text'];
if (!in_array($preferredContact, $allowed_contact_methods)) {
    $errors[] = 'Invalid preferred contact method';
}

$allowed_categories = ['admin', 'zbb', 'enduser', 'facility'];
if (!in_array($userCategory, $allowed_categories)) {
    $userCategory = 'enduser';
}

if ($userCategory === 'facility' && empty($facilityName)) {
    $errors[] = 'Facility name is required for facility registrations';
}

if (!empty($errors)) {
    Response::error('Validation failed', 400, $errors);
}

try {
    // Create user instance
    $user = new User();

    // Check if email already exists
    if ($user->emailExists($email)) {
        Response::error('An account with this email address already exists', 409);
    }

    // Prepare user data
    $userData = [
        'email' => $email,
        'password_hash' => $user->hashPassword($password),
        'first_name' => $firstName,
        'middle_name' => $middleName,
        'last_name' => $lastName,
        'suffix' => $suffix,
        'phone' => $phone,
        'preferred_contact_method' => $preferredContact,
        'user_category' => $userCategory,
        'facility_name' => $facilityName
    ];

    // Create the user
    $user_id = $user->create($userData);

    if ($user_id) {
        // Get the created user data (without password)
        $newUser = $user->findById($user_id);

        Response::success('Account created successfully', [
            'user' => $newUser,
            'message' => 'Please check your email to verify your account'
        ], 201);
    } else {
        Response::error('Failed to create account. Please try again.', 500);
    }

} catch (Exception $e) {
    error_log("Registration error: " . $e->getMessage());
    Response::error('An error occurred during registration. Please try again.', 500);
}
?>
