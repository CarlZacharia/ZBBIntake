<?php
require_once 'db.php';

// Helper: get JSON input
function getInput() {
    return json_decode(file_get_contents('php://input'), true);
}

// CREATE
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = getInput();
    $stmt = $conn->prepare("
        INSERT INTO nq_account_holdings (
            portal_user_id, account_name, balance, institution_name, account_type, account_number_encrypted,
            approximate_value, joint_owner_name, primary_beneficiaries, contingent_beneficiaries, ownership_form,
            notes, owned_by, ownership_percentage, other_owners
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->bind_param(
        "issssdsissssssss",
        $data['portal_user_id'],
        $data['account_name'],
        $data['balance'],
        $data['institution_name'],
        $data['account_type'],
        $data['account_number_encrypted'],
        $data['approximate_value'],
        $data['joint_owner_name'],
        $data['primary_beneficiaries'],
        $data['contingent_beneficiaries'],
        $data['ownership_form'],
        $data['notes'],
        $data['owned_by'],
        $data['ownership_percentage'],
        $data['other_owners']
    );
    $stmt->execute();
    echo json_encode(['nq_account_id' => $stmt->insert_id]);
    $stmt->close();
}

// READ ALL
if ($_SERVER['REQUEST_METHOD'] === 'GET' && !isset($_GET['id'])) {
    $result = $conn->query("SELECT * FROM nq_account_holding");
    $rows = [];
    while ($row = $result->fetch_assoc()) {
        $rows[] = $row;
    }
    echo json_encode($rows);
}

// READ ONE
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['id'])) {
    $id = intval($_GET['id']);
    $stmt = $conn->prepare("SELECT * FROM nq_account_holding WHERE nq_account_id = ?");
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
    $stmt = $conn->prepare("
        UPDATE nq_account_holdings SET
            portal_user_id=?, account_name=?, balance=?, institution_name=?, account_type=?, account_number_encrypted=?,
            approximate_value=?, joint_owner_name=?, primary_beneficiaries=?, contingent_beneficiaries=?, ownership_form=?,
            notes=?, owned_by=?, ownership_percentage=?, other_owners=?
        WHERE nq_account_id=?
    ");
    $stmt->bind_param(
        "issssdsissssssssi",
        $data['portal_user_id'],
        $data['account_name'],
        $data['balance'],
        $data['institution_name'],
        $data['account_type'],
        $data['account_number_encrypted'],
        $data['approximate_value'],
        $data['joint_owner_name'],
        $data['primary_beneficiaries'],
        $data['contingent_beneficiaries'],
        $data['ownership_form'],
        $data['notes'],
        $data['owned_by'],
        $data['ownership_percentage'],
        $data['other_owners'],
        $id
    );
    $stmt->execute();
    echo json_encode(['message' => 'NQ account holdings updated']);
    $stmt->close();
}

// DELETE
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = intval($_GET['id']);
    $stmt = $conn->prepare("DELETE FROM nq_account_holding WHERE nq_account_id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    echo json_encode(['message' => 'NQ account holding deleted']);
    $stmt->close();
}

$conn->close();
?>
