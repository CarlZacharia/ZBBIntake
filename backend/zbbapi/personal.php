<?php
require_once 'db.php';

// Helper: get JSON input
function getInput() {
    return json_decode(file_get_contents('php://input'), true);
}

// CREATE
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = getInput();
    $stmt = $conn->prepare("INSERT INTO personal (client_id, legal_first_name, legal_middle_name, legal_last_name, suffix, preferred_name, date_of_birth, ssn_encrypted, us_citizen, citizenship_country, years_at_address, mobile_phone, home_phone, email, preferred_contact_method, occupation, employer_name, employer_address, military_service, military_branch, military_service_dates) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("isssssssississsssiss",
        $data['client_id'],
        $data['legal_first_name'],
        $data['legal_middle_name'],
        $data['legal_last_name'],
        $data['suffix'],
        $data['preferred_name'],
        $data['date_of_birth'],
        $data['ssn_encrypted'],
        $data['us_citizen'],
        $data['citizenship_country'],
        $data['years_at_address'],
        $data['mobile_phone'],
        $data['home_phone'],
        $data['email'],
        $data['preferred_contact_method'],
        $data['occupation'],
        $data['employer_name'],
        $data['employer_address'],
        $data['military_service'],
        $data['military_branch'],
        $data['military_service_dates']
    );
    $stmt->execute();
    echo json_encode(['personal_id' => $stmt->insert_id]);
    $stmt->close();
}

// READ ALL
if ($_SERVER['REQUEST_METHOD'] === 'GET' && !isset($_GET['id'])) {
    $result = $conn->query("SELECT * FROM personal");
    $rows = [];
    while ($row = $result->fetch_assoc()) {
        $rows[] = $row;
    }
    echo json_encode($rows);
}

// READ ONE
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['id'])) {
    $id = intval($_GET['id']);
    $stmt = $conn->prepare("SELECT * FROM personal WHERE personal_id = ?");
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
    $stmt = $conn->prepare("UPDATE personal SET client_id=?, legal_first_name=?, legal_middle_name=?, legal_last_name=?, suffix=?, preferred_name=?, date_of_birth=?, ssn_encrypted=?, us_citizen=?, citizenship_country=?, years_at_address=?, mobile_phone=?, home_phone=?, email=?, preferred_contact_method=?, occupation=?, employer_name=?, employer_address=?, military_service=?, military_branch=?, military_service_dates=? WHERE personal_id=?");
    $stmt->bind_param("isssssssississsssissi",
        $data['client_id'],
        $data['legal_first_name'],
        $data['legal_middle_name'],
        $data['legal_last_name'],
        $data['suffix'],
        $data['preferred_name'],
        $data['date_of_birth'],
        $data['ssn_encrypted'],
        $data['us_citizen'],
        $data['citizenship_country'],
        $data['years_at_address'],
        $data['mobile_phone'],
        $data['home_phone'],
        $data['email'],
        $data['preferred_contact_method'],
        $data['occupation'],
        $data['employer_name'],
        $data['employer_address'],
        $data['military_service'],
        $data['military_branch'],
        $data['military_service_dates'],
        $id
    );
    $stmt->execute();
    echo json_encode(['message' => 'Personal record updated']);
    $stmt->close();
}

// DELETE
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = intval($_GET['id']);
    $stmt = $conn->prepare("DELETE FROM personal WHERE personal_id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    echo json_encode(['message' => 'Personal record deleted']);
    $stmt->close();
}

$conn->close();
?>
