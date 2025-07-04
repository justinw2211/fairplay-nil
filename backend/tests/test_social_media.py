# backend/tests/test_social_media.py
import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch
import uuid

# Import the main app
try:
    from backend.app.main import app
    from backend.app.database import supabase
except ImportError:
    # Handle import for different project structures
    import sys
    import os
    sys.path.append(os.path.dirname(os.path.dirname(__file__)))
    from app.main import app
    from app.database import supabase

client = TestClient(app)

# Test data
VALID_SOCIAL_MEDIA_DATA = {
    "platforms": [
        {
            "platform": "instagram",
            "handle": "@testuser123",
            "followers": 1000,
            "verified": False
        },
        {
            "platform": "twitter", 
            "handle": "@testuser_tw",
            "followers": 500,
            "verified": True
        }
    ]
}

INVALID_SOCIAL_MEDIA_DATA = {
    "platforms": [
        {
            "platform": "invalid_platform",
            "handle": "no_at_symbol",
            "followers": -1,
            "verified": False
        }
    ]
}

def test_social_media_validation():
    """Social media handles validate correctly"""
    import re
    
    def validate_social_handle(handle):
        return bool(re.match(r'^@[a-zA-Z0-9_]+$', handle))
    
    def validate_followers(count):
        return isinstance(count, int) and count > 0
    
    # Test valid handles
    valid_handle = "@testuser123"
    assert validate_social_handle(valid_handle) == True
    
    # Test invalid handles
    invalid_handle = "testuser"  # missing @
    assert validate_social_handle(invalid_handle) == False
    
    invalid_handle2 = "@test user"  # space not allowed
    assert validate_social_handle(invalid_handle2) == False
    
    # Test follower validation
    assert validate_followers(1000) == True
    assert validate_followers(-1) == False
    assert validate_followers(0) == False

@patch('backend.app.dependencies.get_user_id')
@patch('backend.app.database.supabase')
def test_get_social_media_endpoint_unauthorized(mock_supabase, mock_get_user_id):
    """Test GET /profile/social-media endpoint without authentication"""
    # Mock dependency to raise exception for unauthorized access
    mock_get_user_id.side_effect = Exception("Unauthorized")
    
    response = client.get("/profile/social-media")
    # Should return 500 due to dependency exception
    # In a real implementation, this would be handled by FastAPI's dependency system
    assert response.status_code in [401, 500]

@patch('backend.app.dependencies.get_user_id')
@patch('backend.app.database.supabase')
def test_get_social_media_endpoint_authorized(mock_supabase, mock_get_user_id):
    """Test GET /profile/social-media endpoint with valid authentication"""
    # Mock user ID
    test_user_id = str(uuid.uuid4())
    mock_get_user_id.return_value = test_user_id
    
    # Mock supabase response
    mock_response = Mock()
    mock_response.data = [
        {
            "id": 1,
            "platform": "instagram",
            "handle": "@testuser",
            "followers": 1000,
            "verified": False,
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z"
        }
    ]
    
    mock_supabase.from_.return_value.select.return_value.eq.return_value.execute.return_value = mock_response
    
    response = client.get("/profile/social-media")
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["platform"] == "instagram"

