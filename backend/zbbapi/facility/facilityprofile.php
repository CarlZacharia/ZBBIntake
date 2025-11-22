<?php
require_once 'helpers/crypto.php';
require_once 'config/database.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$db = (new Database())->getConnection();

function enc($value) {
    return $value !== null && $value !== '' ? Crypto::encrypt($value) : null;
}

function dec($value) {
    return $value ? Crypto::decrypt($value) : null;
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $stmt = $db->prepare("UPDATE facility_contacts SET
        name_encrypted = :name_encrypted,
        address_encrypted = :address_encrypted,
        csz_encrypted = :csz_encrypted,
        county_encrypted = :county_encrypted,
        email_encrypted = :email_encrypted,
        telephone_encrypted = :telephone_encrypted
        WHERE contact_id = 1 -- TODO: Use actual contact_id or facility identifier
    ");
    $stmt->execute([
        ':provider_name_encrypted' => enc($input['providerName'] ?? null),
        ':provider_type_encrypted' => enc($input['providerType'] ?? null),
        ':address_encrypted' => enc($input['facilityAddress'] ?? null),
        ':csz_encrypted' => enc($input['facilityCsz'] ?? null),
        ':county_encrypted' => enc($input['facilityCounty'] ?? null),
        ':email_encrypted' => enc($input['facilityEmail'] ?? null),
        ':telephone_encrypted' => enc($input['facilityPhone'] ?? null)
    ]);
    echo json_encode(['success' => true]);
    exit;
}

if ($method === 'GET') {
    $stmt = $db->prepare("SELECT name_encrypted, address_encrypted, csz_encrypted, county_encrypted, email_encrypted, telephone_encrypted FROM facility_contacts WHERE contact_id = 1");
    $stmt->execute();
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    echo json_encode([
        'providerName' => dec($row['provider_name_encrypted'] ?? null),
        'providerType' => dec($row['provider_type_encrypted'] ?? null),
        'facilityAddress' => dec($row['address_encrypted'] ?? null),
        'facilityCsz' => dec($row['csz_encrypted'] ?? null),
        'facilityCounty' => dec($row['county_encrypted'] ?? null),
        'facilityEmail' => dec($row['email_encrypted'] ?? null),
        'facilityPhone' => dec($row['telephone_encrypted'] ?? null),
        'facilityContact' => dec($row['name_encrypted'] ?? null)
    ]);
    exit;
}

echo json_encode(['error' => 'Unsupported method']);
http_response_code(405);
