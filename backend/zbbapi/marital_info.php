<?php
require_once 'db.php';

// Helper: get JSON input
function getInput() {
    return json_decode(file_get_contents('php://input'), true);
}

// CREATE
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = getInput();
    $stmt = $conn->prepare("INSERT INTO marital_info (client_id, marital_status, spouse_legal_name, spouse_dob, spouse_ssn_encrypted, marriage_date, marriage_location, first_marriage, prenup_exists, prenup_document_id, postnup_exists, postnup_document_id, spouse_has_other_children, relationship_quality, divorce_obligations, divorce_decree_restrictions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("issssssiiiiiisss",
        $data['client_id'],
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
        $data['divorce_decree_restrictions']
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
    $stmt = $conn->prepare("UPDATE marital_info SET client_id=?, marital_status=?, spouse_legal_name=?, spouse_dob=?, spouse_ssn_encrypted=?, marriage_date=?, marriage_location=?, first_marriage=?, prenup_exists=?, prenup_document_id=?, postnup_exists=?, postnup_document_id=?, spouse_has_other_children=?, relationship_quality=?, divorce_obligations=?, divorce_decree_restrictions=? WHERE marital_id=?");
    $stmt->bind_param("issssssiiiiiiissi",
        $data['client_id'],
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