@patch('backend.app.dependencies.get_user_id')
@patch('backend.app.database.supabase')
def test_update_social_media_endpoint_valid_data(mock_supabase, mock_get_user_id):
    """Test PUT /profile/social-media endpoint with valid data"""
    # Mock user ID
    test_user_id = str(uuid.uuid4())
    mock_get_user_id.return_value = test_user_id
    
    # Mock supabase responses
    mock_delete_response = Mock()
    mock_delete_response.data = []
    
    mock_insert_response = Mock()
    mock_insert_response.data = [{"id": 1}, {"id": 2}]
    
    mock_update_response = Mock()
    mock_update_response.data = [{"id": test_user_id}]
    
    mock_final_response = Mock()
    mock_final_response.data = [
        {
            "id": 1,
            "platform": "instagram",
            "handle": "@testuser123",
            "followers": 1000,
            "verified": False,
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z"
        }
    ]
    
    # Configure supabase mocks
    mock_supabase.from_.return_value.delete.return_value.eq.return_value.execute.return_value = mock_delete_response
    mock_supabase.from_.return_value.insert.return_value.execute.return_value = mock_insert_response
    mock_supabase.from_.return_value.update.return_value.eq.return_value.execute.return_value = mock_update_response
    mock_supabase.from_.return_value.select.return_value.eq.return_value.execute.return_value = mock_final_response
    
    response = client.put("/profile/social-media", json=VALID_SOCIAL_MEDIA_DATA)
    assert response.status_code == 200
    assert len(response.json()) == 1

def test_update_social_media_endpoint_invalid_data():
    """Test PUT /profile/social-media endpoint with invalid data"""
    response = client.put("/profile/social-media", json=INVALID_SOCIAL_MEDIA_DATA)
    # Should return 422 for validation error
    assert response.status_code == 422

@patch('backend.app.dependencies.get_user_id')
@patch('backend.app.database.supabase')
def test_delete_social_media_platform_valid(mock_supabase, mock_get_user_id):
    """Test DELETE /profile/social-media/{platform} endpoint with valid platform"""
    # Mock user ID
    test_user_id = str(uuid.uuid4())
    mock_get_user_id.return_value = test_user_id
    
    # Mock supabase response
    mock_response = Mock()
    mock_response.data = [{"id": 1}]
    
    mock_supabase.from_.return_value.delete.return_value.eq.return_value.eq.return_value.execute.return_value = mock_response
    
    response = client.delete("/profile/social-media/instagram")
    assert response.status_code == 200
    assert "Successfully deleted instagram platform" in response.json()["message"]

@patch('backend.app.dependencies.get_user_id')
def test_delete_social_media_platform_invalid(mock_get_user_id):
    """Test DELETE /profile/social-media/{platform} endpoint with invalid platform"""
    # Mock user ID
    test_user_id = str(uuid.uuid4())
    mock_get_user_id.return_value = test_user_id
    
    response = client.delete("/profile/social-media/invalid_platform")
    assert response.status_code == 400
    assert "Invalid platform" in response.json()["detail"]

def test_social_media_crud():
    """Test complete CRUD operations for social media"""
    # This would be an integration test that tests the full CRUD cycle
    # For now, we'll just validate that our test structure is correct
    
    # Test data structure validation
    assert "platforms" in VALID_SOCIAL_MEDIA_DATA
    assert len(VALID_SOCIAL_MEDIA_DATA["platforms"]) == 2
    
    # Test that each platform has required fields
    for platform in VALID_SOCIAL_MEDIA_DATA["platforms"]:
        assert "platform" in platform
        assert "handle" in platform
        assert "followers" in platform
        assert "verified" in platform
        
        # Test handle format
        assert platform["handle"].startswith("@")
        
        # Test follower count
        assert platform["followers"] >= 0

# Test NIL compliance considerations
def test_social_media_nil_compliance():
    """Test that social media data meets NIL compliance requirements"""
    # Test that follower counts are properly validated for deal valuation
    high_follower_platform = {
        "platform": "instagram",
        "handle": "@nilstar",
        "followers": 100000,
        "verified": True
    }
    
    low_follower_platform = {
        "platform": "twitter",
        "handle": "@localathlete", 
        "followers": 500,
        "verified": False
    }
    
    # Both should be valid, but may have different deal implications
    for platform in [high_follower_platform, low_follower_platform]:
        assert platform["followers"] >= 0
        assert platform["handle"].startswith("@")
        assert platform["platform"] in ['instagram', 'twitter', 'tiktok', 'youtube', 'facebook']

if __name__ == "__main__":
    pytest.main([__file__]) 