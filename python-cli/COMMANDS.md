# Task Manager CLI - Command Reference

## Authentication

### Login
```bash
taskmanager auth login <email> <password>
```
Example:
```bash
taskmanager auth login user@example.com mypassword
```

### Register
```bash
taskmanager auth register <fullname> <email> <password>
```
Example:
```bash
taskmanager auth register "John Doe" john@example.com securepassword123
```

### View Current User
```bash
taskmanager auth me
```

## Tasks

### Create Task
```bash
taskmanager tasks create <title> <category_id> <due_date> [--priority PRIORITY] [--description DESCRIPTION] [--status STATUS]
```
Options:
- `--priority`: LOW, MEDIUM (default), HIGH
- `--description`: Optional task description
- `--status`: Initial status (default: "pending")

Example:
```bash
taskmanager tasks create "Finish project" 1 "2023-12-31T23:59:59" --priority HIGH --description "Final project deliverables"
```

### List Tasks
```bash
taskmanager tasks list
```

### Complete Task
```bash
taskmanager tasks complete <task_id>
```

## Categories

### Create Category
```bash
taskmanager categories create <name> <description> [--color COLOR]
```

### List Categories
```bash
taskmanager categories list
```

## Global Options

- `--help`: Show help for any command