"""
Comprehensive input validation middleware for FairPlay NIL backend
Provides sanitization, validation, and security checks for all API inputs
"""

import re
import html
from typing import Any, Dict, List, Optional, Union
from fastapi import HTTPException, Request
from pydantic import BaseModel, ValidationError
import logging

logger = logging.getLogger(__name__)

class ValidationError(HTTPException):
    """Custom validation error for input validation failures"""
    def __init__(self, detail: str, field: Optional[str] = None):
        super().__init__(
            status_code=422,
            detail={"message": detail, "field": field} if field else detail
        )

class SecurityError(HTTPException):
    """Security error for malicious input attempts"""
    def __init__(self, detail: str):
        super().__init__(
            status_code=400,
            detail=f"Security validation failed: {detail}"
        )

class InputValidator:
    """Comprehensive input validation and sanitization"""
    
    # Security patterns to detect malicious input
    SECURITY_PATTERNS = [
        r'<script[^>]*>.*?</script>',  # XSS attempts
        r'javascript:',  # JavaScript injection
        r'on\w+\s*=',  # Event handlers
        r'(union|select|insert|update|delete|drop|create|alter)\s+',  # SQL injection
        r'--\s*',  # SQL comments
        r'/\*.*?\*/',  # Multi-line comments
        r'(\||&|;|`|\$\()',  # Command injection
        r'\.\./',  # Directory traversal
        r'\\x[0-9a-fA-F]{2}',  # Hex encoding
        r'%[0-9a-fA-F]{2}',  # URL encoding for malicious chars
    ]
    
    # Sensitive data patterns
    SENSITIVE_PATTERNS = [
        r'\b\d{3}-\d{2}-\d{4}\b',  # SSN
        r'\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b',  # Credit card
        r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',  # Email (for logging)
        r'\b\d{3}[\s-]?\d{3}[\s-]?\d{4}\b',  # Phone
    ]
    
    def __init__(self):
        self.compiled_security_patterns = [re.compile(pattern, re.IGNORECASE) for pattern in self.SECURITY_PATTERNS]
        self.compiled_sensitive_patterns = [re.compile(pattern, re.IGNORECASE) for pattern in self.SENSITIVE_PATTERNS]
    
    def sanitize_string(self, value: str) -> str:
        """Sanitize string input to prevent XSS and other attacks"""
        if not isinstance(value, str):
            return value
        
        # HTML escape
        value = html.escape(value)
        
        # Remove null bytes
        value = value.replace('\x00', '')
        
        # Normalize whitespace
        value = re.sub(r'\s+', ' ', value).strip()
        
        return value
    
    def validate_security(self, value: str) -> bool:
        """Check for security threats in input"""
        if not isinstance(value, str):
            return True
        
        for pattern in self.compiled_security_patterns:
            if pattern.search(value):
                logger.warning(f"Security threat detected in input: {pattern.pattern}")
                return False
        
        return True
    
    def validate_length(self, value: str, min_length: int = 0, max_length: int = 1000) -> bool:
        """Validate string length"""
        if not isinstance(value, str):
            return True
        
        return min_length <= len(value) <= max_length
    
    def validate_email(self, email: str) -> bool:
        """Validate email format"""
        if not email:
            return False
        
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(email_pattern, email) is not None
    
    def validate_phone(self, phone: str) -> bool:
        """Validate phone number format"""
        if not phone:
            return False
        
        # Remove all non-digit characters
        digits = re.sub(r'\D', '', phone)
        
        # Check if it's a valid US phone number (10 digits)
        return len(digits) == 10
    
    def validate_numeric(self, value: Union[int, float, str], min_val: Optional[float] = None, max_val: Optional[float] = None) -> bool:
        """Validate numeric values"""
        try:
            num_val = float(value)
            
            if min_val is not None and num_val < min_val:
                return False
            
            if max_val is not None and num_val > max_val:
                return False
            
            return True
        except (ValueError, TypeError):
            return False
    
    def validate_file_upload(self, file_type: str, file_size: int, file_name: str) -> bool:
        """Validate file upload parameters"""
        # Valid file types
        valid_types = ['pdf', 'docx', 'doc', 'png', 'jpg', 'jpeg', 'gif']
        
        # Check file type
        if file_type.lower() not in valid_types:
            raise ValidationError(f"Invalid file type: {file_type}. Allowed types: {', '.join(valid_types)}")
        
        # Check file size (10MB limit)
        max_size = 10 * 1024 * 1024
        if file_size > max_size:
            raise ValidationError(f"File size too large: {file_size} bytes. Maximum allowed: {max_size} bytes")
        
        # Check file name
        if not self.validate_security(file_name):
            raise SecurityError("Invalid characters in file name")
        
        if not self.validate_length(file_name, 1, 255):
            raise ValidationError("File name must be between 1 and 255 characters")
        
        return True
    
    def sanitize_dict(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Recursively sanitize dictionary data"""
        if not isinstance(data, dict):
            return data
        
        sanitized = {}
        for key, value in data.items():
            # Sanitize key
            clean_key = self.sanitize_string(str(key))
            
            # Sanitize value
            if isinstance(value, str):
                clean_value = self.sanitize_string(value)
            elif isinstance(value, dict):
                clean_value = self.sanitize_dict(value)
            elif isinstance(value, list):
                clean_value = [self.sanitize_dict(item) if isinstance(item, dict) else 
                             self.sanitize_string(item) if isinstance(item, str) else item
                             for item in value]
            else:
                clean_value = value
            
            sanitized[clean_key] = clean_value
        
        return sanitized
    
    def validate_deal_data(self, deal_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate deal-specific data"""
        errors = []
        
        # Validate payor name
        if 'payor_name' in deal_data:
            if not self.validate_security(deal_data['payor_name']):
                errors.append("Payor name contains invalid characters")
            if not self.validate_length(deal_data['payor_name'], 1, 100):
                errors.append("Payor name must be between 1 and 100 characters")
        
        # Validate contact email
        if 'contact_email' in deal_data and deal_data['contact_email']:
            if not self.validate_email(deal_data['contact_email']):
                errors.append("Invalid contact email format")
        
        # Validate contact phone
        if 'contact_phone' in deal_data and deal_data['contact_phone']:
            if not self.validate_phone(deal_data['contact_phone']):
                errors.append("Invalid contact phone format")
        
        # Validate compensation amounts
        if 'compensation_cash' in deal_data and deal_data['compensation_cash']:
            if not self.validate_numeric(deal_data['compensation_cash'], 0, 10000000):
                errors.append("Invalid compensation cash amount")
        
        # Validate file upload data
        if all(key in deal_data for key in ['deal_terms_file_type', 'deal_terms_file_size', 'deal_terms_file_name']):
            try:
                self.validate_file_upload(
                    deal_data['deal_terms_file_type'],
                    deal_data['deal_terms_file_size'],
                    deal_data['deal_terms_file_name']
                )
            except (ValidationError, SecurityError) as e:
                errors.append(str(e.detail))
        
        if errors:
            raise ValidationError(f"Validation failed: {'; '.join(errors)}")
        
        return self.sanitize_dict(deal_data)
    
    def validate_profile_data(self, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate profile-specific data"""
        errors = []
        
        # Validate full name
        if 'full_name' in profile_data:
            if not self.validate_security(profile_data['full_name']):
                errors.append("Full name contains invalid characters")
            if not self.validate_length(profile_data['full_name'], 2, 100):
                errors.append("Full name must be between 2 and 100 characters")
        
        # Validate phone
        if 'phone' in profile_data and profile_data['phone']:
            if not self.validate_phone(profile_data['phone']):
                errors.append("Invalid phone number format")
        
        # Validate university
        if 'university' in profile_data and profile_data['university']:
            if not self.validate_security(profile_data['university']):
                errors.append("University name contains invalid characters")
            if not self.validate_length(profile_data['university'], 2, 100):
                errors.append("University name must be between 2 and 100 characters")
        
        # Validate division
        if 'division' in profile_data and profile_data['division']:
            valid_divisions = ['I', 'II', 'III', 'NAIA', 'JUCO']
            if profile_data['division'] not in valid_divisions:
                errors.append(f"Invalid division. Must be one of: {', '.join(valid_divisions)}")
        
        # Validate sports
        if 'sports' in profile_data and profile_data['sports']:
            if not isinstance(profile_data['sports'], list):
                errors.append("Sports must be a list")
            elif len(profile_data['sports']) > 5:
                errors.append("Maximum 5 sports allowed")
        
        if errors:
            raise ValidationError(f"Validation failed: {'; '.join(errors)}")
        
        return self.sanitize_dict(profile_data)
    
    def validate_social_media_data(self, social_media_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate social media data"""
        errors = []
        
        if 'platforms' not in social_media_data:
            errors.append("Platforms data is required")
        else:
            platforms = social_media_data['platforms']
            if not isinstance(platforms, list):
                errors.append("Platforms must be a list")
            elif len(platforms) > 10:
                errors.append("Maximum 10 social media platforms allowed")
            else:
                valid_platforms = ['instagram', 'twitter', 'tiktok', 'youtube', 'facebook']
                for i, platform in enumerate(platforms):
                    if not isinstance(platform, dict):
                        errors.append(f"Platform {i+1} must be an object")
                        continue
                    
                    # Validate platform type
                    if 'platform' not in platform or platform['platform'] not in valid_platforms:
                        errors.append(f"Platform {i+1}: Invalid platform type")
                    
                    # Validate handle
                    if 'handle' not in platform or not platform['handle']:
                        errors.append(f"Platform {i+1}: Handle is required")
                    elif not platform['handle'].startswith('@'):
                        errors.append(f"Platform {i+1}: Handle must start with @")
                    elif not re.match(r'^@[a-zA-Z0-9_]+$', platform['handle']):
                        errors.append(f"Platform {i+1}: Handle contains invalid characters")
                    
                    # Validate followers
                    if 'followers' not in platform or not self.validate_numeric(platform['followers'], 0, 1000000000):
                        errors.append(f"Platform {i+1}: Invalid follower count")
        
        if errors:
            raise ValidationError(f"Validation failed: {'; '.join(errors)}")
        
        return self.sanitize_dict(social_media_data)

# Global validator instance
validator = InputValidator()

def validate_request_data(data: Dict[str, Any], data_type: str) -> Dict[str, Any]:
    """Main validation function for request data"""
    if data_type == 'deal':
        return validator.validate_deal_data(data)
    elif data_type == 'profile':
        return validator.validate_profile_data(data)
    elif data_type == 'social_media':
        return validator.validate_social_media_data(data)
    else:
        return validator.sanitize_dict(data) 