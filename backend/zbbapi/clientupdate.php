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

// Support action in both top-level and inside data
$action = isset($input['action']) ? $input['action'] : (isset($data['action']) ? $data['action'] : null);


if (!$table || !$data || !is_array($data)) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing table or data']);
    exit();
}





// Only detect and validate primary key for update/delete actions
$primaryKey = null;
$primaryId = null;
if ($action === 'update' || $action === 'delete') {
    // Determine primary key name (e.g., real_estate_id) and value
    if (isset($input['asset_id_type'])) {
        $primaryKey = $input['asset_id_type'];
    } elseif (isset($data['asset_id_type'])) {
        $primaryKey = $data['asset_id_type'];
    } else {
        // Fallback: set primaryKey based on table name
        switch ($table) {
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
            case 'debt':
                $primaryKey = 'debt_id';
                break;
            // Add more cases as needed for other asset tables
            default:
                $primaryKey = null;
        }
    }

    if ($primaryKey) {
        if (isset($input[$primaryKey])) {
            $primaryId = $input[$primaryKey];
        } elseif (isset($data[$primaryKey])) {
            $primaryId = $data[$primaryKey];
        } elseif (isset($input['id'])) {
            $primaryId = $input['id'];
        } elseif (isset($data['id'])) {
            $primaryId = $data['id'];
        }
    }
}


// Only validate primary key for update/delete actions
if ($action === 'update' || $action === 'delete') {
    if (!$table || !$primaryKey || !$primaryId) {
        $noPrimaryKeyTables = ['personal', 'marital_info'];
        if (!in_array($table, $noPrimaryKeyTables)) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing table, asset_id_type, or primary key value', 'table' => $table, 'primaryKey' => $primaryKey, 'primaryId' => $primaryId]);
            exit();
        }
    }
}




if ($action === 'insert') {
    header('Content-Type: application/json');
    // Build INSERT statement
    $columns = [];
    $values = [];
    foreach ($data as $key => $value) {
        if ($key === 'action') continue; // Skip action key
        $columns[] = "`$key`";
        $escaped = $conn->real_escape_string($value === null ? '' : $value);
        $values[] = "'$escaped'";
    }
    $columnsClause = implode(', ', $columns);
    $valuesClause = implode(', ', $values);
    $sql = "INSERT INTO `$table` ($columnsClause) VALUES ($valuesClause)";
    $result = $conn->query($sql);
    if ($result) {
        echo json_encode([
            'success' => true,
            'sql' => $sql,
            'insert_id' => $conn->insert_id
        ]);
    } else {
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode([
            'error' => 'Database insert failed',
            'details' => $conn->error,
            'sql' => $sql
        ]);
    }
} else if ($action === 'delete') {
    // DELETE statement
    // To send a delete from the frontend, use:
    // {
    //   table: 'bank_account_holdings',
    //   asset_id_type: 'bank_account_id',
    //   id: 123,
    //   action: 'delete'
    // }
    // For tables without a primary key, delete all rows (use with caution)
    $noPrimaryKeyTables = ['personal', 'marital_info'];
    if (in_array($table, $noPrimaryKeyTables)) {
        $sql = "DELETE FROM `$table` LIMIT 1";
    } else {
        $id = $primaryId === null ? '' : $conn->real_escape_string($primaryId);
        $sql = "DELETE FROM `$table` WHERE `$primaryKey` = '$id' LIMIT 1";
    }
    $result = $conn->query($sql);
    if ($result) {
        echo json_encode([
            'success' => true,
            'sql' => $sql,
            'affected_rows' => $conn->affected_rows
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'error' => 'Database delete failed',
            'details' => $conn->error,
            'sql' => $sql
        ]);
    }
} else if ($action === 'update' || $action === null) {
    // UPDATE statement
    $set = [];
    foreach ($data as $key => $value) {
        if ($key !== $primaryKey && $key !== 'action') {
            // Convert null to empty string to avoid deprecated warning
            $escaped = $conn->real_escape_string($value === null ? '' : $value);
            $set[] = "`$key` = '$escaped'";
        }
    }
    $setClause = implode(', ', $set);
    $noPrimaryKeyTables = ['personal', 'marital_info'];
    if (in_array($table, $noPrimaryKeyTables)) {
        // For tables without a primary key, update all rows (use with caution)
        $sql = "UPDATE `$table` SET $setClause LIMIT 1";
    } else {
        $id = $primaryId === null ? '' : $conn->real_escape_string($primaryId);
        $sql = "UPDATE `$table` SET $setClause WHERE `$primaryKey` = '$id' LIMIT 1";
    }
    $result = $conn->query($sql);
    if ($result) {
        echo json_encode([
            'success' => true,
            'sql' => $sql,
            'affected_rows' => $conn->affected_rows
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'error' => 'Database update failed',
            'details' => $conn->error,
            'sql' => $sql
        ]);
    }
} else {
    http_response_code(400);
    echo json_encode([
        'error' => 'Unknown action',
        'action' => $action
    ]);
}
?>
