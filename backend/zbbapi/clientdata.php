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

  // Helper: get portal_user_id from GET or POST
  $portal_user_id = intval($_GET['id'] ?? $_POST['portal_user_id'] ?? 0);
  if (!$portal_user_id) {
      http_response_code(400);
      echo json_encode(['error' => 'Missing portal_user_id']);
      exit;
  }

  // Query each table for this client
  $client = $conn->query("SELECT * FROM client WHERE portal_user_id = $portal_user_id")->fetch_assoc();
  $personal = $conn->query("SELECT * FROM personal WHERE portal_user_id = $portal_user_id")->fetch_assoc();
  $marital_info = $conn->query("SELECT * FROM marital_info WHERE portal_user_id = $portal_user_id")->fetch_assoc();
  $children = $conn->query("SELECT * FROM child WHERE portal_user_id = $portal_user_id")->fetch_all(MYSQLI_ASSOC);
  $family_members = $conn->query("SELECT * FROM family_member WHERE portal_user_id = $portal_user_id")->fetch_all(MYSQLI_ASSOC);
  $charities = $conn->query("SELECT * FROM charity WHERE portal_user_id = $portal_user_id")->fetch_all(MYSQLI_ASSOC);
  $fiduciaries = $conn->query("SELECT * FROM fiduciary WHERE portal_user_id = $portal_user_id")->fetch_all(MYSQLI_ASSOC);
  $guardianship_preferences = $conn->query("SELECT * FROM guardianship_preferences WHERE portal_user_id = $portal_user_id")->fetch_assoc();
  $debts = $conn->query("SELECT * FROM debt WHERE portal_user_id = $portal_user_id")->fetch_all(MYSQLI_ASSOC);

  // For assets, combine multiple tables
  $assets = [
      'real_estate_holdings' => $conn->query("SELECT * FROM real_estate_holdings WHERE portal_user_id = $portal_user_id")->fetch_all(MYSQLI_ASSOC),
      'bank_account_holdings' => $conn->query("SELECT * FROM bank_account_holdings WHERE portal_user_id = $portal_user_id")->fetch_all(MYSQLI_ASSOC),
      'nq_account_holdings' => $conn->query("SELECT * FROM nq_account_holdings WHERE portal_user_id = $portal_user_id")->fetch_all(MYSQLI_ASSOC),
      'retirement_account_holdings' => $conn->query("SELECT * FROM retirement_account_holdings WHERE portal_user_id = $portal_user_id")->fetch_all(MYSQLI_ASSOC),
      'life_insurance_holdings' => $conn->query("SELECT * FROM life_insurance_holdings WHERE portal_user_id = $portal_user_id")->fetch_all(MYSQLI_ASSOC),
      'business_interest_holdings' => $conn->query("SELECT * FROM business_interest_holdings WHERE portal_user_id = $portal_user_id")->fetch_all(MYSQLI_ASSOC),
      'digital_asset_holdings' => $conn->query("SELECT * FROM digital_asset_holdings WHERE portal_user_id = $portal_user_id")->fetch_all(MYSQLI_ASSOC),
      'other_asset_holdings' => $conn->query("SELECT * FROM other_asset_holdings WHERE portal_user_id = $portal_user_id")->fetch_all(MYSQLI_ASSOC)
  ];

  // Build and return the full IClientData structure
  header('Content-Type: application/json');
  echo json_encode([
      'client' => $client,
      'personal' => $personal,
      'marital_info' => $marital_info,
      'children' => $children,
      'family_members' => $family_members,
      'charities' => $charities,
      'fiduciaries' => $fiduciaries,
      'guardianship_preferences' => $guardianship_preferences,
      'assets' => $assets,
      'debts' => $debts
  ]);
