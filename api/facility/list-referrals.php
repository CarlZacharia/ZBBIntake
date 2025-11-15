<?php
/**
 * Facility Referral Listing
 * GET /api/facility/list-referrals.php
 */

require_once '../cors.php';
require_once '../helpers/response.php';
require_once '../helpers/jwt.php';
require_once '../models/facility_referral.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Response::error('Method not allowed', 405);
}

try {
    $token = JWT::getBearerToken();
    if (!$token) {
        Response::error('Authentication required', 401);
    }

    $claims = JWT::decode($token);
    $portalUserId = $claims['user_id'] ?? null;

    if (!$portalUserId) {
        Response::error('Invalid user context', 401);
    }

    $model = new FacilityReferral();
    $referrals = $model->getReferralsByUser((int)$portalUserId);

    Response::success('Referrals retrieved successfully', [
        'referrals' => $referrals
    ]);
} catch (Exception $e) {
    error_log('Facility referral list error: ' . $e->getMessage());
    Response::error('Unable to load referrals', 500);
}

?>

