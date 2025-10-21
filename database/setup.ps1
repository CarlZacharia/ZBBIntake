# =====================================================
# ZBB Intake Database Setup Script (PowerShell)
# =====================================================
# This script sets up the MariaDB database for the ZBB Intake application
# Run this script on your Windows database server

param(
    [string]$RootPassword = "",
    [string]$DatabaseName = "zbb_intake",
    [string]$AppUser = "zbb_app",
    [switch]$Force = $false
)

# Configuration
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$SchemaFile = Join-Path $ScriptDir "schema.sql"

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Function to check if MySQL/MariaDB is available
function Test-MySQLAvailability {
    Write-Status "Checking MySQL/MariaDB availability..."
    try {
        $null = mysql --version
        Write-Success "MySQL/MariaDB client found"
        return $true
    }
    catch {
        Write-Error "MySQL/MariaDB client not found. Please install MariaDB or add it to PATH."
        return $false
    }
}

# Function to get root password
function Get-RootPassword {
    if (-not $RootPassword) {
        $securePassword = Read-Host "Enter MariaDB root password" -AsSecureString
        $RootPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword))
    }
    return $RootPassword
}

# Function to generate random password
function New-RandomPassword {
    param([int]$Length = 25)
    $chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    $password = ""
    for ($i = 0; $i -lt $Length; $i++) {
        $password += $chars[(Get-Random -Maximum $chars.Length)]
    }
    return $password
}

# Function to test database connection
function Test-DatabaseConnection {
    param([string]$Password)
    Write-Status "Testing database connection..."
    try {
        $result = mysql -u root -p$Password -e "SELECT 1;" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Database connection successful"
            return $true
        }
        else {
            Write-Error "Failed to connect to database. Please check your password."
            return $false
        }
    }
    catch {
        Write-Error "Failed to connect to database: $($_.Exception.Message)"
        return $false
    }
}

# Function to create database
function New-Database {
    param([string]$Password, [string]$DbName)
    Write-Status "Creating database '$DbName'..."

    # Check if database exists
    $result = mysql -u root -p$Password -e "SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '$DbName';" 2>&1

    if ($result -match $DbName -and -not $Force) {
        Write-Warning "Database '$DbName' already exists."
        $response = Read-Host "Do you want to drop and recreate it? (y/N)"
        if ($response -match "^[Yy]$") {
            mysql -u root -p$Password -e "DROP DATABASE $DbName;" 2>&1
            Write-Status "Dropped existing database"
        }
        else {
            Write-Status "Using existing database"
            return
        }
    }
    elseif ($result -match $DbName -and $Force) {
        mysql -u root -p$Password -e "DROP DATABASE $DbName;" 2>&1
        Write-Status "Dropped existing database (forced)"
    }

    mysql -u root -p$Password -e "CREATE DATABASE $DbName CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Database '$DbName' created"
    }
    else {
        Write-Error "Failed to create database"
        exit 1
    }
}

# Function to create application user
function New-AppUser {
    param([string]$Password, [string]$DbName, [string]$Username)
    Write-Status "Creating application user '$Username'..."

    # Generate random password for app user
    $AppPassword = New-RandomPassword

    # Check if user exists
    $result = mysql -u root -p$Password -e "SELECT User FROM mysql.user WHERE User='$Username';" 2>&1

    if ($result -match $Username) {
        Write-Warning "User '$Username' already exists. Updating password..."
        mysql -u root -p$Password -e "ALTER USER '$Username'@'localhost' IDENTIFIED BY '$AppPassword';" 2>&1
    }
    else {
        mysql -u root -p$Password -e "CREATE USER '$Username'@'localhost' IDENTIFIED BY '$AppPassword';" 2>&1
        Write-Success "User '$Username' created"
    }

    # Grant permissions
    mysql -u root -p$Password -e "GRANT SELECT, INSERT, UPDATE, DELETE ON $DbName.* TO '$Username'@'localhost';" 2>&1
    mysql -u root -p$Password -e "FLUSH PRIVILEGES;" 2>&1

    Write-Success "Permissions granted to '$Username'"

    # Save credentials to file
    $envContent = @"
# Database configuration for ZBB Intake Application
# Generated on $(Get-Date)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=$DbName
DB_USER=$Username
DB_PASSWORD=$AppPassword
"@

    $envFile = Join-Path $ScriptDir ".env.database"
    $envContent | Out-File -FilePath $envFile -Encoding UTF8

    Write-Success "Database credentials saved to .env.database"
    return $AppPassword
}

# Function to run schema
function Invoke-Schema {
    param([string]$Password, [string]$DbName)
    Write-Status "Running database schema..."

    if (-not (Test-Path $SchemaFile)) {
        Write-Error "Schema file not found: $SchemaFile"
        exit 1
    }

    $result = mysql -u root -p$Password $DbName 2>&1 < $SchemaFile
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Database schema applied successfully"
    }
    else {
        Write-Error "Failed to apply database schema: $result"
        exit 1
    }
}

