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
        INSERT INTO business_interest_holdings (
            portal_user_id, business_name, business_type, ownership_percentage, approximate_value, has_other_owners,
            other_owners_names, buy_sell_agreement_exists, buy_sell_document_id, succession_plan_exists, business_vision_after_death,
            intended_successor, successor_is_family, should_business_be_sold, ownership_form, notes, owned_by, other_owners
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->bind_param(
        "issddississsssssss",
        $data['portal_user_id'],
        $data['business_name'],
        $data['business_type'],
        $data['ownership_percentage'],
        $data['approximate_value'],
        $data['has_other_owners'],
        $data['other_owners_names'],
        $data['buy_sell_agreement_exists'],
        $data['buy_sell_document_id'],
        $data['succession_plan_exists'],
        $data['business_vision_after_death'],
        $data['intended_successor'],
        $data['successor_is_family'],
        $data['should_business_be_sold'],
        $data['ownership_form'],
        $data['notes'],
        $data['owned_by'],
        $data['other_owners']
    );
    $stmt->execute();
    echo json_encode(['business_interest_id' => $stmt->insert_id]);
    $stmt->close();
}

// READ ALL
if ($_SERVER['REQUEST_METHOD'] === 'GET' && !isset($_GET['id'])) {
    $result = $conn->query("SELECT * FROM bank_account_holdings");
    $rows = [];
    while ($row = $result->fetch_assoc()) {
        $rows[] = $row;
    }
    echo json_encode($rows);
}

// READ ONE
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['id'])) {
    $id = intval($_GET['id']);
    $stmt = $conn->prepare("SELECT * FROM bank_account_holdings WHERE bank_account_id = ?");
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
        UPDATE business_interest_holdings SET
            portal_user_id=?, business_name=?, business_type=?, ownership_percentage=?, approximate_value=?, has_other_owners=?,
            other_owners_names=?, buy_sell_agreement_exists=?, buy_sell_document_id=?, succession_plan_exists=?, business_vision_after_death=?,
            intended_successor=?, successor_is_family=?, should_business_be_sold=?, ownership_form=?, notes=?, owned_by=?, other_owners=?
        WHERE business_interest_id=?
    ");
    $stmt->bind_param(
        "issddississsssssssi",
        $data['portal_user_id'],
        $data['business_name'],
        $data['business_type'],
        $data['ownership_percentage'],
        $data['approximate_value'],
        $data['has_other_owners'],
        $data['other_owners_names'],
        $data['buy_sell_agreement_exists'],
        $data['buy_sell_document_id'],
        $data['succession_plan_exists'],
        $data['business_vision_after_death'],
        $data['intended_successor'],
        $data['successor_is_family'],
        $data['should_business_be_sold'],
        $data['ownership_form'],
        $data['notes'],
        $data['owned_by'],
        $data['other_owners'],
        $id
    );
    $stmt->execute();
    echo json_encode(['message' => 'Business interest holdings updated']);
    $stmt->close();
}

// DELETE
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = intval($_GET['id']);
    $stmt = $conn->prepare("DELETE FROM bank_account_holdings WHERE bank_account_id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    echo json_encode(['message' => 'Bank account holdings deleted']);
    $stmt->close();
}

$conn->close();
?>
