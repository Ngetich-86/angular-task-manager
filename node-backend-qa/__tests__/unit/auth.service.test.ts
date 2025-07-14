import { UserService } from "../../src/auth/auth.services";
import bcrypt from 'bcryptjs';
import db from "../../src/drizzle/db";
import { users } from "../../src/drizzle/schema";

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
            (bcrypt.hash as jest.Mock).mockReturnValue("hashed_password");
            (db.insert as jest.Mock).mockReturnValue({
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
