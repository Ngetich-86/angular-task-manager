export {};
jest.mock("../../src/drizzle/db", () => {
    const insert = jest.fn();
    const update = jest.fn();
    const del = jest.fn();
    const select = jest.fn();
    const query = {
        categories: {
            findMany: jest.fn(),
            findFirst: jest.fn(),
        }
    };
    return {
        __esModule: true,
        default: { insert, update, delete: del, select, query },
    };
});

const db = require("../../src/drizzle/db").default as any;
const { CategoryService } = require("../../src/category/category.service");

const mockedDb = db as unknown as {
    insert: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    select: jest.Mock;
    query: { categories: { findMany: jest.Mock; findFirst: jest.Mock } };
};

describe("CategoryService - unit", () => {
    const service = new CategoryService();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    function mockInsertReturning(returnValue: any[]) {
        mockedDb.insert.mockReturnValue({
            values: () => ({ returning: jest.fn().mockResolvedValue(returnValue) })
        });
    }

    function mockUpdateReturning(returnValue: any[]) {
        mockedDb.update.mockReturnValue({
            set: () => ({ where: () => ({ returning: jest.fn().mockResolvedValue(returnValue) }) })
        });
    }

    test("createCategory returns success with created category", async () => {
        const created = [{ id: 1, name: "Work", userId: 1 }];
        mockInsertReturning(created);
        const res = await service.createCategory({ name: "Work", description: "", color: "#fff", userId: 1 } as any);
        expect(res.success).toBe(true);
        expect(res.category).toEqual(created[0]);
    });

    test("createCategory handles error and returns failure", async () => {
        mockedDb.insert.mockReturnValue({ values: () => ({ returning: jest.fn().mockRejectedValue(new Error("db")) }) });
        const res = await service.createCategory({ name: "Work", description: "", color: "#fff", userId: 1 } as any);
        expect(res.success).toBe(false);
    });

    test("getAllCategories returns array", async () => {
        const rows = [{ id: 1 }];
        mockedDb.query.categories.findMany.mockResolvedValue(rows);
        const res = await service.getAllCategories(1);
        expect(res).toEqual(rows);
    });

    test("getCategoryById returns single or null", async () => {
        const row = { id: 2 };
        mockedDb.query.categories.findFirst.mockResolvedValue(row);
        expect(await service.getCategoryById(2, 1)).toEqual(row);
        mockedDb.query.categories.findFirst.mockResolvedValue(null);
        expect(await service.getCategoryById(2, 1)).toBeNull();
    });

    test("updateCategory returns not found when missing", async () => {
        jest.spyOn(service, "getCategoryById").mockResolvedValueOnce(null as any);
        const res = await service.updateCategory(1, 1, { name: "N" } as any);
        expect(res.success).toBe(false);
        expect(res.message).toMatch(/not found/);
    });

    test("updateCategory returns success when updated", async () => {
        jest.spyOn(service, "getCategoryById").mockResolvedValueOnce({ id: 1 } as any);
        mockUpdateReturning([{ id: 1 }]);
        const res = await service.updateCategory(1, 1, { name: "N" } as any);
        expect(res.success).toBe(true);
    });

    test("deleteCategory returns not found when missing", async () => {
        jest.spyOn(service, "getCategoryById").mockResolvedValueOnce(null as any);
        const res = await service.deleteCategory(1, 1);
        expect(res.success).toBe(false);
        expect(res.message).toMatch(/not found/);
    });

    test("deleteCategory returns success when deleted", async () => {
        jest.spyOn(service, "getCategoryById").mockResolvedValueOnce({ id: 1 } as any);
        mockedDb.delete.mockReturnValue({ where: () => undefined });
        const res = await service.deleteCategory(1, 1);
        expect(res.success).toBe(true);
    });

    test("getCategoryByName returns item or null", async () => {
        const row = { id: 3 };
        mockedDb.query.categories.findFirst.mockResolvedValue(row);
        expect(await service.getCategoryByName("Work", 1)).toEqual(row);
        mockedDb.query.categories.findFirst.mockResolvedValue(null);
        expect(await service.getCategoryByName("Work", 1)).toBeNull();
    });
});


