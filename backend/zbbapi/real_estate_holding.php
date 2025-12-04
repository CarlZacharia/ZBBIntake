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
        INSERT INTO real_estate_holdings (
            portal_user_id, description, value, ownership_form, property_type, address_line1, address_line2, city, state, zip,
            title_details, approximate_value, mortgage_balance, net_value, beneficiaries_on_deed, intended_beneficiary,
            special_notes, owned_by, ownership_percentage, other_owners, ownership_value, has_bene
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->bind_param(
        "isdsissssssddssssddss",
        $data['portal_user_id'],
        $data['description'],
        $data['value'],
        $data['ownership_form'],
        $data['property_type'],
        $data['address_line1'],
        $data['address_line2'],
        $data['city'],
        $data['state'],
        $data['zip'],
        $data['title_details'],
        $data['approximate_value'],
        $data['mortgage_balance'],
        $data['net_value'],
        $data['beneficiaries_on_deed'],
        $data['intended_beneficiary'],
        $data['special_notes'],
        $data['owned_by'],
        $data['ownership_percentage'],
        $data['other_owners'],
        $data['ownership_value'],
        $data['has_bene']
    );
    $stmt->execute();
    echo json_encode(['real_estate_id' => $stmt->insert_id]);
    $stmt->close();
}




// READ ALL
if ($_SERVER['REQUEST_METHOD'] === 'GET' && !isset($_GET['id'])) {
    $result = $conn->query("SELECT * FROM real_estate_holdings");
    $rows = [];
    while ($row = $result->fetch_assoc()) {
        $rows[] = $row;
    }
    echo json_encode($rows);
}

// READ ONE
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['id'])) {
    $id = intval($_GET['id']);
    $stmt = $conn->prepare("SELECT * FROM real_estate_holdings WHERE real_estate_id = ?");
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
        UPDATE real_estate_holdings SET
            portal_user_id=?, description=?, value=?, ownership_form=?, property_type=?, address_line1=?, address_line2=?, city=?, state=?, zip=?,
            title_details=?, approximate_value=?, mortgage_balance=?, net_value=?, beneficiaries_on_deed=?, intended_beneficiary=?,
            special_notes=?, owned_by=?, ownership_percentage=?, other_owners=?, ownership_value=?, has_bene=?
        WHERE real_estate_id=?
    ");
    $stmt->bind_param(
        "isdsissssssddssssddsii",
        $data['portal_user_id'],
        $data['description'],
        $data['value'],
        $data['ownership_form'],
        $data['property_type'],
        $data['address_line1'],
        $data['address_line2'],
        $data['city'],
        $data['state'],
        $data['zip'],
        $data['title_details'],
        $data['approximate_value'],
        $data['mortgage_balance'],
        $data['net_value'],
        $data['beneficiaries_on_deed'],
        $data['intended_beneficiary'],
        $data['special_notes'],
        $data['owned_by'],
        $data['ownership_percentage'],
        $data['other_owners'],
        $data['ownership_value'],
        $data['has_bene'],
        $id
    );
    $stmt->execute();
    echo json_encode(['message' => 'Real estate holdings updated']);
    $stmt->close();
}


// DELETE
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = intval($_GET['id']);
    $stmt = $conn->prepare("DELETE FROM real_estate_holdings WHERE real_estate_id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    echo json_encode(['message' => 'Real estate holdings deleted']);
    $stmt->close();
}

$conn->close();
?>
