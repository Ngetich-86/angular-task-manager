# Task Manager CLI

A Python CLI for managing tasks through a Node.js backend API.

## Installation

```bash
pip install -e .
```

## Usage

### Authentication
```bash
# Login (you will be prompted for email and password)
python -m src.task_manager_cli.cli auth login

# Register new user (you will be prompted for name, email, password)
python -m src.task_manager_cli.cli auth register

# View current user
python -m src.task_manager_cli.cli auth me

# Logout
python -m src.task_manager_cli.cli auth logout
```

### Task Management
```bash
# Create task
python -m src.task_manager_cli.cli tasks create <title> <category_id> <due_date> [--priority PRIORITY] [--description DESCRIPTION] [--status STATUS]

# List tasks
python -m src.task_manager_cli.cli tasks list

# Show task details
python -m src.task_manager_cli.cli tasks show <task_id>

# Update task
python -m src.task_manager_cli.cli tasks update <task_id> [--title TITLE] [--description DESCRIPTION] [--status STATUS] [--due-date DUE_DATE] [--priority PRIORITY] [--category-id CATEGORY_ID]

# Delete task
python -m src.task_manager_cli.cli tasks delete <task_id>
```

For full command documentation see [COMMANDS.md](COMMANDS.md)