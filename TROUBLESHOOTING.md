# Troubleshooting CORS Issues

## Problem
Getting CORS error: "Response to preflight request doesn't pass access control check: Redirect is not allowed for a preflight request"

## Solutions

### 1. Check Web Server Setup
Make sure you have a local web server running (Apache, Nginx, or XAMPP) and the `api` folder is accessible at:
```
http://localhost/ZBBIntake/api/
```

### 2. Test API Connectivity
Visit these URLs in your browser to test:
- `http://localhost/ZBBIntake/api/ping.php` - Should return JSON success message
- `http://localhost/ZBBIntake/api/test.php` - Should show test results
- `http://localhost/ZBBIntake/api/` - Should show API info

### 3. Configure Web Server

#### For XAMPP/Apache:
1. Place the `ZBBIntake` folder in `htdocs/` directory
2. Make sure `.htaccess` files are enabled in Apache config
3. Restart Apache

#### For WAMP:
1. Place the `ZBBIntake` folder in `www/` directory
2. Make sure mod_rewrite and mod_headers are enabled
3. Restart services

### 4. Update API URL in Angular
In `src/app/services/auth.service.ts`, update the API_URL to match your setup:

```typescript
// For XAMPP
private readonly API_URL = 'http://localhost/ZBBIntake/api/auth';

// For WAMP
private readonly API_URL = 'http://localhost/ZBBIntake/api/auth';

// For custom port (e.g., 8080)
private readonly API_URL = 'http://localhost:8080/ZBBIntake/api/auth';
```

### 5. Database Connection
Make sure your MariaDB/MySQL is running and the database `zbplans` exists with the user `zbplansuser`.

### 6. PHP Extensions
Ensure these PHP extensions are enabled:
- PDO
- PDO_MySQL
- JSON
- OpenSSL

### 7. File Permissions
On Linux/Mac, make sure the `api` folder has proper read permissions:
```bash
chmod -R 755 api/
```

## Testing Steps

1. **Test PHP Backend:**
   ```bash
   curl http://localhost/ZBBIntake/api/ping.php
   ```

2. **Test CORS:**
   ```bash
   curl -X OPTIONS http://localhost/ZBBIntake/api/auth/register.php \
     -H "Origin: http://localhost:4200" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type"
   ```

3. **Test Registration:**
   ```bash
   curl -X POST http://localhost/ZBBIntake/api/auth/register.php \
     -H "Content-Type: application/json" \
     -d '{"email":"test@test.com","password":"password123","confirmPassword":"password123","firstName":"Test","lastName":"User"}'
   ```

## Common Issues

### Issue: 404 Not Found
- **Solution:** Check web server document root and folder structure

### Issue: 500 Internal Server Error
- **Solution:** Check PHP error logs, verify database connection

### Issue: CORS still not working
- **Solution:** Try adding this to your Apache VirtualHost:
  ```apache
  Header always set Access-Control-Allow-Origin "http://localhost:4200"
  Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
  Header always set Access-Control-Allow-Headers "Content-Type, Authorization"
  ```

### Issue: Database connection failed
- **Solution:** Update credentials in `api/config/database.php`
