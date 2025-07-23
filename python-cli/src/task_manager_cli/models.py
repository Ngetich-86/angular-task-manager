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
        self.id = data.get("id")
        self.fullname = data.get("fullname", "")
        self.email = data.get("email", "")
        self.role = data.get("role", Role.USER)
        self.is_active = data.get("is_active", True)
        self.created_at = self._parse_date(data.get("created_at"))
        self.updated_at = self._parse_date(data.get("updated_at"))

    def _parse_date(self, value):
        if value:
            try:
                return datetime.fromisoformat(value)
            except Exception:
                return None
        return None

class Category:
    def __init__(self, data: dict):
        self.id = data.get("id")
        self.name = data.get("name", "")
        self.description = data.get("description", "")
        self.color = data.get("color", "")
        self.user_id = data.get("user_id")
        self.created_at = self._parse_date(data.get("created_at"))
        self.updated_at = self._parse_date(data.get("updated_at"))

    def _parse_date(self, value):
        if value:
            try:
                return datetime.fromisoformat(value)
            except Exception:
                return None
        return None

class Task:
    def __init__(self, data: dict):
        self.id = data.get("id")
        self.title = data.get("title", "")
        self.description = data.get("description")
        self.status = data.get("status", "pending")
        self.due_date = self._parse_date(data.get("due_date"))
        self.priority = data.get("priority", Priority.MEDIUM)
        self.completed = data.get("completed", False)
        self.user_id = data.get("user_id")
        self.category_id = data.get("category_id")
        self.created_at = self._parse_date(data.get("created_at"))
        self.updated_at = self._parse_date(data.get("updated_at"))

    def _parse_date(self, value):
        if value:
            try:
                return datetime.fromisoformat(value)
            except Exception:
                return None
        return None