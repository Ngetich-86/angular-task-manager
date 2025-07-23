# Task Manager CLI

A Python CLI for managing tasks through a Node.js backend API.

## Installation

```bash
pip install -e .
```

## Usage

### Authentication
```bash
# Login
taskmanager auth login <email> <password>

# Register new user
taskmanager auth register <fullname> <email> <password>

# View current user
taskmanager auth me
```

### Task Management
```bash
# Create task
taskmanager tasks create <title> <category_id> <due_date> [--priority PRIORITY]

# List tasks
taskmanager tasks list

# Complete task
taskmanager tasks complete <task_id>
```

For full command documentation see [COMMANDS.md](COMMANDS.md)