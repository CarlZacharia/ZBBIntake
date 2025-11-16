<?php
/**
 * ProviderContacts Model
 * Handles provider_contacts table operations
 */

require_once '../config/database.php';
require_once '../helpers/crypto.php';

class ProviderContacts {
    private $conn;
    private $table_name = "provider_contacts";

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    /**
     * Create new provider contact
     */
    public function create($data) {
        $query = "INSERT INTO " . $this->table_name . "
            (name_encrypted, telephone_encrypted, address_encrypted, email_encrypted, csz_encrypted, county_encrypted)
            VALUES
            (:name_encrypted, :telephone_encrypted, :address_encrypted, :email_encrypted, :csz_encrypted, :county_encrypted)";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':name_encrypted', $data['name_encrypted']);
        $stmt->bindParam(':telephone_encrypted', $data['telephone_encrypted']);
        $stmt->bindParam(':address_encrypted', $data['address_encrypted']);
        $stmt->bindParam(':email_encrypted', $data['email_encrypted']);
        $stmt->bindParam(':csz_encrypted', $data['csz_encrypted']);
        $stmt->bindParam(':county_encrypted', $data['county_encrypted']);
        return $stmt->execute();
    }
}
?>
