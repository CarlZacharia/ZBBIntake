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
        INSERT INTO life_insurance_holdings (
            portal_user_id, insurance_company, policy_type, policy_number, face_value, approximate_value, cash_value,
            primary_beneficiaries, contingent_beneficiaries, owned_by_trust, trust_name, annual_premium, ownership_form,
            notes, owned_by, ownership_percentage, other_owners, has_bene
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->bind_param(
        "isssddssisssssssss",
        $data['portal_user_id'],
        $data['insurance_company'],
        $data['policy_type'],
        $data['policy_number'],
        $data['face_value'],
        $data['approximate_value'],
        $data['cash_value'],
        $data['primary_beneficiaries'],
        $data['contingent_beneficiaries'],
        $data['owned_by_trust'],
        $data['trust_name'],
        $data['annual_premium'],
        $data['ownership_form'],
        $data['notes'],
        $data['owned_by'],
        $data['ownership_percentage'],
        $data['other_owners'],
        $data['has_bene']
    );
    $stmt->execute();
    echo json_encode(['life_insurance_id' => $stmt->insert_id]);
    $stmt->close();
}

// READ ALL
if ($_SERVER['REQUEST_METHOD'] === 'GET' && !isset($_GET['id'])) {
    $result = $conn->query("SELECT * FROM life_insurance_holding");
    $rows = [];
    while ($row = $result->fetch_assoc()) {
        $rows[] = $row;
    }
    echo json_encode($rows);
}

// READ ONE
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['id'])) {
    $id = intval($_GET['id']);
    $stmt = $conn->prepare("SELECT * FROM life_insurance_holdings WHERE life_insurance_id = ?");
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
        UPDATE life_insurance_holdings SET
            portal_user_id=?, insurance_company=?, policy_type=?, policy_number=?, face_value=?, approximate_value=?, cash_value=?,
            primary_beneficiaries=?, contingent_beneficiaries=?, owned_by_trust=?, trust_name=?, annual_premium=?, ownership_form=?,
            notes=?, owned_by=?, ownership_percentage=?, other_owners=?, has_bene=?
        WHERE life_insurance_id=?
    ");
    $stmt->bind_param(
        "isssddssisssssssssi",
        $data['portal_user_id'],
        $data['insurance_company'],
        $data['policy_type'],
        $data['policy_number'],
        $data['face_value'],
        $data['approximate_value'],
        $data['cash_value'],
        $data['primary_beneficiaries'],
        $data['contingent_beneficiaries'],
        $data['owned_by_trust'],
        $data['trust_name'],
        $data['annual_premium'],
        $data['ownership_form'],
        $data['notes'],
        $data['owned_by'],
        $data['ownership_percentage'],
        $data['other_owners'],
        $data['has_bene'],
        $id
    );
    $stmt->execute();
    echo json_encode(['message' => 'Life insurance holdings updated']);
    $stmt->close();
}

// DELETE
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = intval($_GET['id']);
    $stmt = $conn->prepare("DELETE FROM life_insurance_holdings WHERE life_insurance_id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    echo json_encode(['message' => 'Life insurance holding deleted']);
    $stmt->close();
}

$conn->close();
?>
