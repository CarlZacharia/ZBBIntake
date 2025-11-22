<?php
require_once 'db.php';

// Helper: get JSON input
function getInput() {
    return json_decode(file_get_contents('php://input'), true);
}

// CREATE
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = getInput();
    $stmt = $conn->prepare("INSERT INTO guardianship_preferences (case_id, child_raising_values, location_importance, religious_upbringing_preferences, education_priorities, other_preferences) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("isssss",
        $data['case_id'],
        $data['child_raising_values'],
        $data['location_importance'],
        $data['religious_upbringing_preferences'],
        $data['education_priorities'],
        $data['other_preferences']
    );
    $stmt->execute();
    echo json_encode(['preference_id' => $stmt->insert_id]);
    $stmt->close();
}

// READ ALL
if ($_SERVER['REQUEST_METHOD'] === 'GET' && !isset($_GET['id'])) {
    $result = $conn->query("SELECT * FROM guardianship_preferences");
    $rows = [];
    while ($row = $result->fetch_assoc()) {
        $rows[] = $row;
    }
    echo json_encode($rows);
}

// READ ONE
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['id'])) {
    $id = intval($_GET['id']);
    $stmt = $conn->prepare("SELECT * FROM guardianship_preferences WHERE preference_id = ?");
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
    $stmt = $conn->prepare("UPDATE guardianship_preferences SET case_id=?, child_raising_values=?, location_importance=?, religious_upbringing_preferences=?, education_priorities=?, other_preferences=? WHERE preference_id=?");
    $stmt->bind_param("isssssi",
        $data['case_id'],
        $data['child_raising_values'],
        $data['location_importance'],
        $data['religious_upbringing_preferences'],
        $data['education_priorities'],
        $data['other_preferences'],
        $id
    );
    $stmt->execute();
    echo json_encode(['message' => 'Guardianship preferences updated']);
    $stmt->close();
}

// DELETE
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = intval($_GET['id']);
    $stmt = $conn->prepare("DELETE FROM guardianship_preferences WHERE preference_id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    echo json_encode(['message' => 'Guardianship preferences deleted']);
    $stmt->close();
}

$conn->close();
?>
