# ZBB Intake PHP API

A PHP-based REST API for the ZBB Estate Planning Intake System. This API handles user authentication and registration without requiring Composer dependencies.

## Features

- User registration and login
- JWT-based authentication
- Password hashing and verification
- Input validation and sanitization
- CORS support for Angular frontend
- Error handling and logging

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register.php` | User registration | No |
| POST | `/api/auth/login.php` | User login | No |
| GET | `/api/auth/profile.php` | Get user profile | Yes |
| POST | `/api/auth/logout.php` | User logout | Optional |

## Setup Instructions

### 1. Database Setup
Ensure your MariaDB database is set up with the schema from `/database/schema.sql`

### 2. Web Server Configuration
Place the `api` folder in your web server's document root or configure a virtual host.

### 3. PHP Configuration
Ensure your PHP installation has the following extensions enabled:
- PDO
- PDO_MySQL
- JSON
- OpenSSL (for password hashing)

### 4. CORS Configuration
The API is configured to allow requests from `http://localhost:4200` (Angular dev server). Update the CORS settings in `helpers/response.php` for production.

## Request/Response Format

### Registration Request
```json
POST /api/auth/register.php
{
  "email": "user@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "firstName": "John",
  "middleName": "M",
  "lastName": "Doe",
  "suffix": "Jr",
  "phone": "1234567890",
  "preferredContactMethod": "email"
}
```

### Login Request
```json
POST /api/auth/login.php
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "user": {...},
    "token": "jwt_token_here"
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": ["Detailed error 1", "Detailed error 2"]
}
```

## Authentication

For protected endpoints, include the JWT token in the Authorization header:
```
Authorization: Bearer your_jwt_token_here
```

## Security Features

- Password hashing using PHP's `password_hash()`
- JWT tokens with expiration
- Input validation and sanitization
- SQL injection prevention with prepared statements
- CORS protection

## File Structure

```
api/
├── index.php                 # API information endpoint
├── config/
│   └── database.php         # Database connection
├── helpers/
│   ├── jwt.php             # JWT token handling
│   ├── response.php        # API response utilities
│   └── validator.php       # Input validation
├── models/
│   └── user.php            # User database operations
└── auth/
    ├── register.php        # User registration
    ├── login.php           # User login
    ├── profile.php         # User profile
    └── logout.php          # User logout
```

## Error Handling

All errors are logged to PHP's error log. Check your server's error logs for debugging information.

## Development Notes

- No external dependencies (Composer-free)
- Compatible with PHP 7.4+
- Uses native PHP JWT implementation
- Prepared statements for database security
- Comprehensive input validation

## Production Considerations

1. Update JWT secret key in `helpers/jwt.php`
2. Configure proper CORS origins in `helpers/response.php`
3. Set up HTTPS for secure token transmission
4. Configure proper error logging
5. Consider rate limiting for authentication endpoints
6. Implement email verification for registration
