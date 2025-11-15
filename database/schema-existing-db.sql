-- =====================================================
-- ZBB Intake Application - MariaDB Database Schema
-- FOR EXISTING DATABASE (Shared Hosting Compatible)
-- =====================================================
-- This schema is designed for use with existing database permissions
-- Does not create database or users - works with existing setup

-- Use the existing database (zbplans)
-- Note: Make sure you're connected to the correct database

-- =====================================================
-- CORE SYSTEM TABLES
-- =====================================================

-- Users table (Authentication & Basic Info)
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    suffix VARCHAR(10),
    phone VARCHAR(20),
    preferred_contact_method ENUM('email', 'phone', 'text') DEFAULT 'email',
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    profile_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_active (is_active),
    INDEX idx_created (date_created)
);

CREATE TABLE IF NOT EXISTS portal_users (
    portal_user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    suffix VARCHAR(10),
    phone VARCHAR(20),
    preferred_contact_method ENUM('email', 'phone', 'text') DEFAULT 'email',
    user_category ENUM('admin','zbb','enduser','facility') DEFAULT 'enduser',
    facility_name VARCHAR(255),
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    profile_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_portal_email (email),
    INDEX idx_portal_category (user_category)
);

-- Cases table (Main case records)
CREATE TABLE IF NOT EXISTS cases (
    case_id INT AUTO_INCREMENT PRIMARY KEY,
    user_account_id INT NOT NULL,
    status VARCHAR(50),
    completion_percentage DECIMAL(5,2) DEFAULT 0.00,
    assigned_attorney_id INT,
    referral_source VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_account_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user (user_account_id),
    INDEX idx_status (status),
    INDEX idx_completion (completion_percentage)
);

-- =====================================================
-- PERSONAL INFORMATION TABLES
-- =====================================================

-- Personal information
CREATE TABLE IF NOT EXISTS personal_info (
    personal_id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NOT NULL,
    legal_first_name VARCHAR(100) NOT NULL,
    legal_middle_name VARCHAR(100),
    legal_last_name VARCHAR(100) NOT NULL,
    suffix VARCHAR(10),
    preferred_name VARCHAR(100),
    date_of_birth DATE,
    ssn_encrypted VARCHAR(255), -- Encrypted SSN
    us_citizen BOOLEAN,
    citizenship_country VARCHAR(100) DEFAULT 'USA',
    years_at_address INT,
    mobile_phone VARCHAR(20),
    home_phone VARCHAR(20),
    email VARCHAR(255),
    preferred_contact_method ENUM('mobile', 'home', 'email', 'text'),
    occupation VARCHAR(255),
    employer_name VARCHAR(255),
    employer_address TEXT,
    military_service BOOLEAN DEFAULT FALSE,
    military_branch VARCHAR(100),
    military_service_dates VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(case_id) ON DELETE CASCADE,
    INDEX idx_case (case_id),
    INDEX idx_name (legal_last_name, legal_first_name)
);

-- Addresses (reusable for current and previous addresses)
CREATE TABLE IF NOT EXISTS addresses (
    address_id INT AUTO_INCREMENT PRIMARY KEY,
    personal_id INT NOT NULL,
    address_type ENUM('current', 'previous') NOT NULL,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(2) NOT NULL,
    zip VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (personal_id) REFERENCES personal_info(personal_id) ON DELETE CASCADE,
    INDEX idx_personal (personal_id),
    INDEX idx_type (address_type),
    INDEX idx_location (state, city)
);

-- Marital information
CREATE TABLE IF NOT EXISTS marital_info (
    marital_id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NOT NULL,
    marital_status ENUM('single', 'married', 'widowed', 'divorced', 'domestic_partnership'),
    spouse_legal_name VARCHAR(255),
    spouse_dob DATE,
    spouse_ssn_encrypted VARCHAR(255), -- Encrypted SSN
    marriage_date DATE,
    marriage_location VARCHAR(255),
    first_marriage BOOLEAN,
    prenup_exists BOOLEAN DEFAULT FALSE,
    prenup_document_id INT,
    postnup_exists BOOLEAN DEFAULT FALSE,
    postnup_document_id INT,
    spouse_has_other_children BOOLEAN,
    relationship_quality ENUM('excellent', 'good', 'strained', 'complicated'),
    divorce_obligations TEXT,
    divorce_decree_restrictions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(case_id) ON DELETE CASCADE,
    INDEX idx_case (case_id),
    INDEX idx_status (marital_status)
);

