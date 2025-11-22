<?php
/**
 * Facility Referral Submission
 * POST /api/facility/save-referral.php
 */

require_once '../cors.php';
require_once '../helpers/response.php';
require_once '../helpers/validator.php';
require_once '../helpers/jwt.php';
require_once '../models/provider_referral.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Method not allowed', 405);
}

try {
    $token = JWT::getBearerToken();
    if (!$token) {
        Response::error('Authentication required', 401);
    }

    $claims = JWT::decode($token);
    $portalUserId = $claims['user_id'] ?? null;

    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        Response::error('Invalid JSON payload', 400);
    }

$submissionStatus = $input['submissionStatus'] ?? 'submitted';
$allowedStatuses = ['draft', 'submitted'];
if (!in_array($submissionStatus, $allowedStatuses, true)) {
    Response::error('Invalid submission status provided', 400);
}

$caseType = $input['caseType'] ?? null;
$allowedCaseTypes = ['Guardianship', 'Medicaid', 'Both'];
if ($submissionStatus === 'submitted' && !in_array($caseType, $allowedCaseTypes)) {
    Response::error('Invalid case type supplied', 400);
}
if ($submissionStatus === 'draft' && $caseType !== null && !in_array($caseType, $allowedCaseTypes)) {
    Response::error('Invalid case type supplied for draft', 400);
    }

$sharedData = [
    'portal_user_id' => $portalUserId,
    'referral_id' => $input['referralId'] ?? null,
    'provider_name' => Validator::sanitize($input['providerName'] ?? ''),
    'provider_type' => Validator::sanitize($input['providerType'] ?? ''),
    'case_type' => $caseType,
    'full_legal_name' => Validator::sanitize($input['fullLegalName'] ?? ''),
    'date_of_birth' => $input['dateOfBirth'] ?? null,
    'age' => $input['age'] ?? null,
    'ssn' => $input['ssn'] ?? null,
    'sex' => $input['sex'] ?? null,
    'home_address' => $input['homeAddress'] ?? null,
    'current_address' => $input['currentAddress'] ?? null,
    'marital_status' => $input['maritalStatus'] ?? null,
    'monthly_income' => $input['monthlyIncome'] ?? null,
    'physical_condition' => $input['physicalCondition'] ?? null,
    'mental_condition' => $input['mentalCondition'] ?? null,
    'existing_estate_plan' => $input['existingEstatePlan'] ?? null,
    'reason_for_assistance' => Validator::sanitize($input['reasonForNeed'] ?? ''),
    'deemed_incapacitated' => $input['deemedIncapacitated'] ?? false,
    'incapacity_date' => $input['incapacityDate'] ?? null,
    'spouse_name' => Validator::sanitize($input['spouseName'] ?? ''),
    'spouse_address' => Validator::sanitize($input['spouseAddress'] ?? ''),
    'spouse_phone' => Validator::sanitize($input['spousePhone'] ?? ''),
    'spouse_email' => Validator::sanitize($input['spouseEmail'] ?? ''),
    'spouse_dob' => $input['spouseDob'] ?? null,
    'spouse_age' => $input['spouseAge'] ?? null,
    'spouse_sex' => $input['spouseSex'] ?? null,
    'spouse_living_conditions' => Validator::sanitize($input['spouseLivingConditions'] ?? ''),
    'spouse_health' => $input['spouseHealth'] ?? null,
    'medical_insurance' => json_encode($input['medicalInsurance'] ?? []),
    'issues' => $input['issues'] ?? null,
    'comments' => $input['comments'] ?? null
];

    if (empty($sharedData['full_legal_name'])) {
        Response::error('Full legal name is required', 400);
    }
if ($submissionStatus === 'submitted' && empty($sharedData['case_type'])) {
    Response::error('Case type is required to submit the referral', 400);
}
if (!is_array($sharedData['medical_insurance'])) {
    $sharedData['medical_insurance'] = [];
}
if (($sharedData['marital_status'] ?? '') !== 'Married') {
    $sharedData['spouse_name'] = null;
    $sharedData['spouse_address'] = null;
    $sharedData['spouse_phone'] = null;
    $sharedData['spouse_email'] = null;
    $sharedData['spouse_dob'] = null;
    $sharedData['spouse_age'] = null;
    $sharedData['spouse_sex'] = null;
    $sharedData['spouse_living_conditions'] = null;
    $sharedData['spouse_health'] = null;
}

    $contacts = [];
    if (!empty($input['contacts']) && is_array($input['contacts'])) {
        foreach ($input['contacts'] as $contact) {
            $contacts[] = [
                'name' => Validator::sanitize($contact['name'] ?? ''),
                'telephone' => Validator::sanitize($contact['telephone'] ?? ''),
                'address' => Validator::sanitize($contact['address'] ?? ''),
                'email' => Validator::sanitize($contact['email'] ?? '')
            ];
        }
    }

    $guardianship = null;
    if (!empty($input['guardianship'])) {
        $guardianship = [
        'estate_plan' => $input['guardianship']['estatePlan'] ?? [],
        'guardian_type' => $input['guardianship']['guardianType'] ?? null,
        'interested_family' => $input['guardianship']['interestedFamily'] ?? null,
        'interested_persons' => $input['guardianship']['interestedPersons'] ?? null,
        'rep_payee_status' => $input['guardianship']['repPayeeStatus'] ?? null,
        'aware_of_assets' => $input['guardianship']['awareOfAssets'] ?? null,
        'asset_notes' => $input['guardianship']['assetNotes'] ?? null,
        'notes' => $input['guardianship']['notes'] ?? null
        ];
    }

    $medicaid = null;
    if (!empty($input['medicaid'])) {
        $medicaid = [
            'application_type' => $input['medicaid']['applicationType'] ?? null,
            'filed_by' => $input['medicaid']['filedBy'] ?? null,
            'case_number' => $input['medicaid']['caseNumber'] ?? null,
            'application_number' => $input['medicaid']['applicationNumber'] ?? null,
            'date_of_application' => $input['medicaid']['dateOfApplication'] ?? null,
            'date_needed' => $input['medicaid']['dateNeeded'] ?? null,
            'private_pay_estimate' => $input['medicaid']['privatePayEstimate'] ?? null,
            'status' => $input['medicaid']['status'] ?? null,
            'last_noca' => $input['medicaid']['lastNocaReceived'] ?? null,
            'noca_contents' => $input['medicaid']['nocaContents'] ?? null,
            'notes' => $input['medicaid']['notes'] ?? null
        ];
    }

    $model = new FacilityReferral();
$referralId = $model->saveReferral($sharedData, $contacts, $guardianship, $medicaid, $submissionStatus);

Response::success($submissionStatus === 'draft' ? 'Draft saved successfully' : 'Referral saved successfully', [
        'referral_id' => $referralId
    ], 201);

} catch (Exception $e) {
    error_log('Facility referral save error: ' . $e->getMessage());
    Response::error('Unable to save referral data', 500);
}
?>

