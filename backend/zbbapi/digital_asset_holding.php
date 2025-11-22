<?php
require_once 'db.php';

// Helper: get JSON input
function getInput() {
    return json_decode(file_get_contents('php://input'), true);
}

// CREATE
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = getInput();
    $stmt = $conn->prepare("INSERT INTO digital_asset_holding (client_id, asset_name, value) VALUES (?, ?, ?)");
    $stmt->bind_param("isd",
        $data['client_id'],
        $data['asset_name'],
        $data['value']
    );
    $stmt->execute();
    echo json_encode(['digital_asset_id' => $stmt->insert_id]);
    $stmt->close();
}

// READ ALL
if ($_SERVER['REQUEST_METHOD'] === 'GET' && !isset($_GET['id'])) {
    $result = $conn->query("SELECT * FROM digital_asset_holding");
    $rows = [];
    while ($row = $result->fetch_assoc()) {
        $rows[] = $row;
    }
    echo json_encode($rows);
}

// READ ONE
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['id'])) {
    $id = intval($_GET['id']);
    $stmt = $conn->prepare("SELECT * FROM digital_asset_holding WHERE digital_asset_id = ?");
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
    $stmt = $conn->prepare("UPDATE digital_asset_holding SET client_id=?, asset_name=?, value=? WHERE digital_asset_id=?");
    $stmt->bind_param("isdi",
        $data['client_id'],
        $data['asset_name'],
        $data['value'],
        $id
    );
    $stmt->execute();
    echo json_encode(['message' => 'Digital asset holding updated']);
    $stmt->close();
}

// DELETE
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = intval($_GET['id']);
    $stmt = $conn->prepare("DELETE FROM digital_asset_holding WHERE digital_asset_id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    echo json_encode(['message' => 'Digital asset holding deleted']);
    $stmt->close();
}

$conn->close();
?>
