import typer
import os
import json
from typing import Optional
from task_manager_cli.utils.api import api_client, APIError
from task_manager_cli.models import User

CONFIG_PATH = os.path.expanduser("~/.task_manager_cli_config.json")

def save_session(token: str, user_id: Optional[int], email: str):
    data = {"token": token, "user_id": user_id, "email": email}
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
def login(email: str = typer.Option(..., prompt=True), password: str = typer.Option(..., prompt=True, hide_input=True)):
    """Login to the system"""
    try:
        response = api_client.request("POST", "/login", {
            "email": email,
            "password": password
        })
        token = response.get("token") or response.get("access_token")
        user_id = response.get("user", {}).get("id") or response.get("user_id")
        if not token:
            typer.echo("Login failed: No token returned.", err=True)
            raise typer.Exit(code=1)
        api_client.set_token(token)
        save_session(token, user_id, email)
        typer.echo("Login successful! Token saved.")
    except APIError as e:
        typer.echo(f"Login failed: {e}", err=True)
    except Exception as e:
        typer.echo(f"Login failed: {e}", err=True)

@app.command()
def register(fullname: str = typer.Option(..., prompt=True), email: str = typer.Option(..., prompt=True), password: str = typer.Option(..., prompt=True, hide_input=True, confirmation_prompt=True)):
    """Register a new user"""
    try:
        response = api_client.request("POST", "/register", {
            "fullname": fullname,
            "email": email,
            "password": password
        })
        typer.echo(f"User created with ID: {response.get('id', '-')}")
    except APIError as e:
        typer.echo(f"Registration failed: {e}", err=True)
    except Exception as e:
        typer.echo(f"Registration failed: {e}", err=True)

@app.command()
def me():
    """Get current user info"""
    try:
        session = load_session()
        if session and session.get("token"):
            api_client.set_token(session["token"])
        response = api_client.request("GET", "/auth/me")
        user = User(response)
        typer.echo(f"User ID: {user.id}")
        typer.echo(f"Name: {user.fullname}")
        typer.echo(f"Email: {user.email}")
        typer.echo(f"Role: {user.role}")
    except APIError as e:
        typer.echo(f"Failed to get user info: {e}", err=True)
    except Exception as e:
        typer.echo(f"Failed to get user info: {e}", err=True)

@app.command()
def logout():
    """Logout and clear your session."""
    try:
        clear_session()
        api_client.set_token(None)
        typer.echo("Logged out and session cleared.")
    except Exception as e:
        typer.echo(f"Logout failed: {e}", err=True)
