"""
task-manager CLI - Command-line interface for managing tasks.

Main entry point for the CLI application.
"""


# import click
# from rich.console import Console
# from rich.panel import Panel

# from .commands import auth, tasks
# from .utils.config import load_profile, load_config, ConfigError
# from .utils.api import DarajaAPI

# console = Console()

# @click.group()
# @click.version_option(version="0.1.0", prog_name="daraja")
# @click.pass_context
# def cli(ctx: click.Context) -> None:
#     """
#     Daraja Developer Toolkit CLI
    
#     Never lose another M-Pesa webhook again! 🇰🇪
    
#     Use 'daraja --help' to see available commands.
#     """
#     ctx.ensure_object(dict)
    
#     # Try to load config for commands that need it
#     try:
#         config_data = load_profile()
#         ctx.obj['config'] = config_data
#         ctx.obj['api'] = DarajaAPI(config_data)
#     except ConfigError:
#         # Config not available - that's okay for init/login commands
#         ctx.obj['config'] = None
#         ctx.obj['api'] = None

# @cli.command()
# @click.pass_context
# def init(ctx: click.Context) -> None:
#     """Initialize Daraja in your current project."""
#     console.print(Panel.fit(
#         "[bold green]🚀 Welcome to Daraja Developer Toolkit![/bold green]\n\n"
#         "Let's set up your M-Pesa webhook proxy...",
#         title="Daraja Init"
#     ))
    
#     # Check if already initialized
#     try:
#         load_config()
#         console.print("[yellow]⚠️  Daraja is already initialized in this project.[/yellow]")
#         if not click.confirm("Do you want to reconfigure?"):
#             return
#     except ConfigError:
#         pass
    
#     console.print("\n[bold]Step 1:[/bold] Let's get you logged in...")
#     ctx.invoke(auth.login)

# @cli.command()
# def version() -> None:
#     """Show version information."""
#     console.print("[bold green]Daraja CLI v0.1.0[/bold green]")
#     console.print("Part of Daraja Developer Toolkit")
#     console.print("Made with ❤️ in Kenya 🇰🇪")

# # Add command groups
# cli.add_command(auth.auth)
# cli.add_command(tasks.tasks)

# if __name__ == "__main__":
#     cli()

import typer
from .commands import auth, tasks, categories

app = typer.Typer()
app.add_typer(auth.app, name="auth")
app.add_typer(tasks.app, name="tasks")
app.add_typer(categories.app, name="categories")

def main():
    app()

if __name__ == "__main__":
    main()