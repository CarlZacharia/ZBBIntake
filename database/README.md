# ZBB Intake Database Schema Documentation

## Overview
This document describes the MariaDB database schema for the ZBB Intake application. The schema is designed to support the complete estate planning intake process with proper data normalization, security considerations, and performance optimization.

## Database Design Principles

### 1. **Data Normalization**
- **Third Normal Form (3NF)** compliance to minimize redundancy
- **Separate tables** for related entities (addresses, previous marriages, beneficiaries)
- **Proper foreign key relationships** to maintain referential integrity

### 2. **Security Considerations**
- **Encrypted fields** for sensitive data (SSN, account numbers)
- **Password hashing** with bcrypt or similar
- **Audit logging** for all data changes
- **Session management** for token-based authentication

### 3. **Performance Optimization**
- **Strategic indexing** on frequently queried columns
- **Computed columns** for derived values (net_value, ownership_value)
- **Full-text search** indexes for name and description fields
- **Partitioning ready** for future scaling

## Table Structure

### Core System Tables

#### `users`
- **Purpose**: User authentication and basic profile information
- **Key Features**:
  - Email-based authentication
  - Profile completion tracking
  - Contact preferences
  - Account status management

#### `cases`
- **Purpose**: Main case records linking users to their intake data
- **Key Features**:
  - One-to-one relationship with users (typically)
  - Completion percentage tracking
  - Attorney assignment capability
  - Status management

### Personal Information Tables

#### `personal_info`
- **Purpose**: Core personal details for the client
- **Security**: SSN encryption at application level
- **Features**: Complete name, contact, and demographic information

#### `addresses`
- **Purpose**: Reusable address storage for current and previous addresses
- **Design**: Normalized to avoid duplication
- **Types**: Current address and previous addresses

#### `marital_info`
- **Purpose**: Marriage and relationship status information
- **Features**: Spouse details, marriage history, legal documents

#### `previous_marriages`
- **Purpose**: Historical marriage data
- **Relationship**: One-to-many with marital_info

### Family & Relationship Tables

#### `children`
- **Purpose**: Client's children information
- **Features**:
  - Relationship tracking (client/spouse/both)
  - Special needs considerations
  - Relationship quality assessment
  - Inheritance considerations

#### `family_members`
- **Purpose**: Extended family and dependents
- **Features**: Financial support tracking, caregiving responsibilities

#### `charities`
- **Purpose**: Charitable organizations for estate planning
- **Features**:
  - Complete organization details
  - Giving history and intentions
  - Gift structuring options

#### `fiduciaries`
- **Purpose**: Trusted individuals for various roles
- **Features**: Role-based appointments, priority ordering

#### `guardian_preferences`
- **Purpose**: Child-rearing values and preferences
- **Relationship**: One-to-one with cases

### Asset Management Tables

#### `real_estate`
- **Purpose**: Real property holdings
- **Features**:
  - Automatic net value calculation
  - Ownership percentage tracking
  - Title holding structure

#### `financial_accounts`
- **Purpose**: Bank and investment accounts
- **Security**: Encrypted account numbers
- **Features**: Beneficiary designation support

#### `retirement_accounts`
- **Purpose**: 401k, IRA, and pension accounts
- **Features**: RMD tracking, beneficiary management

#### `life_insurance`
- **Purpose**: Life insurance policies
- **Features**: Multiple benefit types, trust ownership

#### `business_interests`
- **Purpose**: Business ownership and succession planning
- **Features**: Valuation, succession planning, buy-sell agreements

#### `digital_assets`
- **Purpose**: Digital property and online accounts
- **Security**: Encrypted access information
- **Features**: Disposition planning

#### `other_assets`
- **Purpose**: Miscellaneous property (vehicles, collectibles, etc.)
- **Features**: Heirloom designation, appraisal tracking

### Beneficiary Management

#### `beneficiaries`
- **Purpose**: Links assets to beneficiaries
- **Features**:
  - Supports multiple asset types
  - Primary/contingent designation
  - Percentage allocation with validation
  - Per stirpes designation

### System Tables

#### `user_sessions`
- **Purpose**: JWT token management
- **Features**: Token validation, expiration tracking, device management

#### `password_reset_tokens`
- **Purpose**: Secure password reset workflow
- **Features**: Time-limited tokens, single-use validation

#### `email_verification_tokens`
- **Purpose**: Email address verification
- **Features**: Account activation workflow

#### `audit_log`
- **Purpose**: Complete change tracking
- **Features**: JSON-based old/new value storage, user attribution

## Key Features

