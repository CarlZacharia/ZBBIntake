<?php

require_once __DIR__ . '/env.php';

class Crypto {
    private static function getKey(): string {
        $rawKey = Env::get('ENCRYPTION_KEY');
        if (empty($rawKey)) {
            throw new Exception('Encryption key is not configured. Set ENCRYPTION_KEY in your .env file.');
        }
        return hash('sha256', $rawKey, true);
    }

    public static function encrypt(?string $plaintext): ?string {
        if ($plaintext === null || $plaintext === '') {
            return null;
        }

        $key = self::getKey();
        $iv = random_bytes(16);
        $ciphertext = openssl_encrypt($plaintext, 'AES-256-CBC', $key, OPENSSL_RAW_DATA, $iv);

        if ($ciphertext === false) {
            throw new Exception('Unable to encrypt data');
        }

        return base64_encode($iv . $ciphertext);
    }

    public static function decrypt(?string $payload): ?string {
        if ($payload === null || $payload === '') {
            return null;
        }

        $data = base64_decode($payload, true);
        if ($data === false || strlen($data) < 17) {
            return null;
        }

        $iv = substr($data, 0, 16);
        $ciphertext = substr($data, 16);
        $key = self::getKey();

        $plaintext = openssl_decrypt($ciphertext, 'AES-256-CBC', $key, OPENSSL_RAW_DATA, $iv);
        return $plaintext === false ? null : $plaintext;
    }
}
?>

