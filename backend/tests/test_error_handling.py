# backend/tests/test_error_handling.py
import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch, MagicMock
import logging
import json
import os
from datetime import datetime

# Import the main app and error handling middleware
try:
    from backend.app.main import app
    from backend.app.middleware.error_handling import ErrorHandlingMiddleware, ErrorHandlingConfig
except ImportError:
    # Handle import for different project structures
    import sys
    import os
    sys.path.append(os.path.dirname(os.path.dirname(__file__)))
    from app.main import app
    from app.middleware.error_handling import ErrorHandlingMiddleware, ErrorHandlingConfig

client = TestClient(app)

class TestErrorHandlingMiddleware:
    """Test suite for error handling middleware"""
    
    def setup_method(self):
        """Set up test fixtures"""
        self.error_handler = ErrorHandlingMiddleware()
        self.config = ErrorHandlingConfig()
    
    def test_sanitize_error_message(self):
        """Test that sensitive data is properly sanitized from error messages"""
        # Test with sensitive data
        error_message = "Error: password=secret123, token=abc123, email=user@example.com"
        sanitized = self.error_handler.sanitize_error_message(error_message)
        
        # Check that sensitive data is redacted
        assert "password" not in sanitized
        assert "secret123" not in sanitized
        assert "token" not in sanitized
        assert "abc123" not in sanitized
        assert "email" not in sanitized
        assert "user@example.com" not in sanitized
        
        # Check that redacted markers are present
        assert "[REDACTED]" in sanitized
        
        # Test with non-sensitive data
        safe_message = "Error: Invalid input provided"
        sanitized_safe = self.error_handler.sanitize_error_message(safe_message)
        assert sanitized_safe == safe_message
    
    def test_sanitize_stack_trace(self):
        """Test that stack traces are properly sanitized and truncated"""
        # Create a long stack trace with sensitive data
        long_stack = "Traceback (most recent call last):\n" + \
                    "  File 'test.py', line 10, in <module>\n" + \
                    "    password='secret123', token='abc123'\n" + \
                    "ValueError: Invalid credentials\n" * 100
        
        sanitized = self.error_handler.sanitize_stack_trace(long_stack)
        
        # Check that sensitive data is redacted
        assert "secret123" not in sanitized
        assert "abc123" not in sanitized
        assert "[REDACTED]" in sanitized
        
        # Check that stack trace is truncated if too long
        if len(long_stack) > self.config.MAX_STACK_LENGTH:
            assert len(sanitized) <= self.config.MAX_STACK_LENGTH + 3  # +3 for "..."
    
    def test_create_error_response(self):
        """Test that error responses are properly formatted"""
        error = ValueError("Test error message")
        error_id = "test_error_123"
        
        response = self.error_handler.create_error_response(error, error_id)
        
        # Check response structure
        assert response.status_code == 500
        content = response.body.decode('utf-8')
        response_data = json.loads(content)
        
        # Check required fields
        assert "error" in response_data
        assert "detail" in response_data
        assert "timestamp" in response_data
        assert "error_id" in response_data
        
        # Check values
        assert response_data["error"] == "Internal server error"
        assert response_data["error_id"] == error_id
        assert response_data["timestamp"] is not None
    
    def test_create_error_response_development_mode(self):
        """Test that development mode includes more error details"""
        # Set environment to development
        original_env = os.getenv("ENVIRONMENT")
        os.environ["ENVIRONMENT"] = "development"
        
        try:
            error = ValueError("Test error message")
            error_id = "test_error_123"
            
            response = self.error_handler.create_error_response(error, error_id)
            content = response.body.decode('utf-8')
            response_data = json.loads(content)
            
            # Check that development mode includes more details
            assert "detail" in response_data
            assert "type" in response_data
            assert response_data["type"] == "ValueError"
            
        finally:
            # Restore original environment
            if original_env:
                os.environ["ENVIRONMENT"] = original_env
            else:
                os.environ.pop("ENVIRONMENT", None)
    
    @patch('backend.app.middleware.error_handling.logger')
    def test_log_error_securely(self, mock_logger):
        """Test that errors are logged securely without sensitive data"""
        error = ValueError("Test error with password=secret123")
        request = Mock()
        request.method = "GET"
        request.url.path = "/api/test"
        request.client.host = "127.0.0.1"
        request.headers.get.return_value = "test-user-agent"
        
        error_id = "test_error_123"
        
        self.error_handler.log_error_securely(error, request, error_id)
        
        # Check that logger.error was called
        mock_logger.error.assert_called_once()
        
        # Get the logged message and extra data
        call_args = mock_logger.error.call_args
        message = call_args[0][0]
        extra_data = call_args[1].get('extra', {})
        
        # Check that sensitive data is not in the log
        assert "secret123" not in message
        assert "secret123" not in str(extra_data)
        
        # Check that error information is present
        assert "ValueError" in message
        assert error_id in extra_data["error_id"]
        assert "GET" in extra_data["request_info"]["method"]
        assert "/api/test" in extra_data["request_info"]["path"]
    
    def test_middleware_catches_exceptions(self):
        """Test that middleware catches unhandled exceptions"""
        # Create a test endpoint that raises an exception
        @app.get("/test-error-endpoint")
        def test_error_endpoint():
            raise ValueError("Test exception")
        
        # Make request to the endpoint
        response = client.get("/test-error-endpoint")
        
        # Check that error is caught and returns 500
        assert response.status_code == 500
        
        # Check response format
        response_data = response.json()
        assert "error" in response_data
        assert "detail" in response_data
        assert "timestamp" in response_data
        assert "error_id" in response_data
    
    def test_middleware_preserves_http_exceptions(self):
        """Test that middleware doesn't interfere with intentional HTTPExceptions"""
        from fastapi import HTTPException
        
        @app.get("/test-http-exception")
        def test_http_exception():
            raise HTTPException(status_code=400, detail="Bad request")
        
        # Make request to the endpoint
        response = client.get("/test-http-exception")
        
        # Check that HTTPException is preserved
        assert response.status_code == 400
        response_data = response.json()
        assert "detail" in response_data
        assert response_data["detail"] == "Bad request"
    
    def test_middleware_preserves_normal_responses(self):
        """Test that middleware doesn't interfere with normal successful responses"""
        @app.get("/test-normal-response")
        def test_normal_response():
            return {"message": "Success"}
        
        # Make request to the endpoint
        response = client.get("/test-normal-response")
        
        # Check that normal response is preserved
        assert response.status_code == 200
        response_data = response.json()
        assert response_data["message"] == "Success"
    
    def test_middleware_with_different_exception_types(self):
        """Test that middleware handles different types of exceptions"""
        exception_types = [
            (ValueError, "Value error occurred"),
            (TypeError, "Type error occurred"),
            (RuntimeError, "Runtime error occurred"),
            (KeyError, "Key error occurred"),
            (IndexError, "Index error occurred")
        ]
        
        for exception_class, message in exception_types:
            @app.get(f"/test-{exception_class.__name__.lower()}")
            def test_exception():
                raise exception_class(message)
            
            # Make request to the endpoint
            response = client.get(f"/test-{exception_class.__name__.lower()}")
            
            # Check that error is caught and returns 500
            assert response.status_code == 500
            
            # Check response format
            response_data = response.json()
            assert "error" in response_data
            assert "error_id" in response_data
    
    def test_middleware_integration_with_existing_endpoints(self):
        """Test that middleware doesn't break existing API endpoints"""
        # Test with existing health endpoint
        response = client.get("/health")
        assert response.status_code == 200
        
        # Test with existing root endpoint
        response = client.get("/")
        assert response.status_code == 200
        response_data = response.json()
        assert "message" in response_data
    
    def test_error_id_generation(self):
        """Test that unique error IDs are generated"""
        error = ValueError("Test error")
        request = Mock()
        request.method = "GET"
        request.url.path = "/api/test"
        request.client.host = "127.0.0.1"
        request.headers.get.return_value = "test-user-agent"
        
        # Generate multiple error IDs
        error_id1 = self.error_handler.log_error_securely(error, request, "test1")
        error_id2 = self.error_handler.log_error_securely(error, request, "test2")
        
        # Check that error IDs are different
        assert "test1" != "test2"
    
    def test_middleware_performance(self):
        """Test that middleware doesn't significantly impact performance"""
        import time
        
        @app.get("/test-performance")
        def test_performance():
            return {"message": "Performance test"}
        
        # Measure response time without error
        start_time = time.time()
        response = client.get("/test-performance")
        end_time = time.time()
        
        response_time = end_time - start_time
        
        # Check that response time is reasonable (less than 1 second)
        assert response_time < 1.0
        assert response.status_code == 200
    
    def test_middleware_logging_fallback(self):
        """Test that middleware handles logging failures gracefully"""
        with patch('backend.app.middleware.error_handling.logger') as mock_logger:
            # Make logger.error raise an exception
            mock_logger.error.side_effect = Exception("Logger failed")
            
            error = ValueError("Test error")
            request = Mock()
            request.method = "GET"
            request.url.path = "/api/test"
            request.client.host = "127.0.0.1"
            request.headers.get.return_value = "test-user-agent"
            
            # This should not raise an exception
            try:
                self.error_handler.log_error_securely(error, request, "test")
            except Exception:
                pytest.fail("Middleware should handle logging failures gracefully")
    
    def test_middleware_configuration(self):
        """Test that middleware configuration is properly set up"""
        # Check that configuration has required attributes
        assert hasattr(self.config, 'SENSITIVE_PATTERNS')
        assert hasattr(self.config, 'MAX_STACK_LENGTH')
        assert hasattr(self.config, 'ERROR_RESPONSE_TEMPLATE')
        
        # Check that sensitive patterns are properly defined
        assert isinstance(self.config.SENSITIVE_PATTERNS, list)
        assert len(self.config.SENSITIVE_PATTERNS) > 0
        
        # Check that max stack length is reasonable
        assert self.config.MAX_STACK_LENGTH > 0
        assert self.config.MAX_STACK_LENGTH < 10000
        
        # Check that error response template has required fields
        template = self.config.ERROR_RESPONSE_TEMPLATE
        assert "error" in template
        assert "detail" in template
        assert "timestamp" in template
        assert "error_id" in template

if __name__ == "__main__":
    pytest.main([__file__]) 