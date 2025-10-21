#!/bin/bash

# =====================================================
# ZBB Intake Database Setup Script
# =====================================================
# This script sets up the MariaDB database for the ZBB Intake application
# Run this script on your database server

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DB_NAME="zbb_intake"
DB_USER="zbb_app"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCHEMA_FILE="$SCRIPT_DIR/schema.sql"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if MariaDB is running
check_mariadb() {
    print_status "Checking MariaDB service..."
    if systemctl is-active --quiet mariadb || systemctl is-active --quiet mysql; then
        print_success "MariaDB is running"
    else
        print_error "MariaDB is not running. Please start the service first."
        exit 1
    fi
}

# Function to prompt for database root password
get_root_password() {
    echo -n "Enter MariaDB root password: "
    read -s ROOT_PASSWORD
    echo
}

# Function to generate random password
generate_password() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-25
}

# Function to test database connection
test_connection() {
    print_status "Testing database connection..."
    if mysql -u root -p"$ROOT_PASSWORD" -e "SELECT 1;" >/dev/null 2>&1; then
        print_success "Database connection successful"
    else
        print_error "Failed to connect to database. Please check your password."
        exit 1
    fi
}

# Function to create database
create_database() {
    print_status "Creating database '$DB_NAME'..."
    
    # Check if database exists
    if mysql -u root -p"$ROOT_PASSWORD" -e "USE $DB_NAME;" >/dev/null 2>&1; then
        print_warning "Database '$DB_NAME' already exists."
        echo -n "Do you want to drop and recreate it? (y/N): "
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            mysql -u root -p"$ROOT_PASSWORD" -e "DROP DATABASE $DB_NAME;"
            print_status "Dropped existing database"
        else
            print_status "Using existing database"
            return
        fi
    fi
    
    mysql -u root -p"$ROOT_PASSWORD" -e "CREATE DATABASE $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    print_success "Database '$DB_NAME' created"
}

# Function to create application user
create_app_user() {
    print_status "Creating application user '$DB_USER'..."
    
    # Generate random password for app user
    APP_PASSWORD=$(generate_password)
    
    # Check if user exists
    if mysql -u root -p"$ROOT_PASSWORD" -e "SELECT User FROM mysql.user WHERE User='$DB_USER';" | grep -q "$DB_USER"; then
        print_warning "User '$DB_USER' already exists. Updating password..."
        mysql -u root -p"$ROOT_PASSWORD" -e "ALTER USER '$DB_USER'@'localhost' IDENTIFIED BY '$APP_PASSWORD';"
    else
        mysql -u root -p"$ROOT_PASSWORD" -e "CREATE USER '$DB_USER'@'localhost' IDENTIFIED BY '$APP_PASSWORD';"
        print_success "User '$DB_USER' created"
    fi
    
    # Grant permissions
    mysql -u root -p"$ROOT_PASSWORD" -e "GRANT SELECT, INSERT, UPDATE, DELETE ON $DB_NAME.* TO '$DB_USER'@'localhost';"
    mysql -u root -p"$ROOT_PASSWORD" -e "FLUSH PRIVILEGES;"
    
    print_success "Permissions granted to '$DB_USER'"
    
    # Save credentials to file
    cat > "$SCRIPT_DIR/.env.database" << EOF
# Database configuration for ZBB Intake Application
# Generated on $(date)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$APP_PASSWORD
EOF
    
    chmod 600 "$SCRIPT_DIR/.env.database"
    print_success "Database credentials saved to .env.database"
}

# Function to run schema
run_schema() {
    print_status "Running database schema..."
    
    if [ ! -f "$SCHEMA_FILE" ]; then
        print_error "Schema file not found: $SCHEMA_FILE"
        exit 1
    fi
    
    mysql -u root -p"$ROOT_PASSWORD" < "$SCHEMA_FILE"
    print_success "Database schema applied successfully"
}

# Function to verify installation
verify_installation() {
    print_status "Verifying installation..."
    
    # Count tables
    TABLE_COUNT=$(mysql -u root -p"$ROOT_PASSWORD" -D "$DB_NAME" -e "SHOW TABLES;" | wc -l)
    TABLE_COUNT=$((TABLE_COUNT - 1))  # Subtract header row
    
    if [ "$TABLE_COUNT" -gt 20 ]; then
        print_success "Installation verified: $TABLE_COUNT tables created"
    else
        print_error "Installation verification failed: Only $TABLE_COUNT tables found"
        exit 1
    fi
    
    # Test app user connection
    if mysql -u "$DB_USER" -p"$(grep DB_PASSWORD "$SCRIPT_DIR/.env.database" | cut -d'=' -f2)" -D "$DB_NAME" -e "SELECT 1;" >/dev/null 2>&1; then
        print_success "Application user can connect successfully"
    else
        print_error "Application user connection failed"
        exit 1
    fi
}

# Function to create backup script
create_backup_script() {
    print_status "Creating backup script..."
    
    cat > "$SCRIPT_DIR/backup.sh" << 'EOF'
#!/bin/bash
# ZBB Intake Database Backup Script

BACKUP_DIR="/var/backups/zbb-intake"
DB_NAME="zbb_intake"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/zbb_intake_backup_$DATE.sql"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Create backup
mysqldump -u root -p "$DB_NAME" > "$BACKUP_FILE"

# Compress backup
gzip "$BACKUP_FILE"

# Keep only last 7 days of backups
find "$BACKUP_DIR" -name "zbb_intake_backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_FILE.gz"
EOF
    
    chmod +x "$SCRIPT_DIR/backup.sh"
    print_success "Backup script created at backup.sh"
}

# Function to display final instructions
show_final_instructions() {
    echo
    echo "=========================================="
    echo "  ZBB Intake Database Setup Complete!"
    echo "=========================================="
    echo
    print_success "Database Name: $DB_NAME"
    print_success "Application User: $DB_USER"
    print_success "Credentials file: .env.database"
    echo
    print_status "Next steps:"
    echo "1. Copy the database credentials from .env.database to your application configuration"
    echo "2. Update your backend API to use these connection details"
    echo "3. Test the connection from your application"
    echo "4. Set up regular backups using the provided backup.sh script"
    echo
    print_warning "Security reminders:"
    echo "- Keep the .env.database file secure and never commit it to version control"
    echo "- Consider setting up SSL connections for production"
    echo "- Regularly update MariaDB and monitor for security patches"
    echo "- Set up monitoring and alerting for the database"
    echo
    print_status "For application integration, use these connection details:"
    echo "Host: localhost"
    echo "Port: 3306"
    echo "Database: $DB_NAME"
    echo "Username: $DB_USER"
    echo "Password: (see .env.database file)"
}

# Main execution
main() {
    echo "=========================================="
    echo "  ZBB Intake Database Setup Script"
    echo "=========================================="
    echo
    
    # Check requirements
    check_mariadb
    
    # Get root password
    get_root_password
    
    # Test connection
    test_connection
    
    # Setup database
    create_database
    create_app_user
    run_schema
    verify_installation
    create_backup_script
    
    # Show final instructions
    show_final_instructions
}

# Check if script is run with bash
if [ -z "$BASH_VERSION" ]; then
    echo "This script must be run with bash"
    exit 1
fi

# Run main function
main "$@"