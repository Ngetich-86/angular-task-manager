import jwt from "jsonwebtoken";
import { MiddlewareHandler } from "hono";

// Type definitions
interface JWTPayload {
    id: number;
    email: string;
    role: "user" | "admin" | "superadmin" | "disabled";
    iat?: number;
    exp?: number;
}

type RequiredRole = "admin" | "user" | "both";

// Helper function to verify JWT token
const verifyToken = (token: string): JWTPayload | null => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecretkey");
        return decoded as JWTPayload;
    } catch {
        return null;
    }
};

// Helper function to check role permissions
const hasRequiredRole = (userRole: string, requiredRole: RequiredRole): boolean => {
    switch (requiredRole) {
        case "both":
            return userRole === "admin" || userRole === "user";
        case "admin":
            return userRole === "admin";
        case "user":
            return userRole === "user";
        default:
            return false;
    }
};

// Main role-based authentication middleware
export const checkRoles = (requiredRole: RequiredRole): MiddlewareHandler => {
    return async (c, next) => {
        // Log all headers for debugging
        console.log('All request headers:', c.req.raw.headers);

        // Accept both header casings
        const authHeader = c.req.header("authorization") || c.req.header("Authorization");

        // Check if authorization header exists and has Bearer format
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return c.json({ error: "Unauthorized - Missing or invalid authorization header" }, 401);
        }

        // Extract token from header
        const token = authHeader.split(" ")[1];
        if (!token) {
            return c.json({ error: "Unauthorized - No token provided" }, 401);
        }

        // Verify and decode token
        const decoded = verifyToken(token);
        console.log('☸☸☸🕉🕉🕉☪☪🕎🕎Decoded JWT in middleware:', decoded);
        if (!decoded) {
            return c.json({ error: "Unauthorized - Invalid or expired token" }, 401);
        }

        // Validate token payload structure
        if (!decoded.role || typeof decoded.role !== "string") {
            return c.json({ error: "Unauthorized - Invalid token payload" }, 401);
        }

        // Check if user is active (not disabled)
        if (decoded.role === "disabled") {
            return c.json({ error: "Unauthorized - Account is disabled" }, 401);
        }

        // Check role permissions
        if (!hasRequiredRole(decoded.role, requiredRole)) {
            return c.json({ 
                error: "Forbidden - Insufficient permissions",
                requiredRole,
                userRole: decoded.role 
            }, 403);
        }

        // Attach user info to context
        c.set("user", decoded);
        
        await next();
    };
};

// Pre-configured middleware exports
export const adminRoleAuth = checkRoles("admin");
export const userRoleAuth = checkRoles("user");
export const bothRoleAuth = checkRoles("both");

// Additional middleware for superadmin only
export const superadminRoleAuth = checkRoles("admin"); // Since superadmin has admin privileges

// Middleware for any authenticated user (not disabled)
export const anyAuth = checkRoles("both");

