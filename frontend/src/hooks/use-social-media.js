import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';

/**
 * Custom hook for social media operations
 * Provides CRUD operations with loading and error states
 * Follows existing hook patterns from the codebase
 */
const useSocialMedia = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // API base URL - use environment variable like other API calls  
  const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

  // Helper function to get auth headers
  const getAuthHeaders = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };
    } catch (error) {
      throw new Error('Authentication error: ' + error.message);
    }
  }, []);

  // Fetch social media platforms for the current user
  const fetchSocialMedia = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/social-media`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP ${response.status}: Failed to fetch social media data`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err.message || 'Failed to load social media data';
      setError(errorMessage);
      console.error('Error fetching social media:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  // Update social media platforms for the current user
  const updateSocialMedia = useCallback(async (socialMediaData) => {
    setLoading(true);
    setError(null);

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/social-media`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(socialMediaData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP ${response.status}: Failed to update social media data`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err.message || 'Failed to update social media data';
      setError(errorMessage);
      console.error('Error updating social media:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  // Delete a specific social media platform
  const deleteSocialMediaPlatform = useCallback(async (platform) => {
    setLoading(true);
    setError(null);

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/social-media/${platform}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP ${response.status}: Failed to delete ${platform} platform`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err.message || `Failed to delete ${platform} platform`;
      setError(errorMessage);
      console.error('Error deleting social media platform:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Retry functionality for failed requests
  const retryLastOperation = useCallback(async (operation, ...args) => {
    clearError();
    
    try {
      switch (operation) {
        case 'fetch':
          return await fetchSocialMedia();
        case 'update':
          return await updateSocialMedia(...args);
        case 'delete':
          return await deleteSocialMediaPlatform(...args);
        default:
          throw new Error('Unknown operation');
      }
    } catch (err) {
      // Error is already handled in individual functions
      throw err;
    }
  }, [fetchSocialMedia, updateSocialMedia, deleteSocialMediaPlatform, clearError]);

  // Check if user has completed social media setup
  const checkSocialMediaCompletion = useCallback(async () => {
    try {
      const platforms = await fetchSocialMedia();
      return platforms && platforms.length > 0;
    } catch (err) {
      // If fetch fails, assume not completed
      return false;
    }
  }, [fetchSocialMedia]);

  // Validate social media data before submission
  const validateSocialMediaData = useCallback((data) => {
    const errors = [];

    if (!data.platforms || !Array.isArray(data.platforms)) {
      errors.push('Platforms data is required');
      return { isValid: false, errors };
    }

    if (data.platforms.length === 0) {
      errors.push('At least one social media platform is required');
      return { isValid: false, errors };
    }

    // Validate each platform
    data.platforms.forEach((platform, index) => {
      if (!platform.platform) {
        errors.push(`Platform ${index + 1}: Platform type is required`);
      }

      if (!platform.handle) {
        errors.push(`Platform ${index + 1}: Handle is required`);
      } else if (!platform.handle.startsWith('@')) {
        errors.push(`Platform ${index + 1}: Handle must start with @`);
      } else if (!/^@[a-zA-Z0-9_]+$/.test(platform.handle)) {
        errors.push(`Platform ${index + 1}: Handle contains invalid characters`);
      }

      if (typeof platform.followers !== 'number' || platform.followers < 0) {
        errors.push(`Platform ${index + 1}: Follower count must be a positive number`);
      }
    });

    // Check for duplicate platforms
    const platformTypes = data.platforms.map(p => p.platform);
    const uniquePlatforms = new Set(platformTypes);
    if (platformTypes.length !== uniquePlatforms.size) {
      errors.push('Duplicate platforms are not allowed');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  // Format follower count for display
  const formatFollowerCount = useCallback((count) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  }, []);

  // Get platform display information
  const getPlatformDisplayInfo = useCallback((platform) => {
    const platformInfo = {
      instagram: { label: 'Instagram', color: '#E4405F', icon: 'instagram' },
      twitter: { label: 'Twitter/X', color: '#1DA1F2', icon: 'twitter' },
      tiktok: { label: 'TikTok', color: '#000000', icon: 'tiktok' },
      youtube: { label: 'YouTube', color: '#FF0000', icon: 'youtube' },
      facebook: { label: 'Facebook', color: '#1877F2', icon: 'facebook' },
    };

    return platformInfo[platform] || { label: platform, color: '#666666', icon: 'default' };
  }, []);

  return {
    // State
    loading,
    error,
    
    // CRUD Operations
    fetchSocialMedia,
    updateSocialMedia,
    deleteSocialMediaPlatform,
    
    // Utility Functions
    clearError,
    retryLastOperation,
    checkSocialMediaCompletion,
    validateSocialMediaData,
    formatFollowerCount,
    getPlatformDisplayInfo,
  };
};

export default useSocialMedia; 