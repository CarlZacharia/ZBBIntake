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
        INSERT INTO digital_asset_holdings (
            portal_user_id, asset_type, asset_name, platform_or_service, approximate_value, username, access_location,
            wallet_type, seed_phrase_location, intended_disposition, access_instructions, ownership_form, notes,
            owned_by, ownership_percentage, other_owners
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->bind_param(
        "issssdssssssssss",
        $data['portal_user_id'],
        $data['asset_type'],
        $data['asset_name'],
        $data['platform_or_service'],
        $data['approximate_value'],
        $data['username'],
        $data['access_location'],
        $data['wallet_type'],
        $data['seed_phrase_location'],
        $data['intended_disposition'],
        $data['access_instructions'],
        $data['ownership_form'],
        $data['notes'],
        $data['owned_by'],
        $data['ownership_percentage'],
        $data['other_owners']
    );
    $stmt->execute();
    echo json_encode(['digital_asset_id' => $stmt->insert_id]);
    $stmt->close();
}

// READ ALL
if ($_SERVER['REQUEST_METHOD'] === 'GET' && !isset($_GET['id'])) {
    $result = $conn->query("SELECT * FROM digital_asset_holdings");
    $rows = [];
    while ($row = $result->fetch_assoc()) {
        $rows[] = $row;
    }
    echo json_encode($rows);
}

// READ ONE
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['id'])) {
    $id = intval($_GET['id']);
    $stmt = $conn->prepare("SELECT * FROM digital_asset_holdings WHERE digital_asset_id = ?");
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
        UPDATE digital_asset_holdings SET
            portal_user_id=?, asset_type=?, asset_name=?, platform_or_service=?, approximate_value=?, username=?, access_location=?,
            wallet_type=?, seed_phrase_location=?, intended_disposition=?, access_instructions=?, ownership_form=?, notes=?,
            owned_by=?, ownership_percentage=?, other_owners=?
        WHERE digital_asset_id=?
    ");
    $stmt->bind_param(
        "issssdssssssssssi",
        $data['portal_user_id'],
        $data['asset_type'],
        $data['asset_name'],
        $data['platform_or_service'],
        $data['approximate_value'],
        $data['username'],
        $data['access_location'],
        $data['wallet_type'],
        $data['seed_phrase_location'],
        $data['intended_disposition'],
        $data['access_instructions'],
        $data['ownership_form'],
        $data['notes'],
        $data['owned_by'],
        $data['ownership_percentage'],
        $data['other_owners'],
        $id
    );
    $stmt->execute();
    echo json_encode(['message' => 'Digital asset holdings updated']);
    $stmt->close();
}

// DELETE
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = intval($_GET['id']);
    $stmt = $conn->prepare("DELETE FROM digital_asset_holdings WHERE digital_asset_id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    echo json_encode(['message' => 'Digital asset holdings deleted']);
    $stmt->close();
}

$conn->close();
?>
