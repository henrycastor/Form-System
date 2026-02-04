#!/usr/bin/env python3
"""
Input validation and sanitization utilities.
"""

import re
from typing import Any, Dict, List
from logger import setup_logger

logger = setup_logger(__name__)


def validate_email(email: str) -> bool:
    """
    Validate email format.
    
    Args:
        email: Email address to validate
    
    Returns:
        True if valid, False otherwise
    """
    if not email or not isinstance(email, str):
        return False
    
    # RFC 5322 simplified pattern
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email.strip()))


def sanitize_string(value: str, max_length: int = 1000) -> str:
    """
    Sanitize string input.
    
    Args:
        value: String to sanitize
        max_length: Maximum allowed length
    
    Returns:
        Sanitized string
    """
    if not isinstance(value, str):
        return ""
    
    # Strip whitespace and limit length
    sanitized = value.strip()[:max_length]
    return sanitized


def validate_json_data(data: Any) -> bool:
    """
    Validate that data is a valid JSON-serializable object.
    
    Args:
        data: Data to validate
    
    Returns:
        True if valid, False otherwise
    """
    if data is None:
        return False
    
    if isinstance(data, (dict, list, str, int, float, bool)):
        return True
    
    return False


def validate_submission_data(data: Dict[str, Any]) -> tuple[bool, List[str]]:
    """
    Validate submission data structure and content.
    
    Args:
        data: Submission data to validate
    
    Returns:
        Tuple of (is_valid, error_messages)
    """
    errors: List[str] = []
    
    if not isinstance(data, dict):
        errors.append("Submission data must be a JSON object")
        return False, errors
    
    if len(data) == 0:
        errors.append("Submission data cannot be empty")
        return False, errors
    
    # Check for required fields in typical submissions
    if 'companyName' in data:
        company_name = data.get('companyName', '')
        if not isinstance(company_name, str) or len(company_name) < 2:
            errors.append("Company name must be at least 2 characters")
    
    if 'email' in data:
        email = data.get('email', '')
        if not isinstance(email, str) or not validate_email(email):
            errors.append("Invalid email address")
    
    # Validate all string values don't exceed limits
    for key, value in data.items():
        if isinstance(value, str) and len(value) > 5000:
            errors.append(f"Field '{key}' exceeds maximum length of 5000 characters")
        elif isinstance(value, dict):
            is_valid, nested_errors = validate_submission_data(value)
            if not is_valid:
                errors.extend([f"{key}: {err}" for err in nested_errors])
    
    return len(errors) == 0, errors


def validate_page_number(page: Any, min_page: int = 1) -> int:
    """
    Validate and sanitize page number.
    
    Args:
        page: Page number to validate
        min_page: Minimum allowed page number
    
    Returns:
        Valid page number
    """
    try:
        page_num = int(page)
        return max(page_num, min_page)
    except (TypeError, ValueError):
        return min_page


def validate_per_page(per_page: Any, max_per_page: int = 100, default: int = 10) -> int:
    """
    Validate and sanitize per_page parameter.
    
    Args:
        per_page: Items per page
        max_per_page: Maximum allowed items per page
        default: Default value if invalid
    
    Returns:
        Valid per_page value
    """
    try:
        value = int(per_page)
        if value <= 0:
            return default
        return min(value, max_per_page)
    except (TypeError, ValueError):
        return default


def validate_search_query(query: str, max_length: int = 100) -> str:
    """
    Validate and sanitize search query.
    
    Args:
        query: Search query
        max_length: Maximum query length
    
    Returns:
        Sanitized search query
    """
    if not isinstance(query, str):
        return ""
    
    sanitized = query.strip()[:max_length]
    # Remove dangerous SQL characters
    sanitized = re.sub(r'[;\'"%]', '', sanitized)
    return sanitized
