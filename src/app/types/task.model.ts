export interface Task {
    id: string;
    title: string;
    description: string;
    due_date: Date;
    completed: boolean;
    priority: "Low" | "medium" | "High" | "Urgent";
    user_id:string;
    created_at:Date;
    updated_at:Date;
}

export type TaskCreatePayload = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>;
export type TaskUpdatePayload = Partial<TaskCreatePayload>;