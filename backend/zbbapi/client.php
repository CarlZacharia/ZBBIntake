<?php
require_once 'db.php';

// Helper: get JSON input
function getInput() {
    return json_decode(file_get_contents('php://input'), true);
}

// CREATE
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = getInput();
    $stmt = $conn->prepare("INSERT INTO client (user_account_id, status, completion_percentage, assigned_attorney_id, referral_source) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("isiss", $data['user_account_id'], $data['status'], $data['completion_percentage'], $data['assigned_attorney_id'], $data['referral_source']);
    $stmt->execute();
    echo json_encode(['client_id' => $stmt->insert_id]);
    $stmt->close();
}

// READ ALL
if ($_SERVER['REQUEST_METHOD'] === 'GET' && !isset($_GET['id'])) {
    $result = $conn->query("SELECT * FROM client");
    $rows = [];
    while ($row = $result->fetch_assoc()) {
        $rows[] = $row;
    }
    echo json_encode($rows);
}

// READ ONE
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['id'])) {
    $id = intval($_GET['id']);
    $stmt = $conn->prepare("SELECT * FROM client WHERE client_id = ?");
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
    $stmt = $conn->prepare("UPDATE client SET user_account_id=?, status=?, completion_percentage=?, assigned_attorney_id=?, referral_source=? WHERE client_id=?");
    $stmt->bind_param("isissi", $data['user_account_id'], $data['status'], $data['completion_percentage'], $data['assigned_attorney_id'], $data['referral_source'], $id);
    $stmt->execute();
    echo json_encode(['message' => 'Client updated']);
    $stmt->close();
}

// DELETE
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = intval($_GET['id']);
    $stmt = $conn->prepare("DELETE FROM client WHERE client_id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    echo json_encode(['message' => 'Client deleted']);
    $stmt->close();
}

$conn->close();
?>
