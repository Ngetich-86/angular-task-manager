# import typer
# import os
# import json
# from typing import Optional
# from rich.console import Console
# from rich.panel import Panel
# from rich.prompt import Prompt
# from task_manager_cli.utils.api import api_client, APIError
# from task_manager_cli.models import User

# CONFIG_PATH = os.path.expanduser("~/.task_manager_cli_config.json")
# console = Console()

# def save_session(token: str, user_id: Optional[int], email: str):
#     data = {"token": token, "user_id": user_id, "email": email}
#     with open(CONFIG_PATH, "w") as f:
#         json.dump(data, f)

# def load_session():
#     if not os.path.exists(CONFIG_PATH):
#         return None
#     with open(CONFIG_PATH, "r") as f:
#         return json.load(f)

# def clear_session():
#     if os.path.exists(CONFIG_PATH):
#         os.remove(CONFIG_PATH)

# app = typer.Typer()

# @app.command()
# def login():
#     """Login to the system"""
#     try:
#         email = Prompt.ask("[bold cyan]Email[/bold cyan]")
#         password = Prompt.ask("[bold cyan]Password[/bold cyan]", password=True)
#         response = api_client.request("POST", "/login", {
#             "email": email,
#             "password": password
#         })
#         token = response.get("token") or response.get("access_token")
#         user_id = response.get("user", {}).get("id") or response.get("user_id")
#         if not token:
#             console.print("[bold red]Login failed: No token returned.[/bold red]")
#             raise typer.Exit(code=1)
#         api_client.set_token(token)
#         save_session(token, user_id, email)
#         console.print("[bold green]Login successful! Token saved.[/bold green]")
#     except APIError as e:
#         console.print(f"[bold red]Login failed:[/bold red] {e}")
#     except Exception as e:
#         console.print(f"[bold red]Login failed:[/bold red] {e}")

# @app.command()
# def register():
#     """Register a new user"""
#     try:
#         fullname = Prompt.ask("[bold cyan]Full Name[/bold cyan]")
#         email = Prompt.ask("[bold cyan]Email[/bold cyan]")
#         password = Prompt.ask("[bold cyan]Password[/bold cyan]", password=True)
#         password2 = Prompt.ask("[bold cyan]Confirm Password[/bold cyan]", password=True)
#         if password != password2:
#             console.print("[bold red]Passwords do not match.[/bold red]")
#             raise typer.Exit(code=1)
#         response = api_client.request("POST", "/register", {
#             "fullname": fullname,
#             "email": email,
#             "password": password
#         })
#         console.print(f"[bold green]User created with ID:[/bold green] {response.get('id', '-')}")
#     except APIError as e:
#         console.print(f"[bold red]Registration failed:[/bold red] {e}")
#     except Exception as e:
#         console.print(f"[bold red]Registration failed:[/bold red] {e}")

# @app.command()
# def me():
#     """Get current user info"""
#     try:
#         session = load_session()
#         if session and session.get("token"):
#             api_client.set_token(session["token"])
#         response = api_client.request("GET", "/auth/me")
#         user = User(response)
#         panel = Panel(
#             f"[bold]User ID:[/bold] {user.id}\n"
#             f"[bold]Name:[/bold] {user.fullname}\n"
#             f"[bold]Email:[/bold] {user.email}\n"
#             f"[bold]Role:[/bold] {user.role}",
#             title="[bold cyan]Current User[/bold cyan]", expand=False
#         )
#         console.print(panel)
#     except APIError as e:
#         console.print(f"[bold red]Failed to get user info:[/bold red] {e}")
#     except Exception as e:
#         console.print(f"[bold red]Failed to get user info:[/bold red] {e}")

# @app.command()
# def logout():
#     """Logout and clear your session."""
#     try:
#         clear_session()
#         api_client.set_token(None)
#         console.print("[bold green]Logged out and session cleared.[/bold green]")
#     except Exception as e:
#         console.print(f"[bold red]Logout failed:[/bold red] {e}")


