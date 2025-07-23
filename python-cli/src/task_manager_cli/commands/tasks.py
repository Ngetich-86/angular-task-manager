import typer
from datetime import datetime
from typing import Optional
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from task_manager_cli.utils.api import api_client
from task_manager_cli.models import Task, Priority

console = Console()
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
            console.print("[bold red]Invalid due date format. Use YYYY-MM-DD.[/bold red]")
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
        console.print(f"[bold green]Task created with ID:[/bold green] {task.id}")
    except Exception as e:
        console.print(f"[bold red]Failed to create task:[/bold red] {e}")

@app.command()
def list():
    """List all tasks"""
    try:
        response = api_client.request("GET", "/tasks")
        if not response:
            console.print("[yellow]No tasks found.[/yellow]")
            return
        tasks = [Task(task_data) for task_data in response]
        table = Table(title="[bold cyan]Tasks[/bold cyan]")
        table.add_column("ID", style="bold")
        table.add_column("Title", style="bold magenta")
        table.add_column("Status", style="cyan")
        table.add_column("Due Date", style="green")
        table.add_column("Priority", style="yellow")
        for task in tasks:
            table.add_row(
                str(task.id),
                task.title,
                task.status,
                task.due_date.strftime("%Y-%m-%d") if task.due_date else "-",
                str(task.priority)
            )
        console.print(table)
    except Exception as e:
        console.print(f"[bold red]Failed to list tasks:[/bold red] {e}")

@app.command()
def show(task_id: int = typer.Argument(..., help="Task ID")):
    """Show details for a task"""
    try:
        response = api_client.request("GET", f"/tasks/{task_id}")
        task = Task(response)
        panel = Panel(
            f"[bold]Title:[/bold] {task.title}\n"
            f"[bold]Description:[/bold] {task.description or '-'}\n"
            f"[bold]Status:[/bold] {task.status}\n"
            f"[bold]Due Date:[/bold] {task.due_date.strftime('%Y-%m-%d') if task.due_date else '-'}\n"
            f"[bold]Priority:[/bold] {task.priority}\n"
            f"[bold]Category ID:[/bold] {task.category_id}\n"
            f"[bold]Created At:[/bold] {task.created_at.strftime('%Y-%m-%d %H:%M:%S') if task.created_at else '-'}\n"
            f"[bold]Updated At:[/bold] {task.updated_at.strftime('%Y-%m-%d %H:%M:%S') if task.updated_at else '-'}",
            title=f"[bold cyan]Task {task.id}[/bold cyan]", expand=False
        )
        console.print(panel)
    except Exception as e:
        console.print(f"[bold red]Failed to show task:[/bold red] {e}")

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
                console.print("[bold red]Invalid due date format. Use YYYY-MM-DD.[/bold red]")
                raise typer.Exit(code=1)
        if priority is not None:
            task_data["priority"] = priority.value
        if category_id is not None:
            task_data["category_id"] = category_id
        if not task_data:
            console.print("[bold yellow]No fields to update.[/bold yellow]")
            raise typer.Exit(code=1)
        response = api_client.request("PUT", f"/tasks/{task_id}", task_data)
        console.print(f"[bold green]Task updated with ID:[/bold green] {task_id}")
    except Exception as e:
        console.print(f"[bold red]Failed to update task:[/bold red] {e}")

@app.command()
def delete(task_id: int = typer.Argument(..., help="Task ID")):
    """Delete a task"""
    try:
        api_client.request("DELETE", f"/tasks/{task_id}")
        console.print(f"[bold green]Task deleted with ID:[/bold green] {task_id}")
    except Exception as e:
        console.print(f"[bold red]Failed to delete task:[/bold red] {e}")