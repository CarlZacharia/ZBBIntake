<?php
require_once 'db.php';

// Helper: get JSON input
function getInput() {
    return json_decode(file_get_contents('php://input'), true);
}

// CREATE
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = getInput();
    // Set defaults for each field if missing or null
    $portal_user_id = $data['portal_user_id'] ?? null;
    $marital_status = $data['marital_status'] ?? 'single';
    $spouse_legal_name = $data['spouse_legal_name'] ?? null;
    $spouse_dob = $data['spouse_dob'] ?? null;
    $spouse_ssn_encrypted = $data['spouse_ssn_encrypted'] ?? null;
    $marriage_date = $data['marriage_date'] ?? null;
    $marriage_location = $data['marriage_location'] ?? null;
    $first_marriage = $data['first_marriage'] ?? null; // 1 for true, 0 for false, or null
    $prenup_exists = $data['prenup_exists'] ?? null;
    $prenup_document_id = $data['prenup_document_id'] ?? null;
    $postnup_exists = $data['postnup_exists'] ?? null;
    $postnup_document_id = $data['postnup_document_id'] ?? null;
    $spouse_has_other_children = $data['spouse_has_other_children'] ?? null;
    $relationship_quality = $data['relationship_quality'] ?? null;
    $divorce_obligations = $data['divorce_obligations'] ?? null;
    $divorce_decree_restrictions = $data['divorce_decree_restrictions'] ?? null;

    $stmt = $conn->prepare("INSERT INTO marital_info (portal_user_id, marital_status, spouse_legal_name, spouse_dob, spouse_ssn_encrypted, marriage_date, marriage_location, first_marriage, prenup_exists, prenup_document_id, postnup_exists, postnup_document_id, spouse_has_other_children, relationship_quality, divorce_obligations, divorce_decree_restrictions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("isssssssssssssss",
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
    echo json_encode(['marital_id' => $stmt->insert_id]);
    $stmt->close();
}

// READ ALL
if ($_SERVER['REQUEST_METHOD'] === 'GET' && !isset($_GET['id'])) {
    $result = $conn->query("SELECT * FROM marital_info");
    $rows = [];
    while ($row = $result->fetch_assoc()) {
        $rows[] = $row;
    }
    echo json_encode($rows);
}

// READ ONE
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['id'])) {
    $id = intval($_GET['id']);
    $stmt = $conn->prepare("SELECT * FROM marital_info WHERE marital_id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    echo json_encode($result->fetch_assoc());
    $stmt->close();
}

// UPDATE
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = getInput();
    $id = intval($_GET['id']);
    $stmt = $conn->prepare("UPDATE marital_info SET portal_user_id=?, marital_status=?, spouse_legal_name=?, spouse_dob=?, spouse_ssn_encrypted=?, marriage_date=?, marriage_location=?, first_marriage=?, prenup_exists=?, prenup_document_id=?, postnup_exists=?, postnup_document_id=?, spouse_has_other_children=?, relationship_quality=?, divorce_obligations=?, divorce_decree_restrictions=? WHERE marital_id=?");
    $stmt->bind_param("isssssssssssssssi",
        $data['portal_user_id'],
        $data['marital_status'],
        $data['spouse_legal_name'],
        $data['spouse_dob'],
        $data['spouse_ssn_encrypted'],
        $data['marriage_date'],
        $data['marriage_location'],
        $data['first_marriage'],
        $data['prenup_exists'],
        $data['prenup_document_id'],
        $data['postnup_exists'],
        $data['postnup_document_id'],
        $data['spouse_has_other_children'],
        $data['relationship_quality'],
        $data['divorce_obligations'],
        $data['divorce_decree_restrictions'],
        $id
    );
    $stmt->execute();
    echo json_encode(['message' => 'Marital info updated']);
    $stmt->close();
}

// DELETE
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = intval($_GET['id']);
    $stmt = $conn->prepare("DELETE FROM marital_info WHERE marital_id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    echo json_encode(['message' => 'Marital info deleted']);
    $stmt->close();
}

$conn->close();
?>
