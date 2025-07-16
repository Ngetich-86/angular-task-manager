import click
from rich.console import Console
from ..utils.config import load_profile, ConfigError
from ..utils.api import TaskManagerAPIClient, APIError

console = Console()

@click.group()
def tasks():
    """Task management commands."""
    pass

@tasks.command()
@click.option('--title', prompt=True, help='Task title')
@click.option('--description', prompt=True, help='Task description')
@click.option('--status', prompt=True, default='pending', help='Task status')
@click.option('--due-date', prompt=True, help='Due date (YYYY-MM-DD)')
@click.option('--priority', prompt=True, type=click.Choice(['LOW', 'MEDIUM', 'HIGH']), default='MEDIUM', help='Task priority')
@click.option('--category-id', prompt=True, help='Category ID')
def create(title, description, status, due_date, priority, category_id):
    """Create a new task."""
    try:
        profile = load_profile()
        client = TaskManagerAPIClient(profile)
        task_data = {
            'title': title,
            'description': description,
            'status': status,
            'dueDate': due_date,
            'priority': priority,
            'categoryId': int(category_id),
            'userId': int(profile['user_id'])
        }
        result = client.create_task(task_data)
        console.print(f"[green]Task created![/green] ID: {result.get('id')}")
    except (ConfigError, APIError) as e:
        console.print(f"[red]Error:[/red] {e}")

@tasks.command()
def list():
    """List all your tasks."""
    try:
        profile = load_profile()
        client = TaskManagerAPIClient(profile)
        tasks = client.get_tasks()
        if not tasks:
            console.print("[yellow]No tasks found.[/yellow]")
            return
        for t in tasks:
            console.print(f"[bold]{t['id']}[/bold]: {t['title']} | [cyan]{t['status']}[/cyan] | Due: {t['dueDate']} | Priority: {t['priority']}")
    except (ConfigError, APIError) as e:
        console.print(f"[red]Error:[/red] {e}")

@tasks.command()
@click.argument('task_id')
def show(task_id):
    """Show details for a task."""
    try:
        profile = load_profile()
        client = TaskManagerAPIClient(profile)
        task = client.get_task(task_id)
        if not task:
            console.print("[yellow]Task not found.[/yellow]")
            return
        console.print(task)
    except (ConfigError, APIError) as e:
        console.print(f"[red]Error:[/red] {e}")

@tasks.command()
@click.argument('task_id')
@click.option('--title', help='Task title')
@click.option('--description', help='Task description')
@click.option('--status', help='Task status')
@click.option('--due-date', help='Due date (YYYY-MM-DD)')
@click.option('--priority', type=click.Choice(['LOW', 'MEDIUM', 'HIGH']), help='Task priority')
@click.option('--category-id', type=int, help='Category ID')
def update(task_id, title, description, status, due_date, priority, category_id):
    """Update a task."""
    try:
        profile = load_profile()
        client = TaskManagerAPIClient(profile)
        task_data = {}
        if title: task_data['title'] = title
        if description: task_data['description'] = description
        if status: task_data['status'] = status
        if due_date: task_data['dueDate'] = due_date
        if priority: task_data['priority'] = priority
        if category_id: task_data['categoryId'] = category_id
        result = client.update_task(task_id, task_data)
        console.print(f"[green]Task updated![/green] ID: {result.get('id', task_id)}")
    except (ConfigError, APIError) as e:
        console.print(f"[red]Error:[/red] {e}")

@tasks.command()
@click.argument('task_id')
def delete(task_id):
    """Delete a task."""
    try:
        profile = load_profile()
        client = TaskManagerAPIClient(profile)
        client.delete_task(task_id)
        console.print(f"[green]Task deleted![/green] ID: {task_id}")
    except (ConfigError, APIError) as e:
        console.print(f"[red]Error:[/red] {e}")
