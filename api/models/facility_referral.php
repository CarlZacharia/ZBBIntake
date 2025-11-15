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
        return Crypto::encrypt($value);
    }

    public function createReferral(array $referralData, array $contacts = [], ?array $guardianship = null, ?array $medicaid = null) {
        try {
            $this->conn->beginTransaction();

            $refStmt = $this->conn->prepare("
                INSERT INTO facility_referrals (
                    portal_user_id, facility_name, case_type, full_legal_name, date_of_birth, age,
                    ssn_encrypted, sex, home_address_encrypted, current_address_encrypted,
                    marital_status, monthly_income, physical_condition_encrypted,
                    mental_condition_encrypted, existing_estate_plan_encrypted,
                    reason_for_assistance_encrypted, deemed_incapacitated, incapacity_date,
                    medical_insurance_json, issues_encrypted, comments_encrypted
                ) VALUES (
                    :portal_user_id, :facility_name, :case_type, :full_legal_name, :date_of_birth, :age,
                    :ssn_encrypted, :sex, :home_address_encrypted, :current_address_encrypted,
                    :marital_status, :monthly_income, :physical_condition_encrypted,
                    :mental_condition_encrypted, :existing_estate_plan_encrypted,
                    :reason_for_assistance_encrypted, :deemed_incapacitated, :incapacity_date,
                    :medical_insurance_json, :issues_encrypted, :comments_encrypted
                )
            ");

            $refStmt->execute([
                ':portal_user_id' => $referralData['portal_user_id'] ?? null,
                ':facility_name' => $referralData['facility_name'] ?? null,
                ':case_type' => $referralData['case_type'],
                ':full_legal_name' => $referralData['full_legal_name'],
                ':date_of_birth' => $referralData['date_of_birth'] ?? null,
                ':age' => $referralData['age'] ?? null,
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
                ':medical_insurance_json' => isset($referralData['medical_insurance']) ? json_encode($referralData['medical_insurance']) : null,
                ':issues_encrypted' => $this->enc($referralData['issues'] ?? null),
                ':comments_encrypted' => $this->enc($referralData['comments'] ?? null)
            ]);

            $referralId = $this->conn->lastInsertId();

            if (!empty($contacts)) {
                $contactStmt = $this->conn->prepare("
                    INSERT INTO facility_contacts (referral_id, name_encrypted, telephone_encrypted, address_encrypted, email_encrypted)
                    VALUES (:referral_id, :name_encrypted, :telephone_encrypted, :address_encrypted, :email_encrypted)
                ");

                foreach ($contacts as $contact) {
                    $contactStmt->execute([
                        ':referral_id' => $referralId,
                        ':name_encrypted' => $this->enc($contact['name'] ?? null),
                        ':telephone_encrypted' => $this->enc($contact['telephone'] ?? null),
                        ':address_encrypted' => $this->enc($contact['address'] ?? null),
                        ':email_encrypted' => $this->enc($contact['email'] ?? null)
                    ]);
                }
            }

            if ($guardianship) {
                $guardianStmt = $this->conn->prepare("
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

                $guardianStmt->execute([
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

            if ($medicaid) {
                $medicaidStmt = $this->conn->prepare("
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

                $medicaidStmt->execute([
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

            $this->conn->commit();
            return $referralId;
        } catch (Exception $e) {
            $this->conn->rollBack();
            throw $e;
        }
    }
}
?>

