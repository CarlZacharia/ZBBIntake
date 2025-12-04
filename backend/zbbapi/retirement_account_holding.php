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
        INSERT INTO retirement_account_holdings (
            portal_user_id, account_name, balance, account_type, institution_name, account_number_encrypted,
            approximate_value, primary_beneficiaries, contingent_beneficiaries, rmd_age_reached, ownership_form,
            notes, owned_by, has_bene
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->bind_param(
        "isssssdsssssss",
        $data['portal_user_id'],
        $data['account_name'],
        $data['balance'],
        $data['account_type'],
        $data['institution_name'],
        $data['account_number_encrypted'],
        $data['approximate_value'],
        $data['primary_beneficiaries'],
        $data['contingent_beneficiaries'],
        $data['rmd_age_reached'],
        $data['ownership_form'],
        $data['notes'],
        $data['owned_by'],
        $data['has_bene']
    );
    $stmt->execute();
    echo json_encode(['retirement_account_id' => $stmt->insert_id]);
    $stmt->close();
}

// READ ALL
if ($_SERVER['REQUEST_METHOD'] === 'GET' && !isset($_GET['id'])) {
    $result = $conn->query("SELECT * FROM retirement_account_holding");
    $rows = [];
    while ($row = $result->fetch_assoc()) {
        $rows[] = $row;
    }
    echo json_encode($rows);
}

// READ ONE
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['id'])) {
    $id = intval($_GET['id']);
    $stmt = $conn->prepare("SELECT * FROM retirement_account_holding WHERE retirement_account_id = ?");
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
        UPDATE retirement_account_holdings SET
            portal_user_id=?, account_name=?, balance=?, account_type=?, institution_name=?, account_number_encrypted=?,
            approximate_value=?, primary_beneficiaries=?, contingent_beneficiaries=?, rmd_age_reached=?, ownership_form=?,
            notes=?, owned_by=?, has_bene=?
        WHERE retirement_account_id=?
    ");
    $stmt->bind_param(
        "isssssdsssssssi",
        $data['portal_user_id'],
        $data['account_name'],
        $data['balance'],
        $data['account_type'],
        $data['institution_name'],
        $data['account_number_encrypted'],
        $data['approximate_value'],
        $data['primary_beneficiaries'],
        $data['contingent_beneficiaries'],
        $data['rmd_age_reached'],
        $data['ownership_form'],
        $data['notes'],
        $data['owned_by'],
        $data['has_bene'],
        $id
    );
    $stmt->execute();
    echo json_encode(['message' => 'Retirement account holdings updated']);
    $stmt->close();
}

// DELETE
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = intval($_GET['id']);
    $stmt = $conn->prepare("DELETE FROM retirement_account_holding WHERE retirement_account_id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    echo json_encode(['message' => 'Retirement account holding deleted']);
    $stmt->close();
}

$conn->close();
?>
