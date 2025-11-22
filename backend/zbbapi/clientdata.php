<?php
require_once 'db.php';

// Helper: get client_id from GET or POST
$client_id = intval($_GET['id'] ?? $_POST['client_id'] ?? 0);
if (!$client_id) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing client_id']);
    exit;
}

// Query each table for this client
$client = $conn->query("SELECT * FROM client WHERE client_id = $client_id")->fetch_assoc();
$personal = $conn->query("SELECT * FROM personal WHERE client_id = $client_id")->fetch_assoc();
$marital_info = $conn->query("SELECT * FROM marital_info WHERE client_id = $client_id")->fetch_assoc();
$children = $conn->query("SELECT * FROM child WHERE client_id = $client_id")->fetch_all(MYSQLI_ASSOC);
$family_members = $conn->query("SELECT * FROM family_member WHERE client_id = $client_id")->fetch_all(MYSQLI_ASSOC);
$charities = $conn->query("SELECT * FROM charity WHERE client_id = $client_id")->fetch_all(MYSQLI_ASSOC);
$fiduciaries = $conn->query("SELECT * FROM fiduciary WHERE client_id = $client_id")->fetch_all(MYSQLI_ASSOC);
$guardian_preferences = $conn->query("SELECT * FROM guardianship_preferences WHERE client_id = $client_id")->fetch_assoc();
$debts = $conn->query("SELECT * FROM debt WHERE client_id = $client_id")->fetch_all(MYSQLI_ASSOC);

// For assets, combine multiple tables
$assets = [
    'real_estate_holdings' => $conn->query("SELECT * FROM real_estate_holding WHERE client_id = $client_id")->fetch_all(MYSQLI_ASSOC),
    'bank_account_holdings' => $conn->query("SELECT * FROM bank_account_holding WHERE client_id = $client_id")->fetch_all(MYSQLI_ASSOC),
    'nq_account_holdings' => $conn->query("SELECT * FROM nq_account_holding WHERE client_id = $client_id")->fetch_all(MYSQLI_ASSOC),
    'retirement_account_holdings' => $conn->query("SELECT * FROM retirement_account_holdings WHERE client_id = $client_id")->fetch_all(MYSQLI_ASSOC),
    'life_insurance_holdings' => $conn->query("SELECT * FROM life_insurance_holding WHERE client_id = $client_id")->fetch_all(MYSQLI_ASSOC),
    'business_interest_holdings' => $conn->query("SELECT * FROM business_interest_holding WHERE client_id = $client_id")->fetch_all(MYSQLI_ASSOC),
    'digital_asset_holdings' => $conn->query("SELECT * FROM digital_asset_holding WHERE client_id = $client_id")->fetch_all(MYSQLI_ASSOC),
    'other_asset_holdings' => $conn->query("SELECT * FROM other_asset_holding WHERE client_id = $client_id")->fetch_all(MYSQLI_ASSOC)
];

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
    'guardian_preferences' => $guardian_preferences,
    'assets' => $assets,
    'debts' => $debts
]);
