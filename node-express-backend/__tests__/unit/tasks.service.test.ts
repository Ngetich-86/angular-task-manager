jest.mock("../../src/drizzle/db", () => {
    const insert = jest.fn();
    const update = jest.fn();
    const del = jest.fn();
    const select = jest.fn();
    return {
        __esModule: true,
        default: { insert, update, delete: del, select },
    };
});

const db = require("../../src/drizzle/db").default as any;
const { TaskService } = require("../../src/tasks/tasks.service");

const mockedDb = db as unknown as {
    insert: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    select: jest.Mock;
};

describe("TaskService - unit", () => {
    const service = new TaskService();

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

    function mockUpdateReturning(returnValue: any[]) {
        mockedDb.update.mockReturnValue({
            set: () => ({
                where: () => ({ returning: jest.fn().mockResolvedValue(returnValue) })
            })
        });
    }

    function mockDeleteReturning(returnValue: any[]) {
        mockedDb.delete.mockReturnValue({
            where: () => ({ returning: jest.fn().mockResolvedValue(returnValue) })
        });
    }

    function mockSelect(returnValue: any[]) {
        mockedDb.select.mockReturnValue({
            from: () => ({
                where: () => ({ orderBy: jest.fn().mockReturnValue(returnValue) }),
                orderBy: jest.fn().mockReturnValue(returnValue),
            })
        });
    }

    test("createTask validates required fields", async () => {
        const res = await service.createTask({} as any);
        expect(res.success).toBe(false);
        expect(res.message).toMatch(/Missing required fields/);
    });

    test("createTask inserts and returns task", async () => {
        const created = [{ id: 1, title: "T", userId: 1, categoryId: 1 }];
        mockInsertReturning(created);

        const res = await service.createTask({
            title: "T",
            description: "D",
            status: "pending",
            dueDate: new Date(),
            priority: "MEDIUM",
            completed: false,
            userId: 1,
            categoryId: 1,
        } as any);

        expect(res.success).toBe(true);
        expect(res.task).toEqual(created[0]);
        expect(mockedDb.insert).toHaveBeenCalled();
    });

    test("getAllTasks returns tasks", async () => {
        const rows = [{ id: 1 }, { id: 2 }];
        mockSelect(rows);
        const res = await service.getAllTasks(1);
        expect(res).toEqual(rows);
    });

    test("getTaskById returns single or null", async () => {
        const row = [{ id: 3 }];
        mockedDb.select.mockReturnValue({
            from: () => ({
                where: () => row,
            })
        });
        expect(await service.getTaskById(3, 1)).toEqual(row[0]);

        mockedDb.select.mockReturnValue({
            from: () => ({
                where: () => [],
            })
        });
        expect(await service.getTaskById(3, 1)).toBeNull();
    });

    test("updateTask returns success when row updated", async () => {
        mockUpdateReturning([{}]);
        const res = await service.updateTask(1, 1, { title: "N" } as any);
        expect(res.success).toBe(true);
    });

    test("updateTask returns not found when no rows", async () => {
        mockUpdateReturning([]);
        const res = await service.updateTask(1, 1, { title: "N" } as any);
        expect(res.success).toBe(false);
        expect(res.message).toMatch(/not found/);
    });

    test("deleteTask returns success when row deleted", async () => {
        mockDeleteReturning([{}]);
        const res = await service.deleteTask(1, 1);
        expect(res.success).toBe(true);
    });

    test("deleteTask returns not found when no rows", async () => {
        mockDeleteReturning([]);
        const res = await service.deleteTask(1, 1);
        expect(res.success).toBe(false);
        expect(res.message).toMatch(/not found/);
    });

    test("toggleTaskCompletion uses existing when no explicit flag and updates", async () => {
        // First call inside service.getTaskById
        mockedDb.select.mockReturnValueOnce({
            from: () => ({ where: () => [{ id: 1, completed: false }] })
        });
        // Then update returning
        mockUpdateReturning([{ completed: true }]);

        const res = await service.toggleTaskCompletion(1, 1);
        expect(res.success).toBe(true);
        expect(res.completed).toBe(true);
    });

    test("toggleTaskCompletion returns not found when task missing", async () => {
        mockedDb.select.mockReturnValueOnce({
            from: () => ({ where: () => [] })
        });
        const res = await service.toggleTaskCompletion(1, 1);
        expect(res.success).toBe(false);
        expect(res.message).toMatch(/not found/);
    });

    test("getTasksByStatus returns rows", async () => {
        mockedDb.select.mockReturnValue({
            from: () => ({
                where: () => [{ id: 1 }],
            })
        });
        const res = await service.getTasksByStatus(1, "pending");
        expect(res.length).toBe(1);
    });

    test("getTasksByPriority returns rows", async () => {
        mockedDb.select.mockReturnValue({
            from: () => ({
                where: () => [{ id: 2 }],
            })
        });
        const res = await service.getTasksByPriority(1, "MEDIUM");
        expect(res.length).toBe(1);
    });

    test("getTasksDueToday returns ordered rows", async () => {
        mockSelect([{ id: 3 }]);
        const res = await service.getTasksDueToday(1);
        expect(Array.isArray(res)).toBe(true);
    });

    test("getOverdueTasks returns ordered rows", async () => {
        mockSelect([{ id: 4 }]);
        const res = await service.getOverdueTasks(1);
        expect(Array.isArray(res)).toBe(true);
    });
});


