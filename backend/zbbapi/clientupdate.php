<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:4200');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Database connection
require __DIR__ . '/db.php';

// Parse input
$input = json_decode(file_get_contents('php://input'), true);

$table = $input['table'] ?? null;
$data = $input['data'] ?? null;
$action = $input['action'] ?? ($data['action'] ?? null);

// Validate required fields
if (!$table || !$data || !is_array($data)) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing table or data']);
    exit();
}

// Whitelist allowed tables for security
$allowedTables = [
    'personal',
    'marital_info',
    'client',
    'child',
    'family_member',
    'charity',
    'real_estate_holdings',
    'bank_account_holdings',
    'nq_account_holdings',
    'life_insurance_holdings',
    'retirement_account_holdings',
    'other_asset_holdings',
    'business_interest_holdings',
    'guardian_preferences'
];

if (!in_array($table, $allowedTables)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid table name', 'table' => $table]);
    exit();
}

// Determine primary key from input or by table name
$primaryKey = $input['asset_id_type'] ?? $data['asset_id_type'] ?? null;

if (!$primaryKey) {
    switch ($table) {
        case 'child':
            $primaryKey = 'child_id';
            break;
        case 'family_member':
            $primaryKey = 'family_member_id';
            break;
        case 'charity':
            $primaryKey = 'charity_id';
            break;
        case 'real_estate_holdings':
            $primaryKey = 'real_estate_id';
            break;
        case 'bank_account_holdings':
            $primaryKey = 'bank_account_id';
            break;
        case 'nq_account_holdings':
            $primaryKey = 'nq_account_id';
            break;
        case 'life_insurance_holdings':
            $primaryKey = 'life_insurance_id';
            break;
        case 'retirement_account_holdings':
            $primaryKey = 'retirement_account_id';
            break;
        case 'other_asset_holdings':
            $primaryKey = 'other_asset_id';
            break;
        case 'business_interest_holdings':
            $primaryKey = 'business_interest_id';
            break;
        // Tables that use portal_user_id as primary key
        case 'client':
        case 'personal':
        case 'marital_info':
        case 'guardian_preferences':
            $primaryKey = 'portal_user_id';
            break;
        default:
            $primaryKey = null;
    }
}

// Get primary key value
$primaryId = $input['id'] ?? ($data[$primaryKey] ?? null);

// Main tables that should not allow insert (only update) - records created during registration
$mainTables = ['personal', 'marital_info', 'client', 'guardian_preferences'];

/**
 * Helper function to save concern assignments
 */
function saveConcernAssignments($conn, $table, $data, $beneficiaryId) {
    if (!isset($data['concern_ids']) || !is_array($data['concern_ids'])) {
        return;
    }

    $concern_ids = $data['concern_ids'];
    $portal_user_id = isset($data['portal_user_id']) ? intval($data['portal_user_id']) : 0;

    // Determine the beneficiary ID field based on table
    $beneficiary_id_field = null;
    switch ($table) {
        case 'child':
            $beneficiary_id_field = 'child_id';
            break;
        case 'family_member':
            $beneficiary_id_field = 'family_member_id';
            break;
        case 'charity':
            $beneficiary_id_field = 'charity_id';
            break;
    }

    if ($beneficiary_id_field && $beneficiaryId) {
        // Delete old assignments
        $stmt = $conn->prepare("DELETE FROM beneficiary_concern_assignments WHERE $beneficiary_id_field = ? AND portal_user_id = ?");
        $stmt->bind_param("ii", $beneficiaryId, $portal_user_id);
        $stmt->execute();
        $stmt->close();

        // Insert new assignments
        $stmt = $conn->prepare("INSERT INTO beneficiary_concern_assignments (portal_user_id, $beneficiary_id_field, concern_id) VALUES (?, ?, ?)");
        foreach ($concern_ids as $concern_id) {
            $concern_id = intval($concern_id);
            $stmt->bind_param("iii", $portal_user_id, $beneficiaryId, $concern_id);
            $stmt->execute();
        }
        $stmt->close();
    }
}

/**
 * Build SET clause for UPDATE statements
 */
function buildSetClause($conn, $data, $primaryKey) {
    $set = [];
    foreach ($data as $key => $value) {
        // Skip special fields
        if ($key === $primaryKey || $key === 'action' || $key === 'concern_ids' || $key === 'asset_id_type') {
            continue;
        }
        $escaped = $conn->real_escape_string($value === null ? '' : $value);
        $set[] = "`$key` = '$escaped'";
    }
    return implode(', ', $set);
}

/**
 * Build INSERT columns and values
 */
