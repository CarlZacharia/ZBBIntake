# Remote Server Deployment Guide

## For zbplans.com Server

### 1. Upload Files
Upload the entire `api` folder to your web server so it's accessible at:
```
https://zbplans.com/api/
```

### 2. Server Requirements
Ensure your server has:
- PHP 7.4 or higher
- MySQL/MariaDB
- PHP Extensions: PDO, PDO_MySQL, JSON, OpenSSL
- Apache with mod_rewrite and mod_headers enabled

### 3. File Permissions
Set proper permissions on your server:
```bash
chmod -R 755 api/
chmod 644 api/.htaccess
```

### 4. Test Endpoints
Test these URLs in your browser:

1. **CORS Handler Test:**
   ```
   https://zbplans.com/api/cors-handler.php
   ```

2. **API Info:**
   ```
   https://zbplans.com/api/index.php
   ```

3. **Ping Test:**
   ```
   https://zbplans.com/api/ping.php
   ```

4. **Database Test:**
   ```
   https://zbplans.com/api/test.php
   ```

### 5. CORS Testing with Browser Console
Open browser console on `http://localhost:4200` and run:

```javascript
// Test CORS preflight
fetch('https://zbplans.com/api/auth/register.php', {
  method: 'OPTIONS',
  headers: {
    'Origin': 'http://localhost:4200',
    'Access-Control-Request-Method': 'POST',
    'Access-Control-Request-Headers': 'Content-Type'
  }
}).then(response => {
  console.log('CORS preflight status:', response.status);
  console.log('CORS headers:', response.headers);
});

// Test actual API call
fetch('https://zbplans.com/api/ping.php', {
  method: 'GET',
  credentials: 'include'
}).then(response => response.json())
  .then(data => console.log('API response:', data))
  .catch(error => console.error('API error:', error));
```

### 6. Database Configuration
Update `api/config/database.php` with your server's database credentials:

```php
private $host = 'localhost'; // or your DB host
private $db_name = 'zbplans';
private $username = 'zbplansuser';
private $password = 'ZB3ld3rl@w!'; // your actual password
```

### 7. SSL Certificate
If using HTTPS (recommended), update the Angular service:

```typescript
private readonly API_URL = 'https://zbplans.com/api/auth';
```

### 8. Apache Virtual Host Configuration
If you have access to Apache config, add this to your virtual host:

```apache
<Directory "/path/to/zbplans.com/api">
    Header always set Access-Control-Allow-Origin "http://localhost:4200"
    Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header always set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With"
    Header always set Access-Control-Allow-Credentials "true"
    
    # Handle preflight requests
    RewriteEngine On
    RewriteCond %{REQUEST_METHOD} OPTIONS
    RewriteRule ^(.*)$ cors-handler.php [L]
</Directory>
```

### 9. Production Security
For production, update these settings:

1. **Remove debug flags** in `.htaccess`:
   ```apache
   php_flag display_errors Off
   php_value error_reporting "E_ERROR"
   ```

2. **Update JWT secret** in `api/helpers/jwt.php`:
   ```php
   private static $secret_key = "your_secure_production_jwt_key_here";
   ```

3. **Enable HTTPS redirect** in `.htaccess`:
   ```apache
   RewriteCond %{HTTPS} off
   RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
   ```

### Troubleshooting

If you still get CORS errors:

1. Check server error logs
2. Verify `.htaccess` is being processed
3. Test with curl:
   ```bash
   curl -v -X OPTIONS https://zbplans.com/api/auth/register.php \
     -H "Origin: http://localhost:4200"
   ```
4. Contact your hosting provider about CORS support