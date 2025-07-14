import { TaskService }  from "../../src/task/task.services"
import db from "../../src/drizzle/db";
import { tasks } from "../../src/drizzle/schema";
import { sql } from "drizzle-orm";

jest.mock('../../src/drizzle/db');

describe("TaskService",() => {
    let taskService : TaskService;
    const mockUserId = 1;
    const mockTaskId = 123; // id should be a number
    const mockTask = {
        id: mockTaskId,
        userId: mockUserId,
        title: "Test Task",
        description: "This is a test task",
        status: "pending",
        priority: "MEDIUM" as const, // must be "LOW" | "MEDIUM" | "HIGH"
        categoryId: 1,
        completed: false,
        dueDate: new Date() 
    };

    beforeAll(() =>{
        taskService = new TaskService();
        jest.clearAllMocks(); // Clear mocks before each test
    })
    afterAll(() => {
        jest.useRealTimers(); // Restore real timers after tests
    })
    describe('createTask', () => {
        it('should create a task successfully', async () => {
            //arrange
            (db.insert as jest.Mock).mockReturnValue({
                values: jest.fn().mockReturnValue(mockTask)
            })
            //act
            const result = await taskService.createTask(mockTask);
            //assert
            expect(db.insert).toHaveBeenCalledWith(tasks);
            expect(result).toBe("Task created successfully");
        })
    })
        it("should return undefined if user not found", async () => {
            // arrange
            (db.query.users.findFirst as jest.Mock).mockResolvedValue(undefined);
            // act
            const result = await taskService.getTaskById(mockTaskId.toString(), mockUserId);
            // assert
            expect(result).toBeUndefined();
        });
    });