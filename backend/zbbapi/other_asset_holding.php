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
        INSERT INTO other_asset_holdings (
            portal_user_id, asset_type, description, approximate_value, debtOwed, netValue, is_heirloom,
            intended_recipient, special_instructions, appraisal_exists, appraisal_date, owned_by,
            ownership_percentage, other_owners, ownership_form, notes, has_bene
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->bind_param(
        "issddisssisssssss",
        $data['portal_user_id'],
        $data['asset_type'],
        $data['description'],
        $data['approximate_value'],
        $data['debtOwed'],
        $data['netValue'],
        $data['is_heirloom'],
        $data['intended_recipient'],
        $data['special_instructions'],
        $data['appraisal_exists'],
        $data['appraisal_date'],
        $data['owned_by'],
        $data['ownership_percentage'],
        $data['other_owners'],
        $data['ownership_form'],
        $data['notes'],
        $data['has_bene']
    );
    $stmt->execute();
    echo json_encode(['other_asset_id' => $stmt->insert_id]);
    $stmt->close();
}

// READ ALL
if ($_SERVER['REQUEST_METHOD'] === 'GET' && !isset($_GET['id'])) {
    $result = $conn->query("SELECT * FROM other_asset_holdings");
    $rows = [];
    while ($row = $result->fetch_assoc()) {
        $rows[] = $row;
    }
    echo json_encode($rows);
}

// READ ONE
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['id'])) {
    $id = intval($_GET['id']);
    $stmt = $conn->prepare("SELECT * FROM other_asset_holdings WHERE other_asset_id = ?");
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
        UPDATE other_asset_holdings SET
            portal_user_id=?, asset_type=?, description=?, approximate_value=?, debtOwed=?, netValue=?, is_heirloom=?,
            intended_recipient=?, special_instructions=?, appraisal_exists=?, appraisal_date=?, owned_by=?,
            ownership_percentage=?, other_owners=?, ownership_form=?, notes=?, has_bene=?
        WHERE other_asset_id=?
    ");
    $stmt->bind_param(
        "issddisssisssssssi",
        $data['portal_user_id'],
        $data['asset_type'],
        $data['description'],
        $data['approximate_value'],
        $data['debtOwed'],
        $data['netValue'],
        $data['is_heirloom'],
        $data['intended_recipient'],
        $data['special_instructions'],
        $data['appraisal_exists'],
        $data['appraisal_date'],
        $data['owned_by'],
        $data['ownership_percentage'],
        $data['other_owners'],
        $data['ownership_form'],
        $data['notes'],
        $data['has_bene'],
        $id
    );
    $stmt->execute();
    echo json_encode(['message' => 'Other asset holdings updated']);
    $stmt->close();
}

// DELETE
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = intval($_GET['id']);
    $stmt = $conn->prepare("DELETE FROM other_asset_holdings WHERE other_asset_id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    echo json_encode(['message' => 'Other asset holdings deleted']);
    $stmt->close();
}

$conn->close();
?>
