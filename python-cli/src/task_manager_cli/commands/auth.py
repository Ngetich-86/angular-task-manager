import click
import requests
from rich.console import Console
from ..utils import config as config_utils

console = Console()

@click.group()
def auth():
    """User authentication commands."""
    pass

@auth.command()
@click.option('--fullname', prompt=True, help='Your full name')
@click.option('--email', prompt=True, help='Your email address')
@click.option('--password', prompt=True, hide_input=True, confirmation_prompt=True, help='Your password')
def register(fullname, email, password):
    """Register a new user."""
    api_url = config_utils.get_config_value('api_url', 'http://localhost:5000')
    url = f"{api_url}/auth/register"
    data = {"fullname": fullname, "email": email, "password": password}
    try:
        resp = requests.post(url, json=data, timeout=15)
        if resp.status_code == 201:
            console.print(f"[green]Registration successful! You can now login.[/green]")
        else:
            msg = resp.json().get('message', resp.text)
            console.print(f"[red]Registration failed:[/red] {msg}")
    except Exception as e:
        console.print(f"[red]Error:[/red] {e}")

@auth.command()
@click.option('--email', prompt=True, help='Your email address')
@click.option('--password', prompt=True, hide_input=True, help='Your password')
def login(email, password):
    """Login and save your session token."""
    api_url = config_utils.get_config_value('api_url', 'http://localhost:5000')
    url = f"{api_url}/auth/login"
    data = {"email": email, "password": password}
    try:
        resp = requests.post(url, json=data, timeout=15)
        if resp.status_code == 200:
            result = resp.json()
            token = result.get('token') or result.get('access_token')
            user_id = result.get('user', {}).get('id') or result.get('user_id')
            if not token:
                console.print("[red]Login failed: No token returned.[/red]")
                return
            # Save to config (profile 'default')
            config_utils.save_profile('default', {
                'api_url': api_url,
                'api_key': token,
                'user_id': user_id,
                'email': email
            })
            console.print(f"[green]Login successful! Token saved.[/green]")
        else:
            msg = resp.json().get('message', resp.text)
            console.print(f"[red]Login failed:[/red] {msg}")
    except Exception as e:
        console.print(f"[red]Error:[/red] {e}")

@auth.command()
def logout():
    """Logout and clear your session."""
    try:
        config_utils.clear_config()
        console.print("[green]Logged out and config cleared.[/green]")
    except Exception as e:
        console.print(f"[red]Error:[/red] {e}")