-- Previous marriages
CREATE TABLE IF NOT EXISTS previous_marriages (
    marriage_id INT AUTO_INCREMENT PRIMARY KEY,
    marital_id INT NOT NULL,
    spouse_name VARCHAR(255) NOT NULL,
    marriage_date DATE,
    divorce_date DATE,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (marital_id) REFERENCES marital_info(marital_id) ON DELETE CASCADE,
    INDEX idx_marital (marital_id)
);

-- =====================================================
-- FAMILY & RELATIONSHIPS TABLES
-- =====================================================

-- Children
CREATE TABLE IF NOT EXISTS children (
    child_id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NOT NULL,
    legal_first_name VARCHAR(100) NOT NULL,
    legal_middle_name VARCHAR(100),
    legal_last_name VARCHAR(100) NOT NULL,
    suffix VARCHAR(10),
    date_of_birth DATE,
    child_of ENUM('client', 'spouse', 'both') NOT NULL,
    child_comment TEXT,
    address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(2),
    zip VARCHAR(10),
    marital_status ENUM('single', 'married', 'divorced', 'widowed'),
    has_children BOOLEAN DEFAULT FALSE,
    special_needs BOOLEAN DEFAULT FALSE,
    special_needs_description TEXT,
    disabilities TEXT,
    relationship_quality ENUM('close', 'good', 'distant', 'estranged', 'complicated'),
    financially_responsible ENUM('very', 'somewhat', 'not_really', 'concerning'),
    substance_abuse_concerns BOOLEAN DEFAULT FALSE,
    gambling_concerns BOOLEAN DEFAULT FALSE,
    other_concerns TEXT,
    excluded_or_reduced BOOLEAN DEFAULT FALSE,
    exclusion_reason TEXT,
    is_deceased BOOLEAN DEFAULT FALSE,
    date_of_death DATE,
    surviving_spouse VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(case_id) ON DELETE CASCADE,
    INDEX idx_case (case_id),
    INDEX idx_name (legal_last_name, legal_first_name),
    INDEX idx_child_of (child_of)
);

-- Family members
CREATE TABLE IF NOT EXISTS family_members (
    family_id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NOT NULL,
    relationship ENUM('parent', 'sibling', 'other_dependent', 'close_friend', 'godchild', 'other') NOT NULL,
    legal_name VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    is_living BOOLEAN DEFAULT TRUE,
    date_of_death DATE,
    address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(2),
    zip VARCHAR(10),
    financial_support BOOLEAN DEFAULT FALSE,
    support_amount_monthly DECIMAL(10,2),
    special_needs BOOLEAN DEFAULT FALSE,
    caregiving_responsibilities BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(case_id) ON DELETE CASCADE,
    INDEX idx_case (case_id),
    INDEX idx_relationship (relationship),
    INDEX idx_living (is_living)
);

-- Charities
CREATE TABLE IF NOT EXISTS charities (
    charity_id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NOT NULL,
    organization_name VARCHAR(255) NOT NULL,
    ein_tax_id VARCHAR(20),
    charity_type ENUM('religious', 'educational', 'medical', 'environmental', 'animal_welfare', 'arts_culture', 'social_services', 'community', 'other') NOT NULL,
    mission_description TEXT,
    website VARCHAR(255),
    address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(2),
    zip VARCHAR(10),
    contact_person VARCHAR(255),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    current_donor BOOLEAN DEFAULT FALSE,
    annual_contribution_amount DECIMAL(10,2),
    years_supporting INT,
    personal_connection TEXT,
    intended_gift_type ENUM('percentage', 'specific_amount', 'specific_asset', 'residuary'),
    intended_percentage DECIMAL(5,2),
    intended_dollar_amount DECIMAL(12,2),
    intended_asset_description TEXT,
    gift_restrictions TEXT,
    memorial_gift BOOLEAN DEFAULT FALSE,
    memorial_name VARCHAR(255),
    endowment_fund BOOLEAN DEFAULT FALSE,
    endowment_purpose TEXT,
    recognition_preferences ENUM('anonymous', 'public', 'family_only'),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(case_id) ON DELETE CASCADE,
    INDEX idx_case (case_id),
    INDEX idx_type (charity_type),
    INDEX idx_donor (current_donor)
);

