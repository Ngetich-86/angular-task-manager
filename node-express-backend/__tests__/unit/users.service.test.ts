export {};
jest.mock("../../src/drizzle/db", () => {
    const insert = jest.fn();
    const update = jest.fn();
    const del = jest.fn();
    const select = jest.fn();
    const query = {
        users: {
            findFirst: jest.fn(),
            findMany: jest.fn(),
        },
        categories: {
            findFirst: jest.fn(),
            findMany: jest.fn(),
        },
    };

    return {
        __esModule: true,
        default: { insert, update, delete: del, select, query },
    };
});

// Import after mock is set up
const db = require("../../src/drizzle/db").default as any;
const {
    createUserService,
    getUserByEmailService,
    verifyUserService,
    userLoginService,
    getAllUsersService,
    updateUserByIdService,
    getUserByIdService,
    deactivateUserService,
} = require("../../src/auth/auth.service");

const mockedDb = db as unknown as {
    insert: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    select: jest.Mock;
    query: {
        users: { findFirst: jest.Mock; findMany: jest.Mock };
        categories: { findFirst: jest.Mock; findMany: jest.Mock };
    };
};

describe("auth.service (users) - unit", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    function mockInsertReturning(returnValue: any[]) {
        mockedDb.insert.mockReturnValue({
            values: () => ({
                returning: jest.fn().mockResolvedValue(returnValue),
            }),
        });
    }

    function mockUpdateChain(options?: { withReturning?: any[] }) {
        const chain: any = {
            set: () => ({
                where: () => (options?.withReturning
                    ? { returning: jest.fn().mockResolvedValue(options.withReturning) }
                    : undefined),
            }),
        };
        mockedDb.update.mockReturnValue(chain);
    }

    test("createUserService returns created user", async () => {
        const created = [{ id: 1, fullname: "John Doe", email: "john@example.com" }];
        mockInsertReturning(created);

        const result = await createUserService({
            fullname: "John Doe",
            email: "john@example.com",
            password: "hashed",
            role: "user",
            isActive: true,
        } as any);

        expect(result).toEqual(created[0]);
        expect(mockedDb.insert).toHaveBeenCalled();
    });

    test("getUserByEmailService returns user if found", async () => {
        const user = { id: 2, email: "jane@example.com" };
        mockedDb.query.users.findFirst.mockResolvedValue(user);

        const result = await getUserByEmailService("jane@example.com");
        expect(result).toEqual(user);
        expect(mockedDb.query.users.findFirst).toHaveBeenCalled();
    });

    test("getUserByEmailService returns null if not found", async () => {
        mockedDb.query.users.findFirst.mockResolvedValue(null);
        const result = await getUserByEmailService("nobody@example.com");
        expect(result).toBeNull();
    });

    test("verifyUserService updates isActive and returns message", async () => {
        mockUpdateChain();
        const result = await verifyUserService("verify@example.com");
        expect(result).toBe("User verified successfully");
        expect(mockedDb.update).toHaveBeenCalled();
    });

    test("userLoginService returns user row from DB", async () => {
        const user = { id: 3, email: "a@b.com", password: "p", role: "user", isActive: true };
        mockedDb.query.users.findFirst.mockResolvedValue(user);
        const result = await userLoginService("a@b.com", "secret");
        expect(result).toEqual(user);
        expect(mockedDb.query.users.findFirst).toHaveBeenCalled();
    });

    test("getAllUsersService returns users list", async () => {
        const items = [{ id: 1 }, { id: 2 }];
        mockedDb.query.users.findMany.mockResolvedValue(items);
        const result = await getAllUsersService();
        expect(result).toEqual(items);
        expect(mockedDb.query.users.findMany).toHaveBeenCalled();
    });

    test("updateUserByIdService updates and returns message", async () => {
        mockUpdateChain();
        const result = await updateUserByIdService(10, { fullname: "New" } as any);
        expect(result).toBe("User updated successfully");
        expect(mockedDb.update).toHaveBeenCalled();
    });

    test("getUserByIdService returns user if found", async () => {
        const user = { id: 9, email: "id@user.com" };
        mockedDb.query.users.findFirst.mockResolvedValue(user);
        const result = await getUserByIdService(9);
        expect(result).toEqual(user);
    });

    test("deactivateUserService updates and returns message", async () => {
        mockUpdateChain();
        const result = await deactivateUserService(7);
        expect(result).toBe("User deactivated successfully");
        expect(mockedDb.update).toHaveBeenCalled();
    });
});


