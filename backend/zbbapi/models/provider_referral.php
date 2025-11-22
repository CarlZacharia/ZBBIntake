<?php
/**
 * Facility Referral Model
 * Persists referral, guardianship, and Medicaid intake data
 */

require_once '../config/database.php';
require_once '../helpers/crypto.php';

class FacilityReferral {
    private $conn;

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    private function enc(?string $value): ?string {
        return $value !== null && $value !== '' ? Crypto::encrypt($value) : null;
    }

    private function dec(?string $value): ?string {
        return $value ? Crypto::decrypt($value) : null;
    }

  public function saveReferral(
    array $referralData,
    array $contacts = [],
    ?array $guardianship = null,
    ?array $medicaid = null,
    string $submissionStatus = 'submitted'
) {
    $submissionStatus = $submissionStatus === 'draft' ? 'draft' : 'submitted';

    try {
        $this->conn->beginTransaction();

        $referralId = $referralData['referral_id'] ?? null;
        $submittedAt = $submissionStatus === 'submitted' ? date('Y-m-d H:i:s') : null;

        if ($referralId) {
            $existingStmt = $this->conn->prepare("
                SELECT portal_user_id, submission_status, submitted_at
                FROM provider_referrals
                WHERE referral_id = :referral_id
            ");
            $existingStmt->execute([':referral_id' => $referralId]);
            $existing = $existingStmt->fetch(PDO::FETCH_ASSOC);

            if (!$existing) {
                throw new Exception('Referral not found');
            }

            // Prevent submitted referrals from reverting to draft
            if ($existing['submission_status'] === 'submitted') {
                $submissionStatus = 'submitted';
            }

            if ($submissionStatus === 'submitted') {
                $submittedAt = $existing['submitted_at'] ?? $submittedAt;
            } else {
                $submittedAt = null;
            }

            $updateStmt = $this->conn->prepare("
                UPDATE provider_referrals SET
                    provider_name = :provider_name,
                    provider_type = :provider_type,
                    case_type = :case_type,
                    full_legal_name = :full_legal_name,
                    date_of_birth = :date_of_birth,
                    age = :age,
                    ssn_encrypted = :ssn_encrypted,
                    sex = :sex,
                    home_address_encrypted = :home_address_encrypted,
                    current_address_encrypted = :current_address_encrypted,
                    marital_status = :marital_status,
                    monthly_income = :monthly_income,
                    physical_condition_encrypted = :physical_condition_encrypted,
                    mental_condition_encrypted = :mental_condition_encrypted,
                    existing_estate_plan_encrypted = :existing_estate_plan_encrypted,
                    reason_for_assistance_encrypted = :reason_for_assistance_encrypted,
                    deemed_incapacitated = :deemed_incapacitated,
                    incapacity_date = :incapacity_date,
                    spouse_name_encrypted = :spouse_name_encrypted,
                    spouse_address_encrypted = :spouse_address_encrypted,
                    spouse_phone_encrypted = :spouse_phone_encrypted,
                    spouse_email_encrypted = :spouse_email_encrypted,
                    spouse_dob = :spouse_dob,
                    spouse_age = :spouse_age,
                    spouse_sex = :spouse_sex,
                    spouse_living_conditions = :spouse_living_conditions,
                    spouse_health_encrypted = :spouse_health_encrypted,
                    medical_insurance_json = :medical_insurance_json,
                    issues_encrypted = :issues_encrypted,
                    comments_encrypted = :comments_encrypted,
                    submission_status = :submission_status,
                    submitted_at = :submitted_at,
                    updated_at = CURRENT_TIMESTAMP
                WHERE referral_id = :referral_id
            ");

            // Build params and remove portal_user_id since UPDATE doesn't use it
            $params = $this->buildReferralParams($referralData, [
                ':submission_status' => $submissionStatus,
                ':submitted_at' => $submittedAt,
                ':referral_id' => $referralId
            ]);
            unset($params[':portal_user_id']);

            $updateStmt->execute($params);

            $this->deleteChildRecords($referralId);
        } else {
            $insertStmt = $this->conn->prepare("
                INSERT INTO provider_referrals (
                    portal_user_id, provider_name, provider_type, case_type, full_legal_name, date_of_birth, age,
                    ssn_encrypted, sex, home_address_encrypted, current_address_encrypted,
                    marital_status, monthly_income, physical_condition_encrypted,
                    mental_condition_encrypted, existing_estate_plan_encrypted,
                    reason_for_assistance_encrypted, deemed_incapacitated, incapacity_date,
                    spouse_name_encrypted, spouse_address_encrypted, spouse_phone_encrypted,
                    spouse_email_encrypted, spouse_dob, spouse_age, spouse_sex,
                    spouse_living_conditions, spouse_health_encrypted,
                    medical_insurance_json, issues_encrypted, comments_encrypted,
                    submission_status, submitted_at
                ) VALUES (
                    :portal_user_id, :provider_name, :provider_type, :case_type, :full_legal_name, :date_of_birth, :age,
                    :ssn_encrypted, :sex, :home_address_encrypted, :current_address_encrypted,
                    :marital_status, :monthly_income, :physical_condition_encrypted,
                    :mental_condition_encrypted, :existing_estate_plan_encrypted,
                    :reason_for_assistance_encrypted, :deemed_incapacitated, :incapacity_date,
                    :spouse_name_encrypted, :spouse_address_encrypted, :spouse_phone_encrypted,
                    :spouse_email_encrypted, :spouse_dob, :spouse_age, :spouse_sex,
                    :spouse_living_conditions, :spouse_health_encrypted,
                    :medical_insurance_json, :issues_encrypted, :comments_encrypted,
                    :submission_status, :submitted_at
                )
            ");

            $insertParams = $this->buildReferralParams($referralData, [
                ':submission_status' => $submissionStatus,
                ':submitted_at' => $submittedAt
            ]);
            unset($insertParams[':referral_id']);
            $insertStmt->execute($insertParams);

            $referralId = (int)$this->conn->lastInsertId();
        }

        if (!empty($contacts)) {
            $this->insertContacts($referralId, $contacts);
        }

        if ($guardianship) {
            $this->insertGuardianship($referralId, $guardianship);
        }

        if ($medicaid) {
            $this->insertMedicaid($referralId, $medicaid);
        }

        $this->conn->commit();
        return $referralId;
    } catch (Exception $e) {
        $this->conn->rollBack();
        throw $e;
    }
}

    public function getReferralsByUser(int $portalUserId): array {
        $stmt = $this->conn->prepare("
            SELECT *
            FROM provider_referrals
            WHERE portal_user_id = :portal_user_id
            ORDER BY submission_status ASC, updated_at DESC
        ");
        $stmt->execute([':portal_user_id' => $portalUserId]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $results = [];

        foreach ($rows as $row) {
            $referralId = (int)$row['referral_id'];
            $results[] = [
                'referralId' => $referralId,
                'submissionStatus' => $row['submission_status'] ?? 'draft',
                'providerName' => $row['provider_name'],
                'providerType' => $row['provider_type'],
                'caseType' => $row['case_type'],
                'fullLegalName' => $row['full_legal_name'],
                'dateOfBirth' => $row['date_of_birth'],
                'age' => $row['age'],
                'sex' => $row['sex'],
                'maritalStatus' => $row['marital_status'],
                'homeAddress' => $this->dec($row['home_address_encrypted']),
                'currentAddress' => $this->dec($row['current_address_encrypted']),
                'monthlyIncome' => $row['monthly_income'],
                'physicalCondition' => $this->dec($row['physical_condition_encrypted']),
                'mentalCondition' => $this->dec($row['mental_condition_encrypted']),
                'existingEstatePlan' => $this->dec($row['existing_estate_plan_encrypted']),
                'reasonForAssistance' => $this->dec($row['reason_for_assistance_encrypted']),
                'deemedIncapacitated' => (bool)$row['deemed_incapacitated'],
                'incapacityDate' => $row['incapacity_date'],
                'medicalInsurance' => $row['medical_insurance_json'] ? json_decode($row['medical_insurance_json'], true) : [],
                'issues' => $this->dec($row['issues_encrypted']),
                'comments' => $this->dec($row['comments_encrypted']),
                'createdAt' => $row['created_at'],
                'submittedAt' => $row['submitted_at'],
                'contacts' => $this->fetchContacts($referralId),
                'guardianship' => $this->fetchGuardianship($referralId),
                'medicaid' => $this->fetchMedicaid($referralId),
                'spouse' => $this->buildSpousePayload($row)
            ];
        }

        return $results;
    }

private function buildReferralParams(array $referralData, array $extra = []): array {
    error_log('buildReferralParams - Input keys: ' . implode(', ', array_keys($referralData)));

    $age = $referralData['age'] ?? null;
    if ($age === '' || $age === null) {
        $age = null;
    }

    $payload = [
        ':portal_user_id' => $referralData['portal_user_id'] ?? null,
        ':provider_name' => $referralData['provider_name'] ?? null,
        ':provider_type' => $referralData['provider_type'] ?? null,
        ':case_type' => $referralData['case_type'] ?? null,
        ':full_legal_name' => $referralData['full_legal_name'],
        ':date_of_birth' => $referralData['date_of_birth'] ?? null,
        ':age' => $age !== null ? (int)$age : null,
        ':ssn_encrypted' => $this->enc($referralData['ssn'] ?? null),
        ':sex' => $referralData['sex'] ?? null,
        ':home_address_encrypted' => $this->enc($referralData['home_address'] ?? null),
        ':current_address_encrypted' => $this->enc($referralData['current_address'] ?? null),
        ':marital_status' => $referralData['marital_status'] ?? null,
        ':monthly_income' => $referralData['monthly_income'] ?? null,
        ':physical_condition_encrypted' => $this->enc($referralData['physical_condition'] ?? null),
        ':mental_condition_encrypted' => $this->enc($referralData['mental_condition'] ?? null),
        ':existing_estate_plan_encrypted' => $this->enc($referralData['existing_estate_plan'] ?? null),
        ':reason_for_assistance_encrypted' => $this->enc($referralData['reason_for_assistance'] ?? null),
        ':deemed_incapacitated' => !empty($referralData['deemed_incapacitated']),
        ':incapacity_date' => $referralData['incapacity_date'] ?? null,
        ':spouse_name_encrypted' => $this->enc($referralData['spouse_name'] ?? null),
        ':spouse_address_encrypted' => $this->enc($referralData['spouse_address'] ?? null),
        ':spouse_phone_encrypted' => $this->enc($referralData['spouse_phone'] ?? null),
        ':spouse_email_encrypted' => $this->enc($referralData['spouse_email'] ?? null),
        ':spouse_dob' => $referralData['spouse_dob'] ?? null,
        ':spouse_age' => isset($referralData['spouse_age']) && $referralData['spouse_age'] !== '' ? (int)$referralData['spouse_age'] : null,
        ':spouse_sex' => $referralData['spouse_sex'] ?? null,
        ':spouse_living_conditions' => $referralData['spouse_living_conditions'] ?? null,
        ':spouse_health_encrypted' => $this->enc($referralData['spouse_health'] ?? null),
        ':medical_insurance_json' => json_encode($referralData['medical_insurance'] ?? []),  // CHANGED: Added json_encode()
        ':issues_encrypted' => $this->enc($referralData['issues'] ?? null),
        ':comments_encrypted' => $this->enc($referralData['comments'] ?? null)
    ];

    $result = array_merge($payload, $extra);
    error_log('buildReferralParams - Output keys: ' . implode(', ', array_keys($result)));
    error_log('buildReferralParams - Output count: ' . count($result));

    return $result;
}

    private function deleteChildRecords(int $referralId): void {
        $this->conn->prepare("DELETE FROM provider_contacts WHERE referral_id = :referral_id")
            ->execute([':referral_id' => $referralId]);
        $this->conn->prepare("DELETE FROM guardianship_details WHERE referral_id = :referral_id")
            ->execute([':referral_id' => $referralId]);
        $this->conn->prepare("DELETE FROM medicaid_details WHERE referral_id = :referral_id")
            ->execute([':referral_id' => $referralId]);
    }

private function insertContacts(int $referralId, array $contacts): void {
    $stmt = $this->conn->prepare("
        INSERT INTO provider_contacts (
            referral_id, name_encrypted, telephone_encrypted, address_encrypted, csz_encrypted, county_encrypted, email_encrypted
        ) VALUES (
            :referral_id, :name_encrypted, :telephone_encrypted, :address_encrypted, :csz_encrypted, :county_encrypted, :email_encrypted
        )
    ");

    foreach ($contacts as $contact) {
        $stmt->execute([
            ':referral_id' => $referralId,
            ':name_encrypted' => $this->enc($contact['name'] ?? null),
            ':telephone_encrypted' => $this->enc($contact['telephone'] ?? null),
            ':address_encrypted' => $this->enc($contact['address'] ?? null),
            ':csz_encrypted' => $this->enc($contact['csz'] ?? null),
            ':county_encrypted' => $this->enc($contact['county'] ?? null),
            ':email_encrypted' => $this->enc($contact['email'] ?? null)
        ]);
    }
}

    private function insertGuardianship(int $referralId, array $guardianship): void {
        $stmt = $this->conn->prepare("
            INSERT INTO guardianship_details (
                referral_id, estate_plan_json, guardian_type, interested_family,
                interested_persons_encrypted, rep_payee_status, aware_of_assets,
                asset_notes_encrypted, notes_encrypted
            ) VALUES (
                :referral_id, :estate_plan_json, :guardian_type, :interested_family,
                :interested_persons_encrypted, :rep_payee_status, :aware_of_assets,
                :asset_notes_encrypted, :notes_encrypted
            )
        ");

        $stmt->execute([
            ':referral_id' => $referralId,
            ':estate_plan_json' => isset($guardianship['estate_plan']) ? json_encode(array_values($guardianship['estate_plan'])) : null,
            ':guardian_type' => $guardianship['guardian_type'] ?? null,
            ':interested_family' => isset($guardianship['interested_family']) ? (bool)$guardianship['interested_family'] : null,
            ':interested_persons_encrypted' => $this->enc($guardianship['interested_persons'] ?? null),
            ':rep_payee_status' => $guardianship['rep_payee_status'] ?? null,
            ':aware_of_assets' => $guardianship['aware_of_assets'] ?? null,
            ':asset_notes_encrypted' => $this->enc($guardianship['asset_notes'] ?? null),
            ':notes_encrypted' => $this->enc($guardianship['notes'] ?? null)
        ]);
    }

    private function insertMedicaid(int $referralId, array $medicaid): void {
        $stmt = $this->conn->prepare("
            INSERT INTO medicaid_details (
                referral_id, application_type, filed_by_encrypted, medicaid_case_number_encrypted,
                medicaid_application_number_encrypted, date_of_application, date_needed,
                private_pay_estimate, current_status, last_noca_received, noca_contents_encrypted,
                notes_encrypted
            ) VALUES (
                :referral_id, :application_type, :filed_by_encrypted, :medicaid_case_number_encrypted,
                :medicaid_application_number_encrypted, :date_of_application, :date_needed,
                :private_pay_estimate, :current_status, :last_noca_received, :noca_contents_encrypted,
                :notes_encrypted
            )
        ");

        $stmt->execute([
            ':referral_id' => $referralId,
            ':application_type' => $medicaid['application_type'] ?? null,
            ':filed_by_encrypted' => $this->enc($medicaid['filed_by'] ?? null),
            ':medicaid_case_number_encrypted' => $this->enc($medicaid['case_number'] ?? null),
            ':medicaid_application_number_encrypted' => $this->enc($medicaid['application_number'] ?? null),
            ':date_of_application' => $medicaid['date_of_application'] ?? null,
            ':date_needed' => $medicaid['date_needed'] ?? null,
            ':private_pay_estimate' => $medicaid['private_pay_estimate'] ?? null,
            ':current_status' => $medicaid['status'] ?? null,
            ':last_noca_received' => $medicaid['last_noca'] ?? null,
            ':noca_contents_encrypted' => $this->enc($medicaid['noca_contents'] ?? null),
            ':notes_encrypted' => $this->enc($medicaid['notes'] ?? null)
        ]);
    }

    private function fetchContacts(int $referralId): array {
        $stmt = $this->conn->prepare("
            SELECT name_encrypted, telephone_encrypted, address_encrypted, csz_encrypted, county_encrypted, email_encrypted
            FROM provider_contacts
            WHERE referral_id = :referral_id
            ORDER BY contact_id ASC
        ");
        $stmt->execute([':referral_id' => $referralId]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return array_map(function ($row) {
            return [
                'name' => $this->dec($row['name_encrypted']) ?? '',
                'telephone' => $this->dec($row['telephone_encrypted']) ?? '',
                'address' => $this->dec($row['address_encrypted']) ?? '',
                'email' => $this->dec($row['email_encrypted']) ?? ''
            ];
        }, $rows);
    }

    private function fetchGuardianship(int $referralId): ?array {
        $stmt = $this->conn->prepare("
            SELECT *
            FROM guardianship_details
            WHERE referral_id = :referral_id
            LIMIT 1
        ");
        $stmt->execute([':referral_id' => $referralId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            return null;
        }

        return [
            'estatePlan' => $row['estate_plan_json'] ? json_decode($row['estate_plan_json'], true) : [],
            'guardianType' => $row['guardian_type'],
            'interestedFamily' => $row['interested_family'] === null ? null : ($row['interested_family'] ? 'yes' : 'no'),
            'interestedPersons' => $this->dec($row['interested_persons_encrypted']),
            'repPayeeStatus' => $row['rep_payee_status'],
            'awareOfAssets' => $row['aware_of_assets'],
            'assetNotes' => $this->dec($row['asset_notes_encrypted']),
            'notes' => $this->dec($row['notes_encrypted'])
        ];
    }

    private function fetchMedicaid(int $referralId): ?array {
        $stmt = $this->conn->prepare("
            SELECT *
            FROM medicaid_details
            WHERE referral_id = :referral_id
            LIMIT 1
        ");
        $stmt->execute([':referral_id' => $referralId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            return null;
        }

        return [
            'applicationType' => $row['application_type'],
            'filedBy' => $this->dec($row['filed_by_encrypted']),
            'caseNumber' => $this->dec($row['medicaid_case_number_encrypted']),
            'applicationNumber' => $this->dec($row['medicaid_application_number_encrypted']),
            'dateOfApplication' => $row['date_of_application'],
            'dateNeeded' => $row['date_needed'],
            'privatePayEstimate' => $row['private_pay_estimate'],
            'status' => $row['current_status'],
            'lastNoca' => $row['last_noca_received'],
            'nocaContents' => $this->dec($row['noca_contents_encrypted']),
            'notes' => $this->dec($row['notes_encrypted'])
        ];
    }

    private function buildSpousePayload(array $row): ?array {
        if (
            empty($row['spouse_name_encrypted']) &&
            empty($row['spouse_address_encrypted']) &&
            empty($row['spouse_phone_encrypted']) &&
            empty($row['spouse_email_encrypted']) &&
            empty($row['spouse_dob']) &&
            empty($row['spouse_age']) &&
            empty($row['spouse_sex']) &&
            empty($row['spouse_living_conditions']) &&
            empty($row['spouse_health_encrypted'])
        ) {
            return null;
        }

        return [
            'name' => $this->dec($row['spouse_name_encrypted']),
            'address' => $this->dec($row['spouse_address_encrypted']),
            'phone' => $this->dec($row['spouse_phone_encrypted']),
            'email' => $this->dec($row['spouse_email_encrypted']),
            'dob' => $row['spouse_dob'],
            'age' => $row['spouse_age'],
            'sex' => $row['spouse_sex'],
            'livingConditions' => $row['spouse_living_conditions'],
            'health' => $this->dec($row['spouse_health_encrypted'])
        ];
    }
}
?>

