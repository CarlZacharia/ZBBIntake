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
    $stmt = $db->prepare("UPDATE provider_contacts SET
        name_encrypted = :name_encrypted,
        address_encrypted = :address_encrypted,
        csz_encrypted = :csz_encrypted,
        county_encrypted = :county_encrypted,
        email_encrypted = :email_encrypted,
        telephone_encrypted = :telephone_encrypted
        WHERE contact_id = 1 -- TODO: Use actual contact_id or provider identifier
    ");
    $stmt->execute([
        ':provider_name_encrypted' => enc($input['providerName'] ?? null),
        ':provider_type_encrypted' => enc($input['providerType'] ?? null),
        ':address_encrypted' => enc($input['providerAddress'] ?? null),
        ':csz_encrypted' => enc($input['providerCsz'] ?? null),
        ':county_encrypted' => enc($input['providerCounty'] ?? null),
        ':email_encrypted' => enc($input['providerEmail'] ?? null),
        ':telephone_encrypted' => enc($input['providerPhone'] ?? null)
    ]);
    echo json_encode(['success' => true]);
    exit;
}

if ($method === 'GET') {
    $stmt = $db->prepare("SELECT name_encrypted, address_encrypted, csz_encrypted, county_encrypted, email_encrypted, telephone_encrypted FROM provider_contacts WHERE contact_id = 1");
    $stmt->execute();
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    echo json_encode([
        'providerName' => dec($row['provider_name_encrypted'] ?? null),
        'providerType' => dec($row['provider_type_encrypted'] ?? null),
        'providerAddress' => dec($row['address_encrypted'] ?? null),
        'providerCsz' => dec($row['csz_encrypted'] ?? null),
        'providerCounty' => dec($row['county_encrypted'] ?? null),
        'providerEmail' => dec($row['email_encrypted'] ?? null),
        'providerPhone' => dec($row['telephone_encrypted'] ?? null),
        'providerContact' => dec($row['name_encrypted'] ?? null)
    ]);
    exit;
}

echo json_encode(['error' => 'Unsupported method']);
http_response_code(405);