import typer
import os
import json
from typing import Optional
from rich.console import Console
from rich.panel import Panel
from rich.prompt import Prompt
from task_manager_cli.utils.api import api_client, APIError
from task_manager_cli.models import User

CONFIG_PATH = os.path.expanduser("~/.task_manager_cli_config.json")
console = Console()

def save_session(user_id: Optional[int], email: str):
    data = {"user_id": user_id, "email": email}
    with open(CONFIG_PATH, "w") as f:
        json.dump(data, f)

def load_session():
    if not os.path.exists(CONFIG_PATH):
        return None
    with open(CONFIG_PATH, "r") as f:
        return json.load(f)

def clear_session():
    if os.path.exists(CONFIG_PATH):
        os.remove(CONFIG_PATH)

app = typer.Typer()

@app.command()
def login():
    """Login to the system"""
    try:
        email = Prompt.ask("[bold cyan]Email[/bold cyan]")
        password = Prompt.ask("[bold cyan]Password[/bold cyan]", password=True)
        response = api_client.request("POST", "/login", {
            "email": email,
            "password": password
        })
        user = response.get("user")
        if not user:
            console.print("[bold red]Login failed: No user returned.[/bold red]")
            raise typer.Exit(code=1)
        user_id = user.get("id")
        save_session(user_id, email)
        console.print("[bold green]Login successful![/bold green]")
    except APIError as e:
        console.print(f"[bold red]Login failed:[/bold red] {e}")
    except Exception as e:
        console.print(f"[bold red]Login failed:[/bold red] {e}")

@app.command()
def register():
    """Register a new user"""
    try:
        fullname = Prompt.ask("[bold cyan]Full Name[/bold cyan]")
        email = Prompt.ask("[bold cyan]Email[/bold cyan]")
        password = Prompt.ask("[bold cyan]Password[/bold cyan]", password=True)
        password2 = Prompt.ask("[bold cyan]Confirm Password[/bold cyan]", password=True)
        if password != password2:
            console.print("[bold red]Passwords do not match.[/bold red]")
            raise typer.Exit(code=1)
        response = api_client.request("POST", "/register", {
            "fullname": fullname,
            "email": email,
            "password": password
        })
        if response.get("message"):
            console.print(f"[bold green]{response['message']}[/bold green]")
        else:
            console.print(f"[bold yellow]Registration response: {response}[/bold yellow]")
    except APIError as e:
        console.print(f"[bold red]Registration failed:[/bold red] {e}")
    except Exception as e:
        console.print(f"[bold red]Registration failed:[/bold red] {e}")

@app.command()
def me():
    """Get current user info"""
    try:
        session = load_session()
        if not session or not session.get("user_id"):
            console.print("[bold red]No session found. Please login first.[/bold red]")
            raise typer.Exit(code=1)
        user_id = session["user_id"]
        response = api_client.request("GET", f"/user/{user_id}")
        user = response.get("user")
        if not user:
            console.print("[bold red]User not found.[/bold red]")
            raise typer.Exit(code=1)
        panel = Panel(
            f"[bold]User ID:[/bold] {user.get('id')}\n"
            f"[bold]Name:[/bold] {user.get('fullname')}\n"
            f"[bold]Email:[/bold] {user.get('email')}\n"
            f"[bold]Role:[/bold] {user.get('role', '-')}",
            title="[bold cyan]Current User[/bold cyan]", expand=False
        )
        console.print(panel)
    except APIError as e:
        console.print(f"[bold red]Failed to get user info:[/bold red] {e}")
    except Exception as e:
        console.print(f"[bold red]Failed to get user info:[/bold red] {e}")

@app.command()
def logout():
    """Logout and clear your session."""
    try:
        clear_session()
        console.print("[bold green]Logged out and session cleared.[/bold green]")
    except Exception as e:
        console.print(f"[bold red]Logout failed:[/bold red] {e}")