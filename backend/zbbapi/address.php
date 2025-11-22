<?php
require_once 'db.php';

// Helper: get JSON input
function getInput() {
    return json_decode(file_get_contents('php://input'), true);
}

// CREATE
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = getInput();
    $stmt = $conn->prepare("INSERT INTO address (personal_id, address_line1, address_line2, city, state, zip) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("isssss",
        $data['personal_id'],
        $data['address_line1'],
        $data['address_line2'],
        $data['city'],
        $data['state'],
        $data['zip']
    );
    $stmt->execute();
    echo json_encode(['address_id' => $stmt->insert_id]);
    $stmt->close();
}

// READ ALL
if ($_SERVER['REQUEST_METHOD'] === 'GET' && !isset($_GET['id'])) {
    $result = $conn->query("SELECT * FROM address");
    $rows = [];
    while ($row = $result->fetch_assoc()) {
        $rows[] = $row;
    }
    echo json_encode($rows);
}

// READ ONE
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['id'])) {
    $id = intval($_GET['id']);
    $stmt = $conn->prepare("SELECT * FROM address WHERE address_id = ?");
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
    $stmt = $conn->prepare("UPDATE address SET personal_id=?, address_line1=?, address_line2=?, city=?, state=?, zip=? WHERE address_id=?");
    $stmt->bind_param("isssssi",
        $data['personal_id'],
        $data['address_line1'],
        $data['address_line2'],
        $data['city'],
        $data['state'],
        $data['zip'],
        $id
    );
    $stmt->execute();
    echo json_encode(['message' => 'Address updated']);
    $stmt->close();
}

// DELETE
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = intval($_GET['id']);
    $stmt = $conn->prepare("DELETE FROM address WHERE address_id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    echo json_encode(['message' => 'Address deleted']);
    $stmt->close();
}

$conn->close();
?>
