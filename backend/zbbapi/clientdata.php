<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Access-Control-Allow-Origin: http://localhost:4200');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'db.php';

// Helper: get portal_user_id from GET or POST
$portal_user_id = intval($_GET['id'] ?? $_POST['portal_user_id'] ?? 0);
if (!$portal_user_id) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing portal_user_id']);
    exit;
}

// Query each table for this client
$client = $conn->query("SELECT * FROM client WHERE portal_user_id = $portal_user_id")->fetch_assoc();
if (!$client) {
    $portal_user_id = $portal_user_id; // or null if you want
    $client_id = $portal_user_id;
    $status = '';
    $completion_percentage = 0;
    $assigned_attorney_id = null;
    $office = null;
    $referral_source = '';
    $stmt = $conn->prepare("INSERT INTO client (portal_user_id, client_id, status, completion_percentage, assigned_attorney_id, office, referral_source) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("iisisss", $portal_user_id, $client_id, $status, $completion_percentage, $assigned_attorney_id, $office, $referral_source);
    $stmt->execute();
    $stmt->close();
}
$client = $conn->query("SELECT * FROM client WHERE portal_user_id = $portal_user_id")->fetch_assoc();


$personal = $conn->query("SELECT * FROM personal WHERE portal_user_id = $portal_user_id")->fetch_assoc();
if (!$personal) {
    $legal_first_name = '';
    $legal_middle_name = '';
    $legal_last_name = '';
    $suffix = '';
    $sex = '';
    $date_of_birth = null;
    $ssn_encrypted = '';
    $us_citizen = null;
    $address_line1 = '';
    $address_line2 = '';
    $city = '';
    $state = '';
    $zip = '';
    $citizenship_country = 'USA';
    $years_at_address = null;
    $mobile_phone = '';
    $home_phone = '';
    $email = '';
    $preferred_contact_method = 'email';
    $occupation = '';
    $employer_name = '';
    $employer_address = '';
    $military_service = 0;
    $military_branch = '';
    $military_service_dates = '';

    $stmt = $conn->prepare("INSERT INTO personal (
        portal_user_id,
        legal_first_name,
        legal_middle_name,
        legal_last_name,
        suffix,
        sex,
        date_of_birth,
        ssn_encrypted,
        us_citizen,
        address_line1,
        address_line2,
        city,
        state,
        zip,
        citizenship_country,
        years_at_address,
        mobile_phone,
        home_phone,
        email,
        preferred_contact_method,
        occupation,
        employer_name,
        employer_address,
        military_service,
        military_branch,
        military_service_dates
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

    $stmt->bind_param("isssssssissssssisssssssiss",
        $portal_user_id,
        $legal_first_name,
        $legal_middle_name,
        $legal_last_name,
        $suffix,
        $sex,
        $date_of_birth,
        $ssn_encrypted,
        $us_citizen,
        $address_line1,
        $address_line2,
        $city,
        $state,
        $zip,
        $citizenship_country,
        $years_at_address,
        $mobile_phone,
        $home_phone,
        $email,
        $preferred_contact_method,
        $occupation,
        $employer_name,
        $employer_address,
        $military_service,
        $military_branch,
        $military_service_dates
    );
    $stmt->execute();
    $stmt->close();
}
$personal = $conn->query("SELECT * FROM personal WHERE portal_user_id = $portal_user_id")->fetch_assoc();


$marital_info = $conn->query("SELECT * FROM marital_info WHERE portal_user_id = $portal_user_id")->fetch_assoc();
if (!$marital_info) {
    $marital_status = 'single';
    $spouse_legal_name = null;
    $spouse_dob = null;
    $spouse_ssn_encrypted = null;
    $marriage_date = null;
    $marriage_location = null;
    $first_marriage = 1;
    $prenup_exists = 0;
    $prenup_document_id = null;
    $postnup_exists = 0;
    $postnup_document_id = null;
    $spouse_has_other_children = 0;
    $relationship_quality = null;
    $divorce_obligations = null;
    $divorce_decree_restrictions = null;

    $stmt = $conn->prepare("INSERT INTO marital_info (
        portal_user_id,
        marital_status,
        spouse_legal_name,
        spouse_dob,
        spouse_ssn_encrypted,
        marriage_date,
        marriage_location,
        first_marriage,
        prenup_exists,
        prenup_document_id,
        postnup_exists,
        postnup_document_id,
        spouse_has_other_children,
        relationship_quality,
        divorce_obligations,
        divorce_decree_restrictions
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

    $stmt->bind_param("issssssiiiiiisss",
        $portal_user_id,
        $marital_status,
        $spouse_legal_name,
        $spouse_dob,
        $spouse_ssn_encrypted,
        $marriage_date,
        $marriage_location,
        $first_marriage,
        $prenup_exists,
        $prenup_document_id,
        $postnup_exists,
        $postnup_document_id,
        $spouse_has_other_children,
        $relationship_quality,
        $divorce_obligations,
        $divorce_decree_restrictions
    );
    $stmt->execute();
    $stmt->close();
}
$marital_info = $conn->query("SELECT * FROM marital_info WHERE portal_user_id = $portal_user_id")->fetch_assoc();


$guardianship_preferences = $conn->query("SELECT * FROM guardianship_preferences WHERE portal_user_id = $portal_user_id")->fetch_assoc();
if (!$guardianship_preferences) {
    $child_raising_values = null;
    $location_importance = null;
    $religious_upbringing_preferences = null;
    $education_priorities = null;
    $other_preferences = null;
    $stmt = $conn->prepare("INSERT INTO guardianship_preferences (portal_user_id, child_raising_values, location_importance, religious_upbringing_preferences, education_priorities, other_preferences) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("isssss", $portal_user_id, $child_raising_values, $location_importance, $religious_upbringing_preferences, $education_priorities, $other_preferences);
    $stmt->execute();
    $stmt->close();
}
$guardianship_preferences = $conn->query("SELECT * FROM guardianship_preferences WHERE portal_user_id = $portal_user_id")->fetch_assoc();


$children = $conn->query("SELECT * FROM child WHERE portal_user_id = $portal_user_id")->fetch_all(MYSQLI_ASSOC);
$family_members = $conn->query("SELECT * FROM family_member WHERE portal_user_id = $portal_user_id")->fetch_all(MYSQLI_ASSOC);
$charities = $conn->query("SELECT * FROM charity WHERE portal_user_id = $portal_user_id")->fetch_all(MYSQLI_ASSOC);
$fiduciaries = $conn->query("SELECT * FROM fiduciary WHERE portal_user_id = $portal_user_id")->fetch_all(MYSQLI_ASSOC);
$debts = $conn->query("SELECT * FROM debt WHERE portal_user_id = $portal_user_id")->fetch_all(MYSQLI_ASSOC);

for ($i = 0; $i < count($children); $i++) {
    $child_id = (int)$children[$i]['child_id'];
    $child_concerns = $conn->query(
        "SELECT concern_id FROM beneficiary_concern_assignments
         WHERE child_id = $child_id"
    )->fetch_all(MYSQLI_ASSOC);

    $children[$i]['concern_ids'] = array_map(function($row) {
        return (string)$row['concern_id'];
    }, $child_concerns);
}

// For assets, combine multiple tables
$assets = [
    'real_estate_holdings' => $conn->query("SELECT * FROM real_estate_holdings WHERE portal_user_id = $portal_user_id")->fetch_all(MYSQLI_ASSOC),
    'bank_account_holdings' => $conn->query("SELECT * FROM bank_account_holdings WHERE portal_user_id = $portal_user_id")->fetch_all(MYSQLI_ASSOC),
    'nq_account_holdings' => $conn->query("SELECT * FROM nq_account_holdings WHERE portal_user_id = $portal_user_id")->fetch_all(MYSQLI_ASSOC),
    'retirement_account_holdings' => $conn->query("SELECT * FROM retirement_account_holdings WHERE portal_user_id = $portal_user_id")->fetch_all(MYSQLI_ASSOC),
    'life_insurance_holdings' => $conn->query("SELECT * FROM life_insurance_holdings WHERE portal_user_id = $portal_user_id")->fetch_all(MYSQLI_ASSOC),
    'business_interest_holdings' => $conn->query("SELECT * FROM business_interest_holdings WHERE portal_user_id = $portal_user_id")->fetch_all(MYSQLI_ASSOC),
    'digital_asset_holdings' => $conn->query("SELECT * FROM digital_asset_holdings WHERE portal_user_id = $portal_user_id")->fetch_all(MYSQLI_ASSOC),
    'other_asset_holdings' => $conn->query("SELECT * FROM other_asset_holdings WHERE portal_user_id = $portal_user_id")->fetch_all(MYSQLI_ASSOC)
];

// --- Beneficiary Concerns and Categories ---
// 1. Load all categories
$categories = $conn->query("SELECT * FROM beneficiary_concern_categories ORDER BY category_name ASC")->fetch_all(MYSQLI_ASSOC);
// 2. Load all concerns
$concerns = $conn->query("SELECT * FROM beneficiary_concerns ORDER BY category_id ASC, concern_name ASC")->fetch_all(MYSQLI_ASSOC);
// 3. Load all assignments for this client
$assignments = $conn->query("SELECT concern_id FROM beneficiary_concern_assignments WHERE portal_user_id = $portal_user_id")->fetch_all(MYSQLI_ASSOC);
$assigned_ids = array_map(function($row) { return $row['concern_id']; }, $assignments);

// 4. Group concerns by category and mark assignment

$grouped_categories = array();
foreach ($categories as $cat) {
    $cat_id = $cat['id'];
    $cat_concerns = array();
    foreach ($concerns as $concern) {
        if ($concern['category_id'] == $cat_id) {
            $concern['assigned'] = in_array($concern['id'], $assigned_ids) ? true : false;
            $cat_concerns[] = $concern;
        }
    }
    $cat['concerns'] = $cat_concerns;
    $grouped_categories[] = $cat;
}

// Build and return the full IClientData structure
header('Content-Type: application/json');
echo json_encode([
    'client' => $client,
    'personal' => $personal,
    'marital_info' => $marital_info,
    'children' => $children,
    'family_members' => $family_members,
    'charities' => $charities,
    'fiduciaries' => $fiduciaries,
    'guardianship_preferences' => $guardianship_preferences,
    'assets' => $assets,
    'debts' => $debts,
    'beneficiary_concern_categories' => $grouped_categories
]);
