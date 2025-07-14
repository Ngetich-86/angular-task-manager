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

    describe("getAllTasks", () => {
        it("should return all tasks for a user", async () => {
            // arrange
            (db.query.tasks.findMany as jest.Mock).mockResolvedValue([mockTask]);
            // act
            const result = await taskService.getAllTasks(mockUserId);
            // assert
            expect(db.query.tasks.findMany).toHaveBeenCalledWith({
                where: sql`${tasks.userId} = ${mockUserId}`
            });
            expect(result).toEqual([mockTask]);
        });
        
        it('should return empty array if no tasks found', async () => {
            // Arrange
            (db.query.tasks.findMany as jest.Mock).mockResolvedValue([]);
            // Act
            const result = await taskService.getAllTasks(mockUserId);
            // Assert
            expect(result).toEqual([]);
        });
    });

    describe('getTaskById', () => {
        it('should return task when ID exists and belongs to user', async () => {
          // Arrange
          (db.query.tasks.findFirst as jest.Mock).mockResolvedValue(mockTask);

          // Act
          const result = await taskService.getTaskById(mockTaskId.toString(), mockUserId);

          // Assert
          expect(db.query.tasks.findFirst).toHaveBeenCalledWith({
            where: sql`${tasks.id} = ${mockTaskId.toString()} AND ${tasks.userId} = ${mockUserId}`
          });
          expect(result).toEqual(mockTask);
        });
        it('should return null when task does not exist or not owned by user', async () => {
          // Arrange
          (db.query.tasks.findFirst as jest.Mock).mockResolvedValue(null);

          // Act
          const result = await taskService.getTaskById('nonexistent-id', mockUserId);

          // Assert
          expect(db.query.tasks.findFirst).toHaveBeenCalledWith({
            where: sql`${tasks.id} = ${'nonexistent-id'} AND ${tasks.userId} = ${mockUserId}`
          });
          expect(result).toBeNull();
        });
      });

    describe('updateTaskById', () => {
        it('should update task successfully', async () => {
            // Arrange
            const taskId = '123';
            const userId = 1;
            const updateData = {
                title: 'Updated Task',
                description: 'Updated description',
                status: 'completed',
                priority: 'HIGH' as const
            };
            const setMock = jest.fn().mockReturnThis();
            const whereMock = jest.fn().mockResolvedValue(undefined);
            (db.update as jest.Mock).mockReturnValue({
                set: setMock,
                where: whereMock
            });

            // Act
            const result = await taskService.updateTaskById(taskId, userId, updateData);

            // Assert
            expect(db.update).toHaveBeenCalledWith(tasks);
            expect(setMock).toHaveBeenCalledWith(updateData);
            expect(whereMock).toHaveBeenCalledWith(sql`${tasks.id} = ${taskId} AND ${tasks.userId} = ${userId}`);
            expect(result).toBe("Task updated successfully");
        });
    });

    describe('deleteTaskById', () => {
        it('should delete task successfully', async () => {
            // Arrange
            const taskId = '123';
            const userId = 1;
            const whereMock = jest.fn().mockResolvedValue(undefined);
            (db.delete as jest.Mock).mockReturnValue({
                where: whereMock
            });

            // Act
            const result = await taskService.deleteTaskById(taskId, userId);

            // Assert
            expect(db.delete).toHaveBeenCalledWith(tasks);
            expect(whereMock).toHaveBeenCalledWith(sql`${tasks.id} = ${taskId} AND ${tasks.userId} = ${userId}`);
            expect(result).toBe("Task deleted successfully");
        });
    });

    describe('getTasksByStatus', () => {
        it('should return tasks by status', async () => {
            // Arrange
            const userId = 1;
            const status = 'pending';
            (db.query.tasks.findMany as jest.Mock).mockResolvedValue([mockTask]);

            // Act
            const result = await taskService.getTasksByStatus(userId, status);

            // Assert
            expect(db.query.tasks.findMany).toHaveBeenCalledWith({
                where: sql`${tasks.userId} = ${userId} AND ${tasks.status} = ${status}`
            });
            expect(result).toEqual([mockTask]);
        });

        it('should return empty array when no tasks found for status', async () => {
            // Arrange
            const userId = 1;
            const status = 'completed';
            (db.query.tasks.findMany as jest.Mock).mockResolvedValue([]);

            // Act
            const result = await taskService.getTasksByStatus(userId, status);

            // Assert
            expect(result).toEqual([]);
        });
    });

    describe('getTasksByPriority', () => {
        it('should return tasks by priority', async () => {
            // Arrange
            const userId = 1;
            const priority = 'HIGH';
            (db.query.tasks.findMany as jest.Mock).mockResolvedValue([mockTask]);

            // Act
            const result = await taskService.getTasksByPriority(userId, priority);

            // Assert
            expect(db.query.tasks.findMany).toHaveBeenCalledWith({
                where: sql`${tasks.userId} = ${userId} AND ${tasks.priority} = ${priority}`
            });
            expect(result).toEqual([mockTask]);
        });

        it('should return empty array when no tasks found for priority', async () => {
            // Arrange
            const userId = 1;
            const priority = 'LOW';
            (db.query.tasks.findMany as jest.Mock).mockResolvedValue([]);

            // Act
            const result = await taskService.getTasksByPriority(userId, priority);

            // Assert
            expect(result).toEqual([]);
        });
    });

    describe('getTasksByCategory', () => {
        it('should return tasks by category', async () => {
            // Arrange
            const userId = 1;
            const categoryId = 1;
            (db.query.tasks.findMany as jest.Mock).mockResolvedValue([mockTask]);

            // Act
            const result = await taskService.getTasksByCategory(userId, categoryId);

            // Assert
            expect(db.query.tasks.findMany).toHaveBeenCalledWith({
                where: sql`${tasks.userId} = ${userId} AND ${tasks.categoryId} = ${categoryId}`
            });
            expect(result).toEqual([mockTask]);
        });

        it('should return empty array when no tasks found for category', async () => {
            // Arrange
            const userId = 1;
            const categoryId = 999;
            (db.query.tasks.findMany as jest.Mock).mockResolvedValue([]);

            // Act
            const result = await taskService.getTasksByCategory(userId, categoryId);

            // Assert
            expect(result).toEqual([]);
        });
    });

    describe('getCompletedTasks', () => {
        it('should return completed tasks', async () => {
            // Arrange
            const userId = 1;
            const completedTask = { ...mockTask, completed: true };
            (db.query.tasks.findMany as jest.Mock).mockResolvedValue([completedTask]);

            // Act
            const result = await taskService.getCompletedTasks(userId);

            // Assert
            expect(db.query.tasks.findMany).toHaveBeenCalledWith({
                where: sql`${tasks.userId} = ${userId} AND ${tasks.completed} = true`
            });
            expect(result).toEqual([completedTask]);
        });

        it('should return empty array when no completed tasks', async () => {
            // Arrange
            const userId = 1;
            (db.query.tasks.findMany as jest.Mock).mockResolvedValue([]);

            // Act
            const result = await taskService.getCompletedTasks(userId);

            // Assert
            expect(result).toEqual([]);
        });
    });

    describe('getPendingTasks', () => {
        it('should return pending tasks', async () => {
            // Arrange
            const userId = 1;
            const pendingTask = { ...mockTask, completed: false };
            (db.query.tasks.findMany as jest.Mock).mockResolvedValue([pendingTask]);

            // Act
            const result = await taskService.getPendingTasks(userId);

            // Assert
            expect(db.query.tasks.findMany).toHaveBeenCalledWith({
                where: sql`${tasks.userId} = ${userId} AND ${tasks.completed} = false`
            });
            expect(result).toEqual([pendingTask]);
        });

        it('should return empty array when no pending tasks', async () => {
            // Arrange
            const userId = 1;
            (db.query.tasks.findMany as jest.Mock).mockResolvedValue([]);

            // Act
            const result = await taskService.getPendingTasks(userId);

            // Assert
            expect(result).toEqual([]);
        });
    });

    describe('toggleTaskCompletion', () => {
        it('should toggle task completion to true', async () => {
            // Arrange
            const taskId = '123';
            const userId = 1;
            const completed = true;
            const setMock = jest.fn().mockReturnThis();
            const whereMock = jest.fn().mockResolvedValue(undefined);
            (db.update as jest.Mock).mockReturnValue({
                set: setMock,
                where: whereMock
            });

            // Act
            const result = await taskService.toggleTaskCompletion(taskId, userId, completed);

            // Assert
            expect(db.update).toHaveBeenCalledWith(tasks);
            expect(setMock).toHaveBeenCalledWith({ completed });
            expect(whereMock).toHaveBeenCalledWith(sql`${tasks.id} = ${taskId} AND ${tasks.userId} = ${userId}`);
            expect(result).toBe("Task completion status updated");
        });

        it('should toggle task completion to false', async () => {
            // Arrange
            const taskId = '123';
            const userId = 1;
            const completed = false;
            const setMock = jest.fn().mockReturnThis();
            const whereMock = jest.fn().mockResolvedValue(undefined);
            (db.update as jest.Mock).mockReturnValue({
                set: setMock,
                where: whereMock
            });

            // Act
            const result = await taskService.toggleTaskCompletion(taskId, userId, completed);

            // Assert
            expect(setMock).toHaveBeenCalledWith({ completed });
            expect(result).toBe("Task completion status updated");
        });
    });

    describe('getOverdueTasks', () => {
        it('should return overdue tasks', async () => {
            // Arrange
            const userId = 1;
            const overdueTask = { ...mockTask, dueDate: new Date('2023-01-01'), completed: false };
            (db.query.tasks.findMany as jest.Mock).mockResolvedValue([overdueTask]);

            // Act
            const result = await taskService.getOverdueTasks(userId);

            // Assert
            expect(db.query.tasks.findMany).toHaveBeenCalledWith({
                where: sql`${tasks.userId} = ${userId} AND ${tasks.dueDate} < ${expect.any(Date)} AND ${tasks.completed} = false`
            });
            expect(result).toEqual([overdueTask]);
        });

        it('should return empty array when no overdue tasks', async () => {
            // Arrange
            const userId = 1;
            (db.query.tasks.findMany as jest.Mock).mockResolvedValue([]);

            // Act
            const result = await taskService.getOverdueTasks(userId);

            // Assert
            expect(result).toEqual([]);
        });
    });

    describe('getTasksDueToday', () => {
        it('should return tasks due today', async () => {
            // Arrange
            const userId = 1;
            const todayTask = { ...mockTask, dueDate: new Date() };
            (db.query.tasks.findMany as jest.Mock).mockResolvedValue([todayTask]);

            // Act
            const result = await taskService.getTasksDueToday(userId);

            // Assert
            expect(db.query.tasks.findMany).toHaveBeenCalledWith({
                where: sql`${tasks.userId} = ${userId} AND ${tasks.dueDate} >= ${expect.any(Date)} AND ${tasks.dueDate} < ${expect.any(Date)}`
            });
            expect(result).toEqual([todayTask]);
        });

        it('should return empty array when no tasks due today', async () => {
            // Arrange
            const userId = 1;
            (db.query.tasks.findMany as jest.Mock).mockResolvedValue([]);

            // Act
            const result = await taskService.getTasksDueToday(userId);

            // Assert
            expect(result).toEqual([]);
        });
    });
});