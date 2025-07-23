import typer
from datetime import datetime
from typing import Optional
from task_manager_cli.utils.api import api_client
from task_manager_cli.models import Task, Priority

app = typer.Typer()

@app.command()
def create(
    title: str = typer.Argument(..., help="Task title"),
    category_id: int = typer.Argument(..., help="Category ID"),
    due_date: str = typer.Argument(..., help="Due date (YYYY-MM-DD)"),
    priority: Priority = typer.Option(Priority.MEDIUM, help="Task priority: LOW, MEDIUM, HIGH"),
    description: Optional[str] = typer.Option(None, help="Task description"),
    status: str = typer.Option("pending", help="Task status")
):
    """Create a new task"""
    try:
        try:
            due_date_dt = datetime.fromisoformat(due_date)
        except ValueError:
            typer.echo("Invalid due date format. Use YYYY-MM-DD.", err=True)
            raise typer.Exit(code=1)
        response = api_client.request("POST", "/tasks", {
            "title": title,
            "description": description,
            "status": status,
            "due_date": due_date_dt.isoformat(),
            "priority": priority.value,
            "category_id": category_id
        })
        task = Task(response)
        typer.echo(f"Task created with ID: {task.id}")
    except Exception as e:
        typer.echo(f"Failed to create task: {e}", err=True)

@app.command()
def list():
    """List all tasks"""
    try:
        response = api_client.request("GET", "/tasks")
        if not response:
            typer.echo("No tasks found.")
            return
        tasks = [Task(task_data) for task_data in response]
        from rich.console import Console
        from rich.table import Table
        console = Console()
        table = Table(title="Tasks")
        table.add_column("ID")
        table.add_column("Title")
        table.add_column("Status")
        table.add_column("Due Date")
        table.add_column("Priority")
        for task in tasks:
            table.add_row(
                str(task.id),
                task.title,
                task.status,
                task.due_date.strftime("%Y-%m-%d"),
                task.priority
            )
        console.print(table)
    except Exception as e:
        typer.echo(f"Failed to list tasks: {e}", err=True)

@app.command()
def show(task_id: int = typer.Argument(..., help="Task ID")):
    """Show details for a task"""
    try:
        response = api_client.request("GET", f"/tasks/{task_id}")
        task = Task(response)
        from rich.console import Console
        from rich.panel import Panel
        console = Console()
        panel = Panel(
            f"[bold]Title:[/bold] {task.title}\n"
            f"[bold]Description:[/bold] {task.description or '-'}\n"
            f"[bold]Status:[/bold] {task.status}\n"
            f"[bold]Due Date:[/bold] {task.due_date.strftime('%Y-%m-%d')}\n"
            f"[bold]Priority:[/bold] {task.priority}\n"
            f"[bold]Category ID:[/bold] {task.category_id}\n"
            f"[bold]Created At:[/bold] {task.created_at.strftime('%Y-%m-%d %H:%M:%S')}\n"
            f"[bold]Updated At:[/bold] {task.updated_at.strftime('%Y-%m-%d %H:%M:%S') if task.updated_at else '-'}",
            title=f"Task {task.id}", expand=False
        )
        console.print(panel)
    except Exception as e:
        typer.echo(f"Failed to show task: {e}", err=True)

@app.command()
def update(
    task_id: int = typer.Argument(..., help="Task ID"),
    title: Optional[str] = typer.Option(None, help="Task title"),
    description: Optional[str] = typer.Option(None, help="Task description"),
    status: Optional[str] = typer.Option(None, help="Task status"),
    due_date: Optional[str] = typer.Option(None, help="Due date (YYYY-MM-DD)"),
    priority: Optional[Priority] = typer.Option(None, help="Task priority: LOW, MEDIUM, HIGH"),
    category_id: Optional[int] = typer.Option(None, help="Category ID")
):
    """Update a task"""
    try:
        task_data = {}
        if title is not None:
            task_data["title"] = title
        if description is not None:
            task_data["description"] = description
        if status is not None:
            task_data["status"] = status
        if due_date is not None:
            try:
                due_date_dt = datetime.fromisoformat(due_date)
                task_data["due_date"] = due_date_dt.isoformat()
            except ValueError:
                typer.echo("Invalid due date format. Use YYYY-MM-DD.", err=True)
                raise typer.Exit(code=1)
        if priority is not None:
            task_data["priority"] = priority.value
        if category_id is not None:
            task_data["category_id"] = category_id
        if not task_data:
            typer.echo("No fields to update.", err=True)
            raise typer.Exit(code=1)
        response = api_client.request("PUT", f"/tasks/{task_id}", task_data)
        typer.echo(f"Task updated with ID: {task_id}")
    except Exception as e:
        typer.echo(f"Failed to update task: {e}", err=True)

@app.command()
def delete(task_id: int = typer.Argument(..., help="Task ID")):
    """Delete a task"""
    try:
        api_client.request("DELETE", f"/tasks/{task_id}")
        typer.echo(f"Task deleted with ID: {task_id}")
    except Exception as e:
        typer.echo(f"Failed to delete task: {e}", err=True)