<?php
/**
 * estateplan.php
 * API endpoint for estate plan CRUD operations
 *
 * GET  ?id={portal_user_id} - Load estate plan for user
 * POST ?id={portal_user_id} - Save estate plan for user
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database connection - adjust these to match your configuration
require_once 'db_config.php'; // Your existing DB config file

// Get portal_user_id from query string
$portal_user_id = isset($_GET['id']) ? intval($_GET['id']) : null;

if (!$portal_user_id) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing portal_user_id parameter']);
    exit();
}

// Connect to database
try {
    $pdo = new PDO(
        "mysql:host=$db_host;dbname=$db_name;charset=utf8mb4",
        $db_user,
        $db_pass,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit();
}

// ============ GET - Load Estate Plan ============
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $pdo->prepare("
            SELECT plan_data, updated_at
            FROM estate_plans
            WHERE portal_user_id = ?
        ");
        $stmt->execute([$portal_user_id]);
        $row = $stmt->fetch();

        if ($row) {
            // Return the JSON plan_data directly
            $planData = json_decode($row['plan_data'], true);
            $planData['lastUpdated'] = $row['updated_at'];
            echo json_encode($planData);
        } else {
            // Return empty estate plan structure
            echo json_encode([
                'lastUpdated' => null,
                'clientWill' => null,
                'spouseWill' => null,
                'trusts' => [],
                'clientFinancialPOA' => null,
                'spouseFinancialPOA' => null,
                'clientHealthcarePOA' => null,
                'spouseHealthcarePOA' => null,
                'fiduciaryPool' => []
            ]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to load estate plan', 'details' => $e->getMessage()]);
    }
    exit();
}

// ============ POST - Save Estate Plan ============
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get JSON body
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (!$data) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON data']);
        exit();
    }

    try {
        // Start transaction
        $pdo->beginTransaction();

        // Update timestamp
        $data['lastUpdated'] = date('Y-m-d H:i:s');
        $planJson = json_encode($data);

        // Upsert estate plan (insert or update)
        $stmt = $pdo->prepare("
            INSERT INTO estate_plans (portal_user_id, plan_data)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE
                plan_data = VALUES(plan_data),
                updated_at = CURRENT_TIMESTAMP
        ");
        $stmt->execute([$portal_user_id, $planJson]);

        // Optionally sync document metadata to estate_plan_documents table
        // This allows for reporting without parsing JSON
        syncDocumentMetadata($pdo, $portal_user_id, $data);

        $pdo->commit();

        // Return success with updated data
        echo json_encode([
            'success' => true,
            'lastUpdated' => $data['lastUpdated'],
            'message' => 'Estate plan saved successfully'
        ]);

    } catch (PDOException $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save estate plan', 'details' => $e->getMessage()]);
    }
    exit();
}

// Unsupported method
http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
exit();

/**
 * Sync document metadata to estate_plan_documents table for reporting
 */
function syncDocumentMetadata($pdo, $portal_user_id, $planData) {
    // Clear existing document records for this user
    $stmt = $pdo->prepare("DELETE FROM estate_plan_documents WHERE portal_user_id = ?");
    $stmt->execute([$portal_user_id]);

    $insertStmt = $pdo->prepare("
        INSERT INTO estate_plan_documents
        (portal_user_id, document_type, document_name, date_executed, state)
        VALUES (?, ?, ?, ?, ?)
    ");

    // Client Will
    if (!empty($planData['clientWill'])) {
        $will = $planData['clientWill'];
        $insertStmt->execute([
            $portal_user_id,
            'ClientWill',
            null,
            $will['dateExecuted'] ?? null,
            $will['state'] ?? null
        ]);
    }

    // Spouse Will
    if (!empty($planData['spouseWill'])) {
        $will = $planData['spouseWill'];
        $insertStmt->execute([
            $portal_user_id,
            'SpouseWill',
            null,
            $will['dateExecuted'] ?? null,
            $will['state'] ?? null
        ]);
    }

    // Trusts
    if (!empty($planData['trusts']) && is_array($planData['trusts'])) {
        foreach ($planData['trusts'] as $trust) {
            $insertStmt->execute([
                $portal_user_id,
                'Trust',
                $trust['name'] ?? null,
                $trust['dateExecuted'] ?? null,
                $trust['state'] ?? null
            ]);
        }
    }

    // Client Financial POA
    if (!empty($planData['clientFinancialPOA'])) {
        $poa = $planData['clientFinancialPOA'];
        $insertStmt->execute([
            $portal_user_id,
            'ClientFinancialPOA',
            null,
            $poa['dateExecuted'] ?? null,
            $poa['state'] ?? null
        ]);
    }

    // Spouse Financial POA
    if (!empty($planData['spouseFinancialPOA'])) {
        $poa = $planData['spouseFinancialPOA'];
        $insertStmt->execute([
            $portal_user_id,
            'SpouseFinancialPOA',
            null,
            $poa['dateExecuted'] ?? null,
            $poa['state'] ?? null
        ]);
    }

    // Client Healthcare
    if (!empty($planData['clientHealthcarePOA'])) {
        $hc = $planData['clientHealthcarePOA'];
        $insertStmt->execute([
            $portal_user_id,
            'ClientHealthcare',
            null,
            $hc['dateExecuted'] ?? null,
            $hc['state'] ?? null
        ]);
    }

    // Spouse Healthcare
    if (!empty($planData['spouseHealthcarePOA'])) {
        $hc = $planData['spouseHealthcarePOA'];
        $insertStmt->execute([
            $portal_user_id,
            'SpouseHealthcare',
            null,
            $hc['dateExecuted'] ?? null,
            $hc['state'] ?? null
        ]);
    }
}
?>
