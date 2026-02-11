#!/usr/bin/env python3
"""
Unit tests for validators.py
"""
import pytest
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from validators import (
    validate_email,
    sanitize_string,
    validate_json_data,
    validate_submission_data,
    validate_page_number,
    validate_per_page,
    validate_search_query
)


class TestValidateEmail:
    """Tests for validate_email function."""
    
    def test_valid_email(self):
        assert validate_email("user@example.com") is True
        assert validate_email("test.user@example.co.uk") is True
        assert validate_email("user+tag@example.org") is True
    
    def test_invalid_email_no_at(self):
        assert validate_email("userexample.com") is False
        assert validate_email("user@") is False
    
    def test_invalid_email_no_domain(self):
        assert validate_email("user@.com") is False
        assert validate_email("user@domain") is False
    
    def test_invalid_email_empty(self):
        assert validate_email("") is False
        assert validate_email(None) is False
        assert validate_email(123) is False
    
    def test_invalid_email_whitespace(self):
        assert validate_email(" user@example.com ") is True  # strips


class TestSanitizeString:
    """Tests for sanitize_string function."""
    
    def test_sanitize_basic_string(self):
        assert sanitize_string("hello world") == "hello world"
    
    def test_sanitize_strips_whitespace(self):
        assert sanitize_string("  hello  ") == "hello"
    
    def test_sanitize_max_length(self):
        long_string = "a" * 1500
        result = sanitize_string(long_string, max_length=1000)
        assert len(result) == 1000
    
    def test_sanitize_non_string(self):
        assert sanitize_string(123) == ""
        assert sanitize_string(None) == ""
        assert sanitize_string({}) == ""
    
    def test_sanitize_empty_string(self):
        assert sanitize_string("") == ""


class TestValidateJsonData:
    """Tests for validate_json_data function."""
    
    def test_valid_json_types(self):
        assert validate_json_data({"key": "value"}) is True
        assert validate_json_data([1, 2, 3]) is True
        assert validate_json_data("string") is True
        assert validate_json_data(123) is True
        assert validate_json_data(12.5) is True
        assert validate_json_data(True) is True
        assert validate_json_data(None) is False  # None is not valid
    
    def test_invalid_json_types(self):
        assert validate_json_data(set([1, 2, 3])) is False
        assert validate_json_data(object()) is False


class TestValidateSubmissionData:
    """Tests for validate_submission_data function."""
    
    def test_valid_submission(self):
        is_valid, errors = validate_submission_data({"companyName": "Test Corp", "email": "test@example.com"})
        assert is_valid is True
        assert len(errors) == 0
    
    def test_invalid_not_dict(self):
        is_valid, errors = validate_submission_data("not a dict")
        assert is_valid is False
        assert "must be a JSON object" in errors[0]
    
    def test_invalid_empty(self):
        is_valid, errors = validate_submission_data({})
        assert is_valid is False
        assert "cannot be empty" in errors[0]
    
    def test_invalid_company_name(self):
        is_valid, errors = validate_submission_data({"companyName": "a"})
        assert is_valid is False
        assert any("at least 2 characters" in e for e in errors)
    
    def test_invalid_email(self):
        is_valid, errors = validate_submission_data({"email": "invalid-email"})
        assert is_valid is False
        assert any("Invalid email" in e for e in errors)
    
    def test_field_exceeds_max_length(self):
        long_value = "x" * 5001
        is_valid, errors = validate_submission_data({"description": long_value})
        assert is_valid is False
        assert any("exceeds maximum length" in e for e in errors)


class TestValidatePageNumber:
    """Tests for validate_page_number function."""
    
    def test_valid_page_number(self):
        assert validate_page_number(1) == 1
        assert validate_page_number(5) == 5
        assert validate_page_number("10") == 10
    
    def test_negative_page_number(self):
        assert validate_page_number(-1) == 1  # min_page is 1
        assert validate_page_number("-5") == 1
    
    def test_invalid_page_number(self):
        assert validate_page_number(None) == 1
        assert validate_page_number("abc") == 1
        assert validate_page_number(float('inf')) == 1


class TestValidatePerPage:
    """Tests for validate_per_page function."""
    
    def test_valid_per_page(self):
        assert validate_per_page(10) == 10
        assert validate_per_page("20") == 20
        assert validate_per_page(5, max_per_page=100, default=10) == 5
    
    def test_exceeds_max(self):
        assert validate_per_page(200) == 100  # max_per_page default is 100
    
    def test_zero_or_negative(self):
        assert validate_per_page(0) == 10  # default
        assert validate_per_page(-5) == 10  # default
    
    def test_invalid_per_page(self):
        assert validate_per_page(None) == 10
        assert validate_per_page("abc") == 10


class TestValidateSearchQuery:
    """Tests for validate_search_query function."""
    
    def test_valid_search_query(self):
        assert validate_search_query("test query") == "test query"
        assert validate_search_query("  spaces  ") == "spaces"
    
    def test_search_query_max_length(self):
        long_query = "x" * 150
        result = validate_search_query(long_query, max_length=100)
        assert len(result) == 100
    
    def test_search_query_removes_dangerous_chars(self):
        result = validate_search_query("test; drop table; --")
        assert ";" not in result
        assert "drop" not in result  # SQL injection patterns removed
    
    def test_invalid_search_query(self):
        assert validate_search_query(None) == ""
        assert validate_search_query(123) == ""


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