function buildInsertClauses($conn, $data) {
    $columns = [];
    $values = [];
    foreach ($data as $key => $value) {
        // Skip special fields
        if ($key === 'action' || $key === 'concern_ids' || $key === 'asset_id_type') {
            continue;
        }
        $columns[] = "`$key`";
        $escaped = $conn->real_escape_string($value === null ? '' : $value);
        $values[] = "'$escaped'";
    }
    return [
        'columns' => implode(', ', $columns),
        'values' => implode(', ', $values)
    ];
}

// ============================================
// HANDLE ACTIONS
// ============================================

if ($action === 'insert') {
    // INSERT action

    // Block insert for main tables
    if (in_array($table, $mainTables)) {
        http_response_code(400);
        echo json_encode(['error' => 'Insert not allowed for main table. Use update instead.', 'table' => $table]);
        exit();
    }

    // Validate primary key exists for insert
    if (!$primaryKey || !isset($data[$primaryKey]) || $data[$primaryKey] === '') {
        http_response_code(400);
        echo json_encode(['error' => 'Missing or empty primary key for insert', 'primaryKey' => $primaryKey]);
        exit();
    }

    $checkId = $conn->real_escape_string($data[$primaryKey]);

    // Check if record already exists
    $checkSql = "SELECT 1 FROM `$table` WHERE `$primaryKey` = '$checkId' LIMIT 1";
    $checkResult = $conn->query($checkSql);

    if ($checkResult && $checkResult->num_rows > 0) {
        // Row exists - run UPDATE instead
        $setClause = buildSetClause($conn, $data, $primaryKey);
        $sql = "UPDATE `$table` SET $setClause WHERE `$primaryKey` = '$checkId' LIMIT 1";
        $result = $conn->query($sql);

        if ($result) {
            saveConcernAssignments($conn, $table, $data, $checkId);
            echo json_encode([
                'success' => true,
                'action' => 'update',
                'message' => 'Record existed, updated instead',
                'sql' => $sql,
                'affected_rows' => $conn->affected_rows
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Database update failed', 'details' => $conn->error, 'sql' => $sql]);
        }
    } else {
        // Row doesn't exist - INSERT
        $clauses = buildInsertClauses($conn, $data);
        $sql = "INSERT INTO `$table` ({$clauses['columns']}) VALUES ({$clauses['values']})";
        $result = $conn->query($sql);
        $insert_id = $conn->insert_id;

        if ($result) {
            saveConcernAssignments($conn, $table, $data, $insert_id);
            echo json_encode([
                'success' => true,
                'action' => 'insert',
                'sql' => $sql,
                'insert_id' => $insert_id
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Database insert failed', 'details' => $conn->error, 'sql' => $sql]);
        }
    }

} elseif ($action === 'delete') {
    // DELETE action

    if ($primaryId === null || $primaryId === '') {
        http_response_code(400);
        echo json_encode(['error' => 'Missing primary key value for delete', 'primaryKey' => $primaryKey]);
        exit();
    }
    $id = $conn->real_escape_string($primaryId);
    $sql = "DELETE FROM `$table` WHERE `$primaryKey` = '$id' LIMIT 1";

    $result = $conn->query($sql);

    if ($result) {
        echo json_encode([
            'success' => true,
            'action' => 'delete',
            'sql' => $sql,
            'affected_rows' => $conn->affected_rows
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Database delete failed', 'details' => $conn->error, 'sql' => $sql]);
    }

} elseif ($action === 'update' || $action === null) {
    // UPDATE action (default if no action specified)

    $setClause = buildSetClause($conn, $data, $primaryKey);

    if (empty($setClause)) {
        http_response_code(400);
        echo json_encode(['error' => 'No fields to update']);
        exit();
    }

    if ($primaryId === null || $primaryId === '') {
        http_response_code(400);
        echo json_encode(['error' => 'Missing primary key value for update', 'primaryKey' => $primaryKey]);
        exit();
    }
    $id = $conn->real_escape_string($primaryId);
    $sql = "UPDATE `$table` SET $setClause WHERE `$primaryKey` = '$id' LIMIT 1";

    $result = $conn->query($sql);

    if ($result) {
        saveConcernAssignments($conn, $table, $data, $primaryId);
        echo json_encode([
            'success' => true,
            'action' => 'update',
            'sql' => $sql,
            'affected_rows' => $conn->affected_rows
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Database update failed', 'details' => $conn->error, 'sql' => $sql]);
    }

} else {
    http_response_code(400);
    echo json_encode(['error' => 'Unknown action', 'action' => $action]);
}

// Close connection
$conn->close();
