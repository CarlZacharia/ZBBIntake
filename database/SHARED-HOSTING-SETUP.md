# ZBB Intake - Shared Hosting Database Setup

## Problem Solved
This addresses the error: `#1044 - Access denied for user 'cpses_zb3s8m6onr'@'localhost' to database 'zbplans'`

## Quick Setup for Shared Hosting (cPanel/phpMyAdmin)

### Step 1: Access Your Database
1. Log into your cPanel control panel
2. Open phpMyAdmin
3. Select the `zbplans` database from the left sidebar

### Step 2: Run the Schema
1. Click on the "SQL" tab in phpMyAdmin
2. Copy the contents of `schema-existing-db.sql`
3. Paste it into the SQL query box
4. Click "Go" to execute

### Step 3: Verify Installation
After running the script, you should see a list of created tables and a verification query result showing all tables.

Expected tables:
- users
- cases
- personal_info
- addresses
- marital_info
- previous_marriages
- children
- family_members
- charities
- fiduciaries
- guardian_preferences
- real_estate
- financial_accounts
- retirement_accounts
- life_insurance
- business_interests
- digital_assets
- other_assets
- beneficiaries
- user_sessions
- password_reset_tokens
- email_verification_tokens
- audit_log

### Step 4: Update Your Application Configuration

Use these database connection details in your backend:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=zbplans
DB_USER=zbplansuser
DB_PASSWORD=ZB3ld3rl@w!
```

### Troubleshooting

#### If you get function/procedure errors:
Some shared hosting providers don't allow creating stored procedures or functions. This is normal and you can skip those errors. The tables will still be created successfully.

#### If you get trigger errors:
Similar to functions, some hosts restrict triggers. You can implement the completion percentage logic in your application instead.

#### If you get "table already exists" errors:
The script uses `CREATE TABLE IF NOT EXISTS` so this shouldn't happen, but if it does, it's harmless.

### Next Steps

1. **Backend Development**: Create your Node.js/Express API to connect to this database
2. **Authentication Integration**: Implement the login/registration endpoints
3. **Data API Endpoints**: Create CRUD operations for each table
4. **Frontend Integration**: Update your Angular services to use the new API endpoints

The database is now ready for your application to use with the existing user credentials: `zbplansuser`

### Security Notes

- The `ssn_encrypted` and `account_number_encrypted` fields expect encrypted data
- Implement encryption/decryption in your backend application
- Use environment variables for sensitive configuration
- Never commit database credentials to version control
