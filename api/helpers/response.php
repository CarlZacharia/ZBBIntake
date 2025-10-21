<?php
/**
 * Response Helper Class
 * Standardized API responses
 */

class Response {

    /**
     * Send JSON response
     */
    public static function json($data, $status_code = 200) {
        http_response_code($status_code);
        header('Content-Type: application/json');
        header('Access-Control-Allow-Origin: http://localhost:4200');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        header('Access-Control-Allow-Credentials: true');

        echo json_encode($data);
        exit();
    }

    /**
     * Send success response
     */
    public static function success($message, $data = null, $status_code = 200) {
        $response = [
            'success' => true,
            'message' => $message
        ];

        if ($data !== null) {
            $response['data'] = $data;
        }

        self::json($response, $status_code);
    }

    /**
     * Send error response
     */
    public static function error($message, $status_code = 400, $errors = null) {
        $response = [
            'success' => false,
            'message' => $message
        ];

        if ($errors !== null) {
            $response['errors'] = $errors;
        }

        self::json($response, $status_code);
    }

    /**
     * Handle CORS preflight requests
     */
    public static function handleCORS() {
        header('Access-Control-Allow-Origin: http://localhost:4200');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        header('Access-Control-Allow-Credentials: true');

        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit();
        }
    }
}
?>
