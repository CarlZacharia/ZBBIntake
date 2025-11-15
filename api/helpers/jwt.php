<?php
/**
 * JWT Helper Class
 * Simple JWT implementation without external dependencies
 */

require_once __DIR__ . '/env.php';

class JWT {
    private static function secretKey(): string {
        $secret = Env::get('JWT_SECRET');
        if (empty($secret)) {
            throw new Exception('JWT secret key is not configured. Set JWT_SECRET in your .env file.');
        }
        return $secret;
    }

    private static $algorithm = 'HS256';
    private static $expiration_time = 86400; // 24 hours

    /**
     * Create JWT token
     */
    public static function encode($payload) {
        $header = json_encode(['typ' => 'JWT', 'alg' => self::$algorithm]);

        // Add expiration time to payload
        $payload['exp'] = time() + self::$expiration_time;
        $payload['iat'] = time();

        $payload = json_encode($payload);

        $base64Header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64Payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));

        $signature = hash_hmac('sha256', $base64Header . "." . $base64Payload, self::secretKey(), true);
        $base64Signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

        return $base64Header . "." . $base64Payload . "." . $base64Signature;
    }

    /**
     * Decode JWT token
     */
    public static function decode($jwt) {
        $tokenParts = explode('.', $jwt);

        if (count($tokenParts) !== 3) {
            throw new Exception('Invalid token format');
        }

        $header = base64_decode(str_replace(['-', '_'], ['+', '/'], $tokenParts[0]));
        $payload = base64_decode(str_replace(['-', '_'], ['+', '/'], $tokenParts[1]));
        $signature = $tokenParts[2];

        // Verify signature
        $expectedSignature = str_replace(['+', '/', '='], ['-', '_', ''],
            base64_encode(hash_hmac('sha256', $tokenParts[0] . "." . $tokenParts[1], self::secretKey(), true)));

        if ($signature !== $expectedSignature) {
            throw new Exception('Invalid token signature');
        }

        $payloadData = json_decode($payload, true);

        // Check if token is expired
        if (isset($payloadData['exp']) && $payloadData['exp'] < time()) {
            throw new Exception('Token has expired');
        }

        return $payloadData;
    }

    /**
     * Get authorization header
     */
    public static function getBearerToken() {
        $headers = null;

        if (isset($_SERVER['Authorization'])) {
            $headers = trim($_SERVER["Authorization"]);
        } elseif (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $headers = trim($_SERVER["HTTP_AUTHORIZATION"]);
        } elseif (function_exists('apache_request_headers')) {
            $requestHeaders = apache_request_headers();
            $requestHeaders = array_combine(array_map('ucwords', array_keys($requestHeaders)), array_values($requestHeaders));
            if (isset($requestHeaders['Authorization'])) {
                $headers = trim($requestHeaders['Authorization']);
            }
        }

        if (!empty($headers)) {
            if (preg_match('/Bearer\s(\S+)/', $headers, $matches)) {
                return $matches[1];
            }
        }

        return null;
    }
}
?>