# Function to verify installation
function Test-Installation {
    param([string]$Password, [string]$DbName, [string]$Username, [string]$AppPassword)
    Write-Status "Verifying installation..."

    # Count tables
    $result = mysql -u root -p$Password -D $DbName -e "SHOW TABLES;" 2>&1
    $tableCount = ($result -split "`n").Count - 1  # Subtract header row

    if ($tableCount -gt 20) {
        Write-Success "Installation verified: $tableCount tables created"
    }
    else {
        Write-Error "Installation verification failed: Only $tableCount tables found"
        exit 1
    }

    # Test app user connection
    $testResult = mysql -u $Username -p$AppPassword -D $DbName -e "SELECT 1;" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Application user can connect successfully"
    }
    else {
        Write-Error "Application user connection failed: $testResult"
        exit 1
    }
}

# Function to create backup script
function New-BackupScript {
    param([string]$DbName)
    Write-Status "Creating backup script..."

    $backupScript = @"
# ZBB Intake Database Backup Script (PowerShell)

param(
    [string]`$BackupDir = "C:\Backups\zbb-intake",
    [string]`$DatabaseName = "$DbName"
)

# Create backup directory if it doesn't exist
if (-not (Test-Path `$BackupDir)) {
    New-Item -Path `$BackupDir -ItemType Directory -Force
}

# Create timestamp
`$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
`$backupFile = Join-Path `$BackupDir "zbb_intake_backup_`$timestamp.sql"

# Create backup
Write-Host "Creating backup: `$backupFile"
mysqldump -u root -p `$DatabaseName > `$backupFile

# Compress backup (requires 7-Zip or similar)
if (Get-Command 7z -ErrorAction SilentlyContinue) {
    7z a "`$backupFile.7z" `$backupFile
    Remove-Item `$backupFile
    Write-Host "Backup compressed: `$backupFile.7z"
}

# Clean up old backups (keep last 7 days)
Get-ChildItem `$BackupDir -Filter "zbb_intake_backup_*" |
    Where-Object LastWriteTime -lt (Get-Date).AddDays(-7) |
    Remove-Item -Force

Write-Host "Backup completed successfully"
"@

    $backupScriptFile = Join-Path $ScriptDir "backup.ps1"
    $backupScript | Out-File -FilePath $backupScriptFile -Encoding UTF8

    Write-Success "Backup script created at backup.ps1"
}

# Function to display final instructions
function Show-FinalInstructions {
    param([string]$DbName, [string]$Username)

    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host "  ZBB Intake Database Setup Complete!" -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Success "Database Name: $DbName"
    Write-Success "Application User: $Username"
    Write-Success "Credentials file: .env.database"
    Write-Host ""
    Write-Status "Next steps:"
    Write-Host "1. Copy the database credentials from .env.database to your application configuration"
    Write-Host "2. Update your backend API to use these connection details"
    Write-Host "3. Test the connection from your application"
    Write-Host "4. Set up regular backups using the provided backup.ps1 script"
    Write-Host ""
    Write-Warning "Security reminders:"
    Write-Host "- Keep the .env.database file secure and never commit it to version control"
    Write-Host "- Consider setting up SSL connections for production"
    Write-Host "- Regularly update MariaDB and monitor for security patches"
    Write-Host "- Set up monitoring and alerting for the database"
    Write-Host ""
    Write-Status "For application integration, use these connection details:"
    Write-Host "Host: localhost"
    Write-Host "Port: 3306"
    Write-Host "Database: $DbName"
    Write-Host "Username: $Username"
    Write-Host "Password: (see .env.database file)"
}

# Main execution
function Main {
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host "  ZBB Intake Database Setup Script" -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host ""

    # Check requirements
    if (-not (Test-MySQLAvailability)) {
        exit 1
    }

    # Get root password
    $rootPass = Get-RootPassword

    # Test connection
    if (-not (Test-DatabaseConnection -Password $rootPass)) {
        exit 1
    }

    # Setup database
    New-Database -Password $rootPass -DbName $DatabaseName
    $appPassword = New-AppUser -Password $rootPass -DbName $DatabaseName -Username $AppUser
    Invoke-Schema -Password $rootPass -DbName $DatabaseName
    Test-Installation -Password $rootPass -DbName $DatabaseName -Username $AppUser -AppPassword $appPassword
    New-BackupScript -DbName $DatabaseName

    # Show final instructions
    Show-FinalInstructions -DbName $DatabaseName -Username $AppUser
}

# Run main function
try {
    Main
}
catch {
    Write-Error "Script execution failed: $($_.Exception.Message)"
    exit 1
}
