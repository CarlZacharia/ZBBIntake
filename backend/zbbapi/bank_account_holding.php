<?php
require_once 'db.php';

// Helper: get JSON input
function getInput() {
    return json_decode(file_get_contents('php://input'), true);
}

// CREATE
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = getInput();
    $stmt = $conn->prepare("INSERT INTO bank_account_holding (client_id, bank_name, account_number, balance) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("issd",
        $data['client_id'],
        $data['bank_name'],
        $data['account_number'],
        $data['balance']
    );
    $stmt->execute();
    echo json_encode(['bank_account_id' => $stmt->insert_id]);
    $stmt->close();
}

// READ ALL
if ($_SERVER['REQUEST_METHOD'] === 'GET' && !isset($_GET['id'])) {
    $result = $conn->query("SELECT * FROM bank_account_holding");
    $rows = [];
    while ($row = $result->fetch_assoc()) {
        $rows[] = $row;
    }
    echo json_encode($rows);
}

// READ ONE
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['id'])) {
    $id = intval($_GET['id']);
    $stmt = $conn->prepare("SELECT * FROM bank_account_holding WHERE bank_account_id = ?");
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
    $stmt = $conn->prepare("UPDATE bank_account_holding SET client_id=?, bank_name=?, account_number=?, balance=? WHERE bank_account_id=?");
    $stmt->bind_param("issdi",
        $data['client_id'],
        $data['bank_name'],
        $data['account_number'],
        $data['balance'],
        $id
    );
    $stmt->execute();
    echo json_encode(['message' => 'Bank account holding updated']);
    $stmt->close();
}

// DELETE
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = intval($_GET['id']);
    $stmt = $conn->prepare("DELETE FROM bank_account_holding WHERE bank_account_id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    echo json_encode(['message' => 'Bank account holding deleted']);
    $stmt->close();
}

$conn->close();
?>
