"""
task-manager CLI - Command-line interface for managing tasks.

Main entry point for the CLI application.
"""


import typer
from .commands import auth, tasks

app = typer.Typer(help="Task Manager CLI - Manage your tasks from the command line.")

app.add_typer(auth.app, name="auth")
app.add_typer(tasks.app, name="tasks")

@app.command()
def version():
    """Show version information."""
    typer.echo("Task Manager CLI v0.1.0")


def main():
    app()

if __name__ == "__main__":
    main()