### 1. **Automatic Calculations**
```sql
-- Real estate net value
net_value DECIMAL(12,2) GENERATED ALWAYS AS (estimated_value - IFNULL(mortgage_balance, 0)) STORED

-- Ownership value calculation
ownership_value DECIMAL(12,2) GENERATED ALWAYS AS (net_value * IFNULL(ownership_percentage, 100) / 100) STORED
```

### 2. **Data Integrity Constraints**
- Foreign key relationships with CASCADE deletes
- Check constraints for percentage validations
- NOT NULL constraints for required fields
- ENUM constraints for controlled vocabularies

### 3. **Performance Features**
- Strategic indexes on frequently queried columns
- Full-text search capabilities
- Optimized for the application's query patterns

### 4. **Security Features**
- Encrypted sensitive data fields
- Audit trail for all changes
- Session management for authentication
- Proper access control structure

## Stored Procedures and Functions

### `calculate_total_estate_value(case_id)`
- **Purpose**: Calculate total estate value across all asset types
- **Returns**: DECIMAL(15,2) representing total estate value
- **Usage**: Used for estate planning calculations and reporting

### `update_completion_percentage(case_id)`
- **Purpose**: Automatically calculate completion percentage based on filled sections
- **Logic**: Evaluates completion of personal, marital, family, and asset sections
- **Triggers**: Automatically called when key data is updated

## Triggers

### Automatic Updates
- **Completion tracking**: Updates case completion percentage when sections are completed
- **Timestamp management**: Updates case timestamps when any related data changes
- **Data validation**: Ensures data consistency across related tables

## Indexing Strategy

### Primary Indexes
- All tables have optimized primary keys
- Foreign key indexes for join performance
- Composite indexes for common query patterns

### Search Indexes
- Full-text indexes on name fields
- Location-based indexes (state, city)
- Status and type-based indexes

### Performance Indexes
```sql
-- User and case relationship
CREATE INDEX idx_cases_user_status ON cases(user_account_id, status);

-- Name-based searches
CREATE INDEX idx_personal_case_name ON personal_info(case_id, legal_last_name, legal_first_name);

-- Asset queries
CREATE INDEX idx_real_estate_case_type ON real_estate(case_id, property_type);
```

## Data Types and Constraints

### Financial Fields
- **DECIMAL(12,2)** for monetary values (supports up to $999,999,999.99)
- **DECIMAL(5,2)** for percentages (0.00 to 100.00)

### Text Fields
- **VARCHAR** with appropriate lengths for structured data
- **TEXT** for longer descriptive content
- **JSON** for complex structured data in audit logs

### Date Fields
- **DATE** for birth dates, marriage dates, etc.
- **TIMESTAMP** for system tracking (created_at, updated_at)

### Security Fields
- **VARCHAR(255)** for encrypted data
- **VARCHAR(255)** for hashed passwords and tokens

## Implementation Notes

### 1. **Application-Level Encryption**
```typescript
// Example: Encrypting SSN before database storage
const encryptedSSN = await encrypt(ssn, encryptionKey);
```

### 2. **Token Management**
- JWT tokens stored as hashes in user_sessions table
- Refresh token rotation for enhanced security
- Automatic cleanup of expired tokens

### 3. **Backup Strategy**
- Regular automated backups
- Point-in-time recovery capability
- Encrypted backup storage

### 4. **Monitoring and Maintenance**
- Performance monitoring on key queries
- Regular OPTIMIZE TABLE operations
- Index usage analysis

## Future Enhancements

### 1. **Scalability Considerations**
- Table partitioning by date for large datasets
- Read replicas for reporting
- Connection pooling optimization

### 2. **Additional Features**
- Document storage integration
- Advanced reporting tables
- Data warehouse integration

### 3. **Security Enhancements**
- Database-level encryption
- Advanced audit logging
- Role-based access control

## Migration and Deployment

### 1. **Database Setup**
```bash
# Create database and run schema
mysql -u root -p < schema.sql

# Create application user
mysql -u root -p -e "
CREATE USER 'zbb_app'@'localhost' IDENTIFIED BY 'secure_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON zbb_intake.* TO 'zbb_app'@'localhost';
FLUSH PRIVILEGES;"
```

### 2. **Environment Configuration**
- Development: Local MariaDB instance
- Staging: Cloud-based MariaDB with backups
- Production: High-availability MariaDB cluster

### 3. **Data Migration**
- Import existing client data with proper validation
- Migrate user accounts with password reset requirements
- Validate data integrity post-migration

This schema provides a solid foundation for the ZBB Intake application with room for future growth and enhancement.
