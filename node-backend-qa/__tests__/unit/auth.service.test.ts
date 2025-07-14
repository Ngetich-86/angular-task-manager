import { UserService } from "../../src/auth/auth.services";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from "../../src/drizzle/db";
import { users } from "../../src/drizzle/schema";
import { sql } from "drizzle-orm";

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../../src/drizzle/db');

const mockUser = [{
    id: 1,
    fullname: "Test User",
    email: "test@example.com",
    password: "hashed_password",
    role: 'user',
    isActive: true
}];

describe("UserService", () => {
    // Arrange - Create fresh instance before each test
    let userService: UserService;
    beforeAll(() =>{
        userService = new UserService();
        jest.clearAllMocks(); // Clear mocks before each test
    });
    describe("createUser", () => {
        it("should create a user with hashed password", async () => {
            // Arrange
            const newUser = {
                fullname: "New User",
                email: "new@example.com",
                password: "plaintext_password",
                role: "user" as const
            };
            (bcrypt.hash as jest.Mock).mockReturnValue("hashed_password");// Mock bcrypt hash function
            (db.insert as jest.Mock).mockReturnValue({// Mock db insert function
             values: jest.fn().mockResolvedValue(undefined), // or a mock result
            });
            // Act
            const result = await userService.createUser(newUser);
            // Assert
            expect(bcrypt.hash).toHaveBeenCalledWith("plaintext_password", 10);
            expect(db.insert).toHaveBeenCalledWith(users);
            const valuesMock = (db.insert as jest.Mock).mock.results[0].value.values;
            expect(valuesMock).toHaveBeenCalledWith({
                ...newUser,
                password: "hashed_password"
            });
            expect(result).toBe("User created successfully");
        });
    })
});

    describe("getUserByEmail", () =>{
        it("should return user by email", async () => {
            //arrange
            (db.query.users.findFirst as jest.Mock).mockResolvedValue(mockUser[0]);
            //act
            const userService = new UserService();
            const result = await userService.getUserByEmail("test@example.com");
            //assert
            expect(db.query.users.findFirst).toHaveBeenCalledWith({
                where: sql`${expect.anything()} = ${'test@example.com'}`
            });
            expect(result).toEqual(mockUser[0]);
        });
        it("should return null if user not found", async () => {
            // Arrange
            (db.query.users.findFirst as jest.Mock).mockResolvedValue(null);
            // Act
            const userService = new UserService();
            const result = await userService.getUserByEmail("test@example.com");
            // Assert
            expect(db.query.users.findFirst).toHaveBeenCalledWith({
                where: sql`${expect.anything()} = ${'test@example.com'}`
            });
            expect(result).toBeNull();
        });
    });

       describe("loginUser", () => {
        const validCredentials = {
            email: 'test@example.com',
            password: 'plaintext_password'
        };
        it("should return user and token on successful login", async () => {
            //arrange
            (db.query.users.findFirst as jest.Mock).mockResolvedValue(mockUser[0]);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (jwt.sign as jest.Mock).mockReturnValue("jwt_token");
            // Act
            const userService = new UserService();
            const result = await userService.loginUser(validCredentials);
            // Assert
            expect(bcrypt.compare).toHaveBeenCalledWith("plaintext_password", "hashed_password");
            expect(db.query.users.findFirst).toHaveBeenCalledWith({
                columns: {
                    id: true,
                    fullname: true,
                    email: true,
                    password: true,
                    role: true
                },
                where: sql`${users.email} = ${validCredentials.email}`
            });
            const { password, ...userWithoutPassword } = mockUser[0];
            expect(result).toEqual({
                user: userWithoutPassword,
                token: "jwt_token"
            });
        });
        it('should throw error if user not found', async () => {
            // Arrange
            (db.query.users.findFirst as jest.Mock).mockResolvedValue(null);
            // Act and Assert
            const userService = new UserService();
            await expect(userService.loginUser(validCredentials)).rejects.toThrow("User not found");
        });
        it('should throw error if password is invalid', async () => {
            // Arrange
            (db.query.users.findFirst as jest.Mock).mockResolvedValue(mockUser[0]);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);
            // Act and Assert
            const userService = new UserService();
            await expect(userService.loginUser(validCredentials)).rejects.toThrow("Invalid credentials");
        });
    });

    
