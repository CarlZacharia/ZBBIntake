<?php
/**
 * Validation Helper Class
 * Input validation utilities
 */

class Validator {

    /**
     * Validate email format
     */
    public static function isValidEmail($email) {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }

    /**
     * Validate password strength
     */
    public static function isValidPassword($password) {
        // At least 6 characters
        if (strlen($password) < 6) {
            return false;
        }
        return true;
    }

    /**
     * Validate required fields
     */
    public static function validateRequired($data, $required_fields) {
        $errors = [];

        foreach ($required_fields as $field) {
            if (!isset($data[$field]) || empty(trim($data[$field]))) {
                $errors[] = ucfirst(str_replace('_', ' ', $field)) . ' is required';
            }
        }

        return $errors;
    }

    /**
     * Sanitize input
     */
    public static function sanitize($input) {
        return htmlspecialchars(strip_tags(trim($input)));
    }

    /**
     * Validate phone number (basic format)
     */
    public static function isValidPhone($phone) {
        // Remove all non-digit characters
        $phone = preg_replace('/\D/', '', $phone);

        // Check if it's 10 digits (US format)
        return strlen($phone) === 10;
    }

    /**
     * Validate name (letters, spaces, hyphens, apostrophes only)
     */
    public static function isValidName($name) {
        return preg_match("/^[a-zA-Z\s\-']+$/", $name);
    }
}
?>
