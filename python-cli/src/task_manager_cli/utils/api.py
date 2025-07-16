"""
API client for task-manager CLI
This module provides a client for interacting with the task-manager API.
"""

import requests
from typing import Dict, Any, Optional, List
import json

class APIError(Exception):
    """API related errors"""
    pass

class TaskManagerAPIClient:
    """Client for task-manager API"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.api_url = config.get('api_url', 'https://localhost:5000')
        self.api_key = config.get('api_key')
        self.user_id = config.get('user_id')
        
        if not self.api_key:
            raise APIError("API key not configured")
    
    def _get_headers(self) -> Dict[str, str]:
        """Get standard headers for API requests."""
        return {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json',
            'User-Agent': 'me/0.1.0'
        }
    
    def _make_request(self, method: str, endpoint: str, data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Make an API request."""
        url = f"{self.api_url}{endpoint}"
        headers = self._get_headers()
        
        try:
            if method.upper() == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method.upper() == 'POST':
                response = requests.post(url, headers=headers, json=data, timeout=30)
            elif method.upper() == 'PUT':
                response = requests.put(url, headers=headers, json=data, timeout=30)
            elif method.upper() == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=30)
            else:
                raise APIError(f"Unsupported HTTP method: {method}")
            
            # Handle response
            if response.status_code == 401:
                raise APIError("Authentication failed. Please check your API key.")
            elif response.status_code == 403:
                raise APIError("Access forbidden. Please check your permissions.")
            elif response.status_code == 404:
                raise APIError("Resource not found.")
            elif response.status_code >= 500:
                raise APIError("Server error. Please try again later.")
            elif response.status_code >= 400:
                try:
                    error_data = response.json()
                    error_message = error_data.get('message', 'Unknown error')
                    raise APIError(f"API error: {error_message}")
                except json.JSONDecodeError:
                    raise APIError(f"API error: HTTP {response.status_code}")
            
            # Success response
            if response.status_code == 204:
                return {}
            
            return response.json()
            
        except requests.exceptions.ConnectionError:
            raise APIError("Connection failed. Please check your internet connection.")
        except requests.exceptions.Timeout:
            raise APIError("Request timed out. Please try again.")
        except requests.exceptions.RequestException as e:
            raise APIError(f"Network error: {e}")
    
    def get_user_info(self) -> Dict[str, Any]:
        """Get current user information."""
        return self._make_request('GET', '/user/:id')
    
    def get_tasks(self, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get tasks for a user."""
        if user_id is None:
            user_id = self.user_id
        return self._make_request('GET', f'/users/{user_id}/tasks')
    def create_task(self, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new task."""
        return self._make_request('POST', '/tasks', data=task_data)
    def update_task(self, task_id: str, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update an existing task."""
        return self._make_request('PUT', f'/tasks/{task_id}', data=task_data)
    def delete_task(self, task_id: str) -> Dict[str, Any]:
        """Delete a task."""
        return self._make_request('DELETE', f'/tasks/{task_id}')
    def get_task(self, task_id: str) -> Dict[str, Any]:
        """Get details of a specific task."""
        return self._make_request('GET', f'/tasks/{task_id}')