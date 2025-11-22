<?php
require_once 'db.php';

// Helper: get JSON input
function getInput() {
    return json_decode(file_get_contents('php://input'), true);
}

// CREATE
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = getInput();
    $stmt = $conn->prepare("INSERT INTO business_interest_holding (client_id, business_name, value) VALUES (?, ?, ?)");
    $stmt->bind_param("isd",
        $data['client_id'],
        $data['business_name'],
        $data['value']
    );
    $stmt->execute();
    echo json_encode(['business_interest_id' => $stmt->insert_id]);
    $stmt->close();
}

// READ ALL
if ($_SERVER['REQUEST_METHOD'] === 'GET' && !isset($_GET['id'])) {
    $result = $conn->query("SELECT * FROM business_interest_holding");
    $rows = [];
    while ($row = $result->fetch_assoc()) {
        $rows[] = $row;
    }
    echo json_encode($rows);
}

// READ ONE
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['id'])) {
    $id = intval($_GET['id']);
    $stmt = $conn->prepare("SELECT * FROM business_interest_holding WHERE business_interest_id = ?");
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
    $stmt = $conn->prepare("UPDATE business_interest_holding SET client_id=?, business_name=?, value=? WHERE business_interest_id=?");
    $stmt->bind_param("isdi",
        $data['client_id'],
        $data['business_name'],
        $data['value'],
        $id
    );
    $stmt->execute();
    echo json_encode(['message' => 'Business interest holding updated']);
    $stmt->close();
}

// DELETE
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = intval($_GET['id']);
    $stmt = $conn->prepare("DELETE FROM business_interest_holding WHERE business_interest_id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    echo json_encode(['message' => 'Business interest holding deleted']);
    $stmt->close();
}

$conn->close();
?>
