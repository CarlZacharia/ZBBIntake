<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Access-Control-Allow-Origin: http://localhost:4200');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
  if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
      http_response_code(200);
      exit;
  }

  require_once 'db.php';


if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

$table = isset($input['table']) ? $input['table'] : null;
$data = isset($input['data']) ? $input['data'] : null;

if (!$table || !$data || !is_array($data)) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing table or data']);
    exit();
}

// All keys are portal_user_id
$primaryKey = 'portal_user_id';
if (!isset($data[$primaryKey])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing portal_user_id']);
    exit();
}

$set = [];
foreach ($data as $key => $value) {
    if ($key !== $primaryKey) {
        // Convert null to empty string to avoid deprecated warning
        $escaped = $conn->real_escape_string($value === null ? '' : $value);
        $set[] = "`$key` = '$escaped'";
    }
}
$setClause = implode(', ', $set);
$id = $conn->real_escape_string($data[$primaryKey]);

$sql = "UPDATE `$table` SET $setClause WHERE `$primaryKey` = '$id' LIMIT 1";
$result = $conn->query($sql);

if ($result) {
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Database update failed', 'details' => $conn->error]);
}
?>
