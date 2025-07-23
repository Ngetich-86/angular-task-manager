"""
API client for task-manager CLI
This module provides a client for interacting with the task-manager API.
"""

import requests
from typing import Optional, Dict, Any
from .config import config

class APIError(Exception):
    """Custom exception for API errors."""
    pass

class APIClient:
    def __init__(self):
        self.base_url = config.API_BASE_URL
        self.timeout = config.API_TIMEOUT
        self.token = None
    
    def set_token(self, token: str):
        self.token = token
    
    def _get_headers(self) -> Dict[str, str]:
        headers = {"Content-Type": "application/json"}
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        return headers
    
    def request(self, method: str, endpoint: str, data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        url = f"{self.base_url}{endpoint}"
        headers = self._get_headers()
        try:
            response = requests.request(
                method,
                url,
                json=data,
                headers=headers,
                timeout=self.timeout
            )
            response.raise_for_status()
            if response.status_code == 204:
                return {}
            return response.json()
        except requests.exceptions.HTTPError as e:
            try:
                error_data = response.json()
                error_message = error_data.get('message', str(e))
            except Exception:
                error_message = str(e)
            raise APIError(f"API error: {error_message}")
        except requests.exceptions.ConnectionError:
            raise APIError("Connection failed. Please check your internet connection.")
        except requests.exceptions.Timeout:
            raise APIError("Request timed out. Please try again.")
        except requests.exceptions.RequestException as e:
            raise APIError(f"Network error: {e}")

api_client = APIClient()