-- Fiduciaries
CREATE TABLE IF NOT EXISTS fiduciaries (
    appointment_id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NOT NULL,
    role_type ENUM('executor', 'trustee', 'financial_poa', 'healthcare_poa', 'guardian_person', 'guardian_property') NOT NULL,
    priority ENUM('primary', 'first_alternate', 'second_alternate', 'co_trustee') NOT NULL,
    appointee_name VARCHAR(255) NOT NULL,
    relationship VARCHAR(100),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    age INT,
    address TEXT,
    reasons_for_selection TEXT,
    limitations_or_instructions TEXT,
    act_jointly BOOLEAN,
    compensation_desired BOOLEAN,
    discussed_with_appointee BOOLEAN DEFAULT FALSE,
    health_concerns TEXT,
    conflict_concerns TEXT,
    effective_immediately BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(case_id) ON DELETE CASCADE,
    INDEX idx_case (case_id),
    INDEX idx_role (role_type),
    INDEX idx_priority (priority)
);

-- Guardian preferences
CREATE TABLE IF NOT EXISTS guardian_preferences (
    preference_id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NOT NULL,
    child_raising_values TEXT,
    location_importance TEXT,
    religious_upbringing_preferences TEXT,
    education_priorities TEXT,
    other_preferences TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(case_id) ON DELETE CASCADE,
    INDEX idx_case (case_id)
);

-- =====================================================
-- ASSET TABLES
-- =====================================================

-- Real Estate Holdings
CREATE TABLE IF NOT EXISTS real_estate (
    property_id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NOT NULL,
    property_type ENUM('primary_residence', 'vacation', 'rental', 'land', 'commercial', 'other') NOT NULL,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(2) NOT NULL,
    zip VARCHAR(10) NOT NULL,
    title_holding ENUM('client', 'spouse', 'joint_spouse', 'tenants_common', 'joint_rights_survivorship', 'tod_deed', 'trust', 'llc', 'other') NOT NULL,
    title_details TEXT,
    estimated_value DECIMAL(12,2),
    mortgage_balance DECIMAL(12,2),
    net_value DECIMAL(12,2),
    beneficiaries_on_deed TEXT,
    intended_beneficiary TEXT,
    special_notes TEXT,
    owned_by ENUM('client', 'spouse'),
    ownership_percentage DECIMAL(5,2),
    other_owners TEXT,
    ownership_value DECIMAL(12,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(case_id) ON DELETE CASCADE,
    INDEX idx_case (case_id),
    INDEX idx_type (property_type),
    INDEX idx_owner (owned_by),
    INDEX idx_location (state, city)
);

-- Financial Accounts
CREATE TABLE IF NOT EXISTS financial_accounts (
    account_id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NOT NULL,
    institution_name VARCHAR(255) NOT NULL,
    account_type ENUM('checking', 'savings', 'money_market', 'cd', 'brokerage', 'other_investment') NOT NULL,
    account_number_encrypted VARCHAR(255), -- Encrypted account number
    approximate_balance DECIMAL(12,2),
    title_type ENUM('individual', 'joint', 'pod', 'tod', 'trust', 'other') NOT NULL,
    joint_owner_name VARCHAR(255),
    beneficiary_last_reviewed DATE,
    notes TEXT,
    owned_by ENUM('client', 'spouse'),
    ownership_percentage DECIMAL(5,2),
    other_owners TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(case_id) ON DELETE CASCADE,
    INDEX idx_case (case_id),
    INDEX idx_type (account_type),
    INDEX idx_owner (owned_by),
    INDEX idx_institution (institution_name)
);

-- Retirement Accounts
CREATE TABLE IF NOT EXISTS retirement_accounts (
    retirement_id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NOT NULL,
    account_type ENUM('401k', '403b', 'traditional_ira', 'roth_ira', 'sep_ira', 'simple_ira', 'pension', 'annuity', 'other') NOT NULL,
    institution_name VARCHAR(255) NOT NULL,
    account_number_encrypted VARCHAR(255), -- Encrypted account number
    approximate_value DECIMAL(12,2),
    beneficiary_last_reviewed DATE,
    rmd_age_reached BOOLEAN DEFAULT FALSE,
    notes TEXT,
    owned_by ENUM('client', 'spouse'),
    ownership_percentage DECIMAL(5,2),
    other_owners TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(case_id) ON DELETE CASCADE,
    INDEX idx_case (case_id),
    INDEX idx_type (account_type),
    INDEX idx_owner (owned_by),
    INDEX idx_rmd (rmd_age_reached)
);

-- Life Insurance
CREATE TABLE IF NOT EXISTS life_insurance (
    policy_id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NOT NULL,
    insurance_company VARCHAR(255) NOT NULL,
    policy_type ENUM('term', 'whole_life', 'universal', 'variable', 'other') NOT NULL,
    policy_number VARCHAR(100),
    face_value DECIMAL(12,2) NOT NULL DEFAULT 0,
    death_benefit DECIMAL(12,2) NOT NULL DEFAULT 0,
    cash_value DECIMAL(12,2),
    owned_by_trust BOOLEAN DEFAULT FALSE,
    trust_name VARCHAR(255),
    annual_premium DECIMAL(10,2),
    notes TEXT,
    owned_by ENUM('client', 'spouse'),
    ownership_percentage DECIMAL(5,2),
    other_owners TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(case_id) ON DELETE CASCADE,
    INDEX idx_case (case_id),
    INDEX idx_type (policy_type),
    INDEX idx_owner (owned_by),
    INDEX idx_company (insurance_company)
);

-- Business Interests
CREATE TABLE IF NOT EXISTS business_interests (
    business_id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    business_type ENUM('llc', 's_corp', 'c_corp', 'partnership', 'sole_prop', 'other') NOT NULL,
    ownership_percentage DECIMAL(5,2),
    estimated_value DECIMAL(12,2),
    has_other_owners BOOLEAN DEFAULT FALSE,
    other_owners_names TEXT,
    buy_sell_agreement_exists BOOLEAN DEFAULT FALSE,
    buy_sell_document_id INT,
    succession_plan_exists BOOLEAN DEFAULT FALSE,
    business_vision_after_death TEXT,
    intended_successor VARCHAR(255),
    successor_is_family BOOLEAN,
    should_business_be_sold BOOLEAN,
    notes TEXT,
    owned_by ENUM('client', 'spouse'),
    other_owners TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(case_id) ON DELETE CASCADE,
    INDEX idx_case (case_id),
    INDEX idx_type (business_type),
    INDEX idx_owner (owned_by),
    INDEX idx_name (business_name)
);

-- Digital Assets
CREATE TABLE IF NOT EXISTS digital_assets (
    digital_id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NOT NULL,
    asset_type ENUM('email', 'social_media', 'cryptocurrency', 'nft', 'domain', 'website', 'online_business', 'cloud_storage', 'password_manager', 'digital_media', 'loyalty_programs', 'other') NOT NULL,
    asset_name VARCHAR(255) NOT NULL,
    platform_or_service VARCHAR(255),
    estimated_value DECIMAL(12,2),
    username VARCHAR(255),
    access_location TEXT, -- Encrypted location info
    wallet_type VARCHAR(100),
    seed_phrase_location TEXT, -- Encrypted seed phrase location
    intended_disposition ENUM('delete', 'preserve', 'transfer', 'memorialize'),
    access_instructions TEXT,
    notes TEXT,
    owned_by ENUM('client', 'spouse'),
    ownership_percentage DECIMAL(5,2),
    other_owners TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(case_id) ON DELETE CASCADE,
    INDEX idx_case (case_id),
    INDEX idx_type (asset_type),
    INDEX idx_owner (owned_by),
    INDEX idx_platform (platform_or_service)
);

-- Other Assets
CREATE TABLE IF NOT EXISTS other_assets (
    asset_id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NOT NULL,
    asset_type ENUM('vehicle', 'boat', 'rv', 'motorcycle', 'aircraft', 'art', 'antiques', 'jewelry', 'collectibles', 'wine', 'precious_metals', 'intellectual_property', 'livestock', 'farm_equipment', 'timeshare', 'other') NOT NULL,
    description TEXT NOT NULL,
    estimated_value DECIMAL(12,2),
    is_heirloom BOOLEAN DEFAULT FALSE,
    intended_recipient VARCHAR(255),
    special_instructions TEXT,
    appraisal_exists BOOLEAN DEFAULT FALSE,
    appraisal_date DATE,
    owned_by ENUM('client', 'spouse'),
    ownership_percentage DECIMAL(5,2),
    other_owners TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(case_id) ON DELETE CASCADE,
    INDEX idx_case (case_id),
    INDEX idx_type (asset_type),
    INDEX idx_owner (owned_by),
    INDEX idx_heirloom (is_heirloom)
);

CREATE TABLE IF NOT EXISTS facility_referrals (
    referral_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    portal_user_id INT NULL,
    facility_name VARCHAR(255),
    case_type ENUM('Guardianship','Medicaid','Both') NOT NULL,
    full_legal_name VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    age INT,
    ssn_encrypted TEXT,
    sex VARCHAR(20),
    home_address_encrypted TEXT,
    current_address_encrypted TEXT,
    marital_status VARCHAR(50),
    monthly_income VARCHAR(50),
    physical_condition_encrypted TEXT,
    mental_condition_encrypted TEXT,
    existing_estate_plan_encrypted TEXT,
    reason_for_assistance_encrypted TEXT,
    deemed_incapacitated BOOLEAN DEFAULT FALSE,
    incapacity_date DATE,
    medical_insurance_json JSON,
    issues_encrypted TEXT,
    comments_encrypted TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (portal_user_id) REFERENCES portal_users(portal_user_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS facility_contacts (
    contact_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    referral_id BIGINT NOT NULL,
    name_encrypted TEXT,
    telephone_encrypted TEXT,
    address_encrypted TEXT,
    email_encrypted TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (referral_id) REFERENCES facility_referrals(referral_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS guardianship_details (
    guardianship_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    referral_id BIGINT NOT NULL,
    estate_plan_json JSON,
    guardian_type ENUM('person','property','plenary'),
    interested_family BOOLEAN,
    interested_persons_encrypted TEXT,
    rep_payee_status ENUM('yes','no','applied'),
    aware_of_assets ENUM('yes','no','unsure'),
    asset_notes_encrypted TEXT,
    notes_encrypted TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (referral_id) REFERENCES facility_referrals(referral_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS medicaid_details (
    medicaid_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    referral_id BIGINT NOT NULL,
    application_type ENUM('new','renewal'),
    filed_by_encrypted TEXT,
    medicaid_case_number_encrypted TEXT,
    medicaid_application_number_encrypted TEXT,
    date_of_application DATE,
    date_needed DATE,
    private_pay_estimate DECIMAL(12,2),
    current_status ENUM('notFiled','filed','pending','denied','unsure'),
    last_noca_received DATE,
    noca_contents_encrypted TEXT,
    notes_encrypted TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (referral_id) REFERENCES facility_referrals(referral_id) ON DELETE CASCADE
);

-- =====================================================
-- BENEFICIARY MANAGEMENT TABLES
-- =====================================================

-- Beneficiaries (Links assets to beneficiaries)
CREATE TABLE IF NOT EXISTS beneficiaries (
    beneficiary_id INT AUTO_INCREMENT PRIMARY KEY,
    asset_type ENUM('financial_account', 'retirement_account', 'life_insurance') NOT NULL,
    asset_id INT NOT NULL,
    beneficiary_category ENUM('primary', 'contingent') NOT NULL,
    beneficiary_type ENUM('child', 'spouse', 'family_member', 'other') NOT NULL,
    child_id INT,
    spouse_id INT, -- Could reference marital_info or separate spouse table
    family_member_id INT,
    other_name VARCHAR(255),
    percentage DECIMAL(5,2) NOT NULL,
    calculated_value DECIMAL(12,2),
    per_stirpes BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (child_id) REFERENCES children(child_id) ON DELETE SET NULL,
    FOREIGN KEY (family_member_id) REFERENCES family_members(family_id) ON DELETE SET NULL,
    INDEX idx_asset (asset_type, asset_id),
    INDEX idx_beneficiary_type (beneficiary_type),
    INDEX idx_category (beneficiary_category)
);

-- =====================================================
-- SYSTEM & AUDIT TABLES
-- =====================================================

-- User sessions (for token management)
CREATE TABLE IF NOT EXISTS user_sessions (
    session_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    refresh_token_hash VARCHAR(255),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_agent TEXT,
    ip_address VARCHAR(45),
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_token (token_hash),
    INDEX idx_expires (expires_at),
    INDEX idx_active (is_active)
);

-- Password reset tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    token_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_token (token),
    INDEX idx_expires (expires_at)
);

-- Email verification tokens
CREATE TABLE IF NOT EXISTS email_verification_tokens (
    token_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_token (token),
    INDEX idx_expires (expires_at)
);

-- Audit log for tracking changes
CREATE TABLE IF NOT EXISTS audit_log (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    case_id INT,
    table_name VARCHAR(100) NOT NULL,
    record_id INT,
    action ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    old_values JSON,
    new_values JSON,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (case_id) REFERENCES cases(case_id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_case (case_id),
    INDEX idx_table (table_name),
    INDEX idx_timestamp (timestamp),
    INDEX idx_action (action)
);

-- =====================================================
-- STORED PROCEDURES & FUNCTIONS
-- =====================================================

-- Note: Some shared hosting environments may not allow creation of functions/procedures
-- If you get permission errors, you can skip this section and implement the logic in your application

-- Function to calculate total estate value for a case
DROP FUNCTION IF EXISTS calculate_total_estate_value;

DELIMITER //
CREATE FUNCTION calculate_total_estate_value(case_id_param INT)
RETURNS DECIMAL(15,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE total_value DECIMAL(15,2) DEFAULT 0;

    SELECT
        COALESCE(SUM(ownership_value), 0) +
        COALESCE((SELECT SUM(approximate_balance) FROM financial_accounts WHERE case_id = case_id_param), 0) +
        COALESCE((SELECT SUM(approximate_value) FROM retirement_accounts WHERE case_id = case_id_param), 0) +
        COALESCE((SELECT SUM(death_benefit) FROM life_insurance WHERE case_id = case_id_param), 0) +
        COALESCE((SELECT SUM(estimated_value) FROM business_interests WHERE case_id = case_id_param), 0) +
        COALESCE((SELECT SUM(estimated_value) FROM digital_assets WHERE case_id = case_id_param), 0) +
        COALESCE((SELECT SUM(estimated_value) FROM other_assets WHERE case_id = case_id_param), 0)
    INTO total_value
    FROM real_estate
    WHERE case_id = case_id_param;

    RETURN COALESCE(total_value, 0);
END //
DELIMITER ;

-- Procedure to update completion percentage
DROP PROCEDURE IF EXISTS update_completion_percentage;

DELIMITER //
CREATE PROCEDURE update_completion_percentage(IN case_id_param INT)
BEGIN
    DECLARE completion_pct DECIMAL(5,2) DEFAULT 0;
    DECLARE section_count INT DEFAULT 0;
    DECLARE completed_sections INT DEFAULT 0;

    -- Count total sections (adjust based on your requirements)
    SET section_count = 7; -- personal, marital, children, family, charities, fiduciaries, assets

    -- Check personal info completion
    IF EXISTS (SELECT 1 FROM personal_info WHERE case_id = case_id_param
               AND legal_first_name IS NOT NULL AND legal_last_name IS NOT NULL
               AND date_of_birth IS NOT NULL) THEN
        SET completed_sections = completed_sections + 1;
    END IF;

    -- Check marital info completion
    IF EXISTS (SELECT 1 FROM marital_info WHERE case_id = case_id_param
               AND marital_status IS NOT NULL) THEN
        SET completed_sections = completed_sections + 1;
    END IF;

    -- Check if children section is addressed
    IF EXISTS (SELECT 1 FROM children WHERE case_id = case_id_param) OR
       NOT EXISTS (SELECT 1 FROM marital_info WHERE case_id = case_id_param AND marital_status = 'married') THEN
        SET completed_sections = completed_sections + 1;
    END IF;

    -- Check family members
    SET completed_sections = completed_sections + 1; -- Always count as optional

    -- Check charities
    SET completed_sections = completed_sections + 1; -- Always count as optional

    -- Check fiduciaries
    IF EXISTS (SELECT 1 FROM fiduciaries WHERE case_id = case_id_param) THEN
        SET completed_sections = completed_sections + 1;
    END IF;

    -- Check assets (at least one asset type)
    IF EXISTS (SELECT 1 FROM real_estate WHERE case_id = case_id_param) OR
       EXISTS (SELECT 1 FROM financial_accounts WHERE case_id = case_id_param) OR
       EXISTS (SELECT 1 FROM retirement_accounts WHERE case_id = case_id_param) OR
       EXISTS (SELECT 1 FROM life_insurance WHERE case_id = case_id_param) OR
       EXISTS (SELECT 1 FROM business_interests WHERE case_id = case_id_param) OR
       EXISTS (SELECT 1 FROM digital_assets WHERE case_id = case_id_param) OR
       EXISTS (SELECT 1 FROM other_assets WHERE case_id = case_id_param) THEN
        SET completed_sections = completed_sections + 1;
    END IF;

    -- Calculate percentage
    SET completion_pct = (completed_sections / section_count) * 100;

    -- Update the case
    UPDATE cases SET completion_percentage = completion_pct WHERE case_id = case_id_param;
END //
DELIMITER ;

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Note: Some shared hosting environments may not allow creation of triggers
-- If you get permission errors, you can skip this section

-- Update completion percentage when personal info changes
DROP TRIGGER IF EXISTS personal_info_completion_update;

DELIMITER //
CREATE TRIGGER personal_info_completion_update
AFTER INSERT ON personal_info
FOR EACH ROW
BEGIN
    CALL update_completion_percentage(NEW.case_id);
END //
DELIMITER ;

DROP TRIGGER IF EXISTS personal_info_completion_update_on_change;

DELIMITER //
CREATE TRIGGER personal_info_completion_update_on_change
AFTER UPDATE ON personal_info
FOR EACH ROW
BEGIN
    CALL update_completion_percentage(NEW.case_id);
END //
DELIMITER ;

-- Update cases timestamp when any related data changes
DROP TRIGGER IF EXISTS update_case_timestamp_personal;

DELIMITER //
CREATE TRIGGER update_case_timestamp_personal
AFTER UPDATE ON personal_info
FOR EACH ROW
BEGIN
    UPDATE cases SET updated_at = CURRENT_TIMESTAMP WHERE case_id = NEW.case_id;
END //
DELIMITER ;

-- =====================================================
-- INITIAL DATA & CONFIGURATION
-- =====================================================

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cases_user_status ON cases(user_account_id, status);
CREATE INDEX IF NOT EXISTS idx_personal_case_name ON personal_info(case_id, legal_last_name, legal_first_name);
CREATE INDEX IF NOT EXISTS idx_children_case_name ON children(case_id, legal_last_name, legal_first_name);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Show created tables
SELECT TABLE_NAME, TABLE_ROWS, CREATE_TIME
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;

-- =====================================================
-- NOTES FOR SHARED HOSTING
-- =====================================================
/*
1. This script uses CREATE TABLE IF NOT EXISTS to avoid errors if tables already exist
2. Removed CREATE DATABASE command since you're using an existing database
3. Removed user creation commands since you have existing database credentials
4. Added DROP statements before creating functions/procedures to handle re-runs
5. Some hosting providers may restrict function/procedure/trigger creation
6. If you get permission errors on functions/procedures, implement the logic in your application instead
7. Make sure to connect to the zbplans database before running this script
*/
