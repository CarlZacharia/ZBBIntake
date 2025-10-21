<?php
/**
 * User Model
 * Handles user-related database operations
 */

require_once '../config/database.php';

class User {
    private $conn;
    private $table_name = "users";

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    /**
     * Create new user
     */
    public function create($userData) {
        $query = "INSERT INTO " . $this->table_name . "
                  (email, password_hash, first_name, middle_name, last_name, suffix, phone, preferred_contact_method)
                  VALUES
                  (:email, :password_hash, :first_name, :middle_name, :last_name, :suffix, :phone, :preferred_contact_method)";

        $stmt = $this->conn->prepare($query);

        // Bind parameters
        $stmt->bindParam(':email', $userData['email']);
        $stmt->bindParam(':password_hash', $userData['password_hash']);
        $stmt->bindParam(':first_name', $userData['first_name']);
        $stmt->bindParam(':middle_name', $userData['middle_name']);
        $stmt->bindParam(':last_name', $userData['last_name']);
        $stmt->bindParam(':suffix', $userData['suffix']);
        $stmt->bindParam(':phone', $userData['phone']);
        $stmt->bindParam(':preferred_contact_method', $userData['preferred_contact_method']);

        if ($stmt->execute()) {
            return $this->conn->lastInsertId();
        }

        return false;
    }

    /**
     * Find user by email
     */
    public function findByEmail($email) {
        $query = "SELECT user_id, email, password_hash, first_name, middle_name, last_name, suffix, phone,
                         preferred_contact_method, date_created, last_login, is_active, email_verified, profile_completed
                  FROM " . $this->table_name . "
                  WHERE email = :email AND is_active = 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':email', $email);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Find user by ID
     */
    public function findById($user_id) {
        $query = "SELECT user_id, email, first_name, middle_name, last_name, suffix, phone,
                         preferred_contact_method, date_created, last_login, is_active, email_verified, profile_completed
                  FROM " . $this->table_name . "
                  WHERE user_id = :user_id AND is_active = 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Update last login time
     */
    public function updateLastLogin($user_id) {
        $query = "UPDATE " . $this->table_name . "
                  SET last_login = CURRENT_TIMESTAMP
                  WHERE user_id = :user_id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $user_id);

        return $stmt->execute();
    }

    /**
     * Check if email exists
     */
    public function emailExists($email) {
        $query = "SELECT user_id FROM " . $this->table_name . " WHERE email = :email";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':email', $email);
        $stmt->execute();

        return $stmt->rowCount() > 0;
    }

    /**
     * Verify password
     */
    public function verifyPassword($password, $hash) {
        return password_verify($password, $hash);
    }

    /**
     * Hash password
     */
    public function hashPassword($password) {
        return password_hash($password, PASSWORD_DEFAULT);
    }

    /**
     * Update user profile
     */
    public function updateProfile($user_id, $userData) {
        $query = "UPDATE " . $this->table_name . "
                  SET first_name = :first_name,
                      middle_name = :middle_name,
                      last_name = :last_name,
                      suffix = :suffix,
                      phone = :phone,
                      preferred_contact_method = :preferred_contact_method,
                      updated_at = CURRENT_TIMESTAMP
                  WHERE user_id = :user_id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->bindParam(':first_name', $userData['first_name']);
        $stmt->bindParam(':middle_name', $userData['middle_name']);
        $stmt->bindParam(':last_name', $userData['last_name']);
        $stmt->bindParam(':suffix', $userData['suffix']);
        $stmt->bindParam(':phone', $userData['phone']);
        $stmt->bindParam(':preferred_contact_method', $userData['preferred_contact_method']);

        return $stmt->execute();
    }
}
?>
