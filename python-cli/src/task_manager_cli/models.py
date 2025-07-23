from typing import Optional
from datetime import datetime
from enum import Enum

class Priority(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"

class Role(str, Enum):
    USER = "user"
    ADMIN = "admin"
    SUPERADMIN = "superadmin"
    DISABLED = "disabled"

class User:
    def __init__(self, data: dict):
        self.id = data["id"]
        self.fullname = data["fullname"]
        self.email = data["email"]
        self.role = data["role"]
        self.is_active = data["is_active"]
        self.created_at = datetime.fromisoformat(data["created_at"])
        self.updated_at = datetime.fromisoformat(data["updated_at"]) if data["updated_at"] else None

class Category:
    def __init__(self, data: dict):
        self.id = data["id"]
        self.name = data["name"]
        self.description = data["description"]
        self.color = data["color"]
        self.user_id = data["user_id"]
        self.created_at = datetime.fromisoformat(data["created_at"])
        self.updated_at = datetime.fromisoformat(data["updated_at"])

class Task:
    def __init__(self, data: dict):
        self.id = data["id"]
        self.title = data["title"]
        self.description = data.get("description")
        self.status = data["status"]
        self.due_date = datetime.fromisoformat(data["due_date"])
        self.priority = data["priority"]
        self.completed = data["completed"]
        self.user_id = data["user_id"]
        self.category_id = data["category_id"]
        self.created_at = datetime.fromisoformat(data["created_at"])
        self.updated_at = datetime.fromisoformat(data["updated_at"])