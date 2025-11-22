<?php
require_once 'db.php';

// Helper: get JSON input
function getInput() {
    return json_decode(file_get_contents('php://input'), true);
}

// CREATE
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = getInput();
    $stmt = $conn->prepare("INSERT INTO retirement_account_holding (client_id, account_name, balance) VALUES (?, ?, ?)");
    $stmt->bind_param("isd",
        $data['client_id'],
        $data['account_name'],
        $data['balance']
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
    $stmt = $conn->prepare("UPDATE retirement_account_holding SET client_id=?, account_name=?, balance=? WHERE retirement_account_id=?");
    $stmt->bind_param("isdi",
        $data['client_id'],
        $data['account_name'],
        $data['balance'],
        $id
    );
    $stmt->execute();
    echo json_encode(['message' => 'Retirement account holding updated']);
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
