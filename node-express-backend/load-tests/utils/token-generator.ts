import jwt from 'jsonwebtoken';

// Configuration for token generation
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';
const TOKEN_EXPIRY = '24h';

// User data for testing
const TEST_USERS = {
  admin: {
    id: 1,
    sub: 1,
    user_id: 1,
    fullname: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    isActive: true
  },
  user: {
    id: 2,
    sub: 2,
    user_id: 2,
    fullname: 'Regular User',
    email: 'user@example.com',
    role: 'user',
    isActive: true
  },
  inactiveUser: {
    id: 3,
    sub: 3,
    user_id: 3,
    fullname: 'Inactive User',
    email: 'inactive@example.com',
    role: 'user',
    isActive: false
  }
};

/**
 * Generate a JWT token for a specific user type
 * @param userType - The type of user ('admin', 'user', 'inactiveUser')
 * @param customPayload - Optional custom payload to override defaults
 * @returns JWT token string
 */
export function generateToken(userType: keyof typeof TEST_USERS, customPayload?: Partial<typeof TEST_USERS.admin>): string {
  const basePayload = TEST_USERS[userType];
  const payload = {
    ...basePayload,
    ...customPayload,
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours from now
    iat: Math.floor(Date.now() / 1000)
  };

  return jwt.sign(payload, JWT_SECRET);
}

/**
 * Generate an expired JWT token for testing
 * @param userType - The type of user
 * @returns Expired JWT token string
 */
export function generateExpiredToken(userType: keyof typeof TEST_USERS): string {
  const basePayload = TEST_USERS[userType];
  const payload = {
    ...basePayload,
    exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
    iat: Math.floor(Date.now() / 1000) - 7200  // 2 hours ago
  };

  return jwt.sign(payload, JWT_SECRET);
}

/**
 * Generate a token with invalid signature
 * @param userType - The type of user
 * @returns JWT token with invalid signature
 */
export function generateInvalidSignatureToken(userType: keyof typeof TEST_USERS): string {
  const basePayload = TEST_USERS[userType];
  const payload = {
    ...basePayload,
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000)
  };

  // Use a different secret to create invalid signature
  return jwt.sign(payload, 'different-secret-key');
}

/**
 * Generate a malformed token (not a valid JWT)
 * @returns Malformed token string
 */
export function generateMalformedToken(): string {
  return 'not.a.valid.jwt.token';
}

/**
 * Get all available user types
 * @returns Array of user type strings
 */
export function getAvailableUserTypes(): string[] {
  return Object.keys(TEST_USERS);
}

/**
 * Get user data for a specific user type
 * @param userType - The type of user
 * @returns User data object
 */
export function getUserData(userType: keyof typeof TEST_USERS) {
  return TEST_USERS[userType];
}

// Export for use in K6 tests
export default {
  generateToken,
  generateExpiredToken,
  generateInvalidSignatureToken,
  generateMalformedToken,
  getAvailableUserTypes,
  getUserData
};
