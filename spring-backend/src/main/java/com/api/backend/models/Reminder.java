package com.api.backend.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reminders")
public class Reminder extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    @Column(name = "reminder_time", nullable = false)
    private LocalDateTime reminderTime;

    @Column(name = "message")
    private String message;
    
    @Column(name = "sent", nullable = false)
    private Boolean sent = false;

    // Constructors
    public Reminder() { super(); }

    public Task getTask() { return task; }
    public void setTask(Task task) { this.task = task; }
    public LocalDateTime getReminderTime() { return reminderTime; }
    public void setReminderTime(LocalDateTime reminderTime) { this.reminderTime = reminderTime; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public Boolean getSent() { return sent; }
    public void setSent(Boolean sent) { this.sent = sent; }
}
