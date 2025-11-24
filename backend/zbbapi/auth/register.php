<?php
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
require_once '../cors.php';

// Include required files
require_once '../helpers/response.php';
require_once '../helpers/validator.php';
require_once '../models/user.php';
require_once '../config/database.php'; // Make sure this creates $conn

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

$allowed_categories = ['admin', 'zbb', 'enduser'];
if (!in_array($userCategory, $allowed_categories)) {
    $userCategory = 'enduser';
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
        'user_category' => $userCategory
    ];

    // Create the user
    $user_id = $user->create($userData);
    if ($user_id) {
        // Get database connection from User class
        $conn = $user->getConnection();

        // Check if database connection exists
        if (!$conn) {
            error_log("Database connection not available from User class");
            Response::error('Database connection error', 500);
        }

        // Initialize estate intake tables BEFORE sending response
        try {
            initializeEstateIntake($conn, $user_id);
            error_log("Estate intake tables initialized for user_id: " . $user_id);
        } catch (Exception $e) {
            error_log("Error initializing estate intake: " . $e->getMessage());
            // Continue anyway - user was created successfully
        }

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

function initializeEstateIntake($conn, $portal_user_id) {
    try {
        // 1. Insert into client table
        $stmt = $conn->prepare("INSERT INTO client (portal_user_id, client_id, status, completion_percentage, assigned_attorney_id, referral_source)
                                VALUES (:portal_user_id, :portal_user_id, NULL, 0, NULL, NULL)");
        $stmt->bindParam(':portal_user_id', $portal_user_id, PDO::PARAM_INT);

        if (!$stmt->execute()) {
            throw new Exception("Failed to insert into client table");
        }

        // Get the client_id that was just created
        $client_id = $conn->lastInsertId();

        // 2. Insert into guardianship_preferences
        $stmt = $conn->prepare("INSERT INTO guardianship_preferences (portal_user_id, minor_children, guardianship_needed, guardian_name, alternate_guardian_name, special_needs_trust)
                                VALUES (:client_id, 0, 0, NULL, NULL, 0)");
        $stmt->bindParam(':client_id', $client_id, PDO::PARAM_INT);

        if (!$stmt->execute()) {
            throw new Exception("Failed to insert into guardianship_preferences");
        }

        // 3. Insert into marital_info
        $stmt = $conn->prepare("INSERT INTO marital_info (portal_user_id, marital_status, spouse_first_name, spouse_middle_name, spouse_last_name, spouse_suffix, marriage_date, first_marriage, previous_marriages_count, prenup_exists, prenup_location, postnup_exists, postnup_location, spouse_has_other_children, spouse_other_children_names, community_property_state)
                                VALUES (:client_id, 'single', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL)");
        $stmt->bindParam(':client_id', $client_id, PDO::PARAM_INT);

        if (!$stmt->execute()) {
            throw new Exception("Failed to insert into marital_info");
        }

        // 4. Insert into personal
        $stmt = $conn->prepare("INSERT INTO personal (portal_user_id, citizenship_country, ssn, date_of_birth, address_line1, address_line2, city, state, zip_code, county, country, mailing_address_same, mailing_address_line1, mailing_address_line2, mailing_city, mailing_state, mailing_zip_code, mailing_county, mailing_country, preferred_contact_method, military_service, military_branch, military_service_dates, veteran_benefits)
                                VALUES (:client_id, 'USA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'email', 0, NULL, NULL, NULL)");
        $stmt->bindParam(':client_id', $client_id, PDO::PARAM_INT);

        if (!$stmt->execute()) {
            throw new Exception("Failed to insert into personal");
        }

        // 5. Insert into charities (empty record to establish relationship)
        $stmt = $conn->prepare("INSERT INTO charity (portal_user_id, charity_name, charity_percentage, charity_specific_amount, charity_type)
                                VALUES (:client_id, NULL, NULL, NULL, NULL)");
        $stmt->bindParam(':client_id', $client_id, PDO::PARAM_INT);

        if (!$stmt->execute()) {
            throw new Exception("Failed to insert into charities");
        }

        // 6. Insert into fiduciary (empty record to establish relationship)
        $stmt = $conn->prepare("INSERT INTO fiduciary (portal_user_id, role_type, first_name, middle_name, last_name, relationship, contact_info, notes)
                                VALUES (:client_id, NULL, NULL, NULL, NULL, NULL, NULL, NULL)");
        $stmt->bindParam(':client_id', $client_id, PDO::PARAM_INT);

        if (!$stmt->execute()) {
            throw new Exception("Failed to insert into fiduciary");
        }

        error_log("Successfully initialized all estate intake tables for client_id: " . $client_id);
        return true;

    } catch (Exception $e) {
        error_log("Error in initializeEstateIntake: " . $e->getMessage());
        throw $e;
    }
}
?>
