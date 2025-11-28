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


$table = isset($input['table']) ? $input['table'] : null;
$data = isset($input['data']) ? $input['data'] : null;
$action = isset($input['action']) ? $input['action'] : (isset($data['action']) ? $data['action'] : null);

// DEBUG - remove after testing


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
    if ($key === 'action' || $key === 'concern_ids') continue; // Skip action and concern_ids
    $columns[] = "`$key`";
    $escaped = $conn->real_escape_string($value === null ? '' : $value);
    $values[] = "'$escaped'";
  }
  $columnsClause = implode(', ', $columns);
  $valuesClause = implode(', ', $values);
  $sql = "INSERT INTO `$table` ($columnsClause) VALUES ($valuesClause)";
  $result = $conn->query($sql);
  $insert_id = $conn->insert_id;
  if ($result) {
    // Save concern assignments if present
    if (isset($data['concern_ids']) && is_array($data['concern_ids'])) {
      $concern_ids = $data['concern_ids'];
      $portal_user_id = isset($data['portal_user_id']) ? intval($data['portal_user_id']) : 0;
      if ($table === 'child') {
        $beneficiary_id_field = 'child_id';
      } elseif ($table === 'family_member') {
        $beneficiary_id_field = 'family_member_id';
      } elseif ($table === 'charity') {
        $beneficiary_id_field = 'charity_id';
      } else {
        $beneficiary_id_field = null;
      }
      if ($beneficiary_id_field && $insert_id) {
        // Delete old assignments (should be none for new insert)
        $conn->query("DELETE FROM beneficiary_concern_assignments WHERE $beneficiary_id_field = $insert_id AND portal_user_id = $portal_user_id");
        // Insert new assignments
        foreach ($concern_ids as $concern_id) {
          $concern_id = intval($concern_id);
          $conn->query("INSERT INTO beneficiary_concern_assignments (portal_user_id, $beneficiary_id_field, concern_id) VALUES ($portal_user_id, $insert_id, $concern_id)");
        }
      }
    }
    echo json_encode([
      'success' => true,
      'sql' => $sql,
      'insert_id' => $insert_id
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
    if ($key !== $primaryKey && $key !== 'action' && $key !== 'concern_ids') {
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
    // Save concern assignments if present
    if (isset($data['concern_ids']) && is_array($data['concern_ids'])) {
      $concern_ids = $data['concern_ids'];
      $portal_user_id = isset($data['portal_user_id']) ? intval($data['portal_user_id']) : 0;
      if ($table === 'child') {
        $beneficiary_id_field = 'child_id';
      } elseif ($table === 'family_member') {
        $beneficiary_id_field = 'family_member_id';
      } elseif ($table === 'charity') {
        $beneficiary_id_field = 'charity_id';
      } else {
        $beneficiary_id_field = null;
      }
      if ($beneficiary_id_field && $primaryId) {
        // Delete old assignments
        $conn->query("DELETE FROM beneficiary_concern_assignments WHERE $beneficiary_id_field = $primaryId AND portal_user_id = $portal_user_id");
        // Insert new assignments
        foreach ($concern_ids as $concern_id) {
          $concern_id = intval($concern_id);
          $conn->query("INSERT INTO beneficiary_concern_assignments (portal_user_id, $beneficiary_id_field, concern_id) VALUES ($portal_user_id, $primaryId, $concern_id)");
        }
      }
    }
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
