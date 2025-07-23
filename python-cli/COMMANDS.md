# Task Manager CLI - Command Reference

## Authentication

### Login
```bash
python -m src.task_manager_cli.cli auth login
```
You will be prompted for your email and password.

### Register
```bash
python -m src.task_manager_cli.cli auth register
```
You will be prompted for your full name, email, and password (with confirmation).

### View Current User
```bash
python -m src.task_manager_cli.cli auth me
```

### Logout
```bash
python -m src.task_manager_cli.cli auth logout
```

## Tasks

### Create Task
```bash
python -m src.task_manager_cli.cli tasks create <title> <category_id> <due_date> [--priority PRIORITY] [--description DESCRIPTION] [--status STATUS]
```
Options:
- `--priority`: LOW, MEDIUM (default), HIGH
- `--description`: Optional task description
- `--status`: Initial status (default: "pending")

Example:
```bash
python -m src.task_manager_cli.cli tasks create "Finish project" 1 "2023-12-31" --priority HIGH --description "Final project deliverables"
```

### List Tasks
```bash
python -m src.task_manager_cli.cli tasks list
```

### Show Task Details
```bash
python -m src.task_manager_cli.cli tasks show <task_id>
```

### Update Task
```bash
python -m src.task_manager_cli.cli tasks update <task_id> [--title TITLE] [--description DESCRIPTION] [--status STATUS] [--due-date DUE_DATE] [--priority PRIORITY] [--category-id CATEGORY_ID]
```

### Delete Task
```bash
python -m src.task_manager_cli.cli tasks delete <task_id>
```

## Global Options

- `--help`: Show help for any command