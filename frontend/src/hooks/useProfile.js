import { useState, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { formatPhoneNumber } from '../utils/phoneUtils';
import { createLogger } from '../utils/logger';

// Cache configuration
const CACHE_KEY = 'fairplay_profile_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 second

// Logger instance
const logger = createLogger('useProfile');

/**
 * Custom hook for profile data management
 * Provides profile fetching, caching, error handling, and data formatting
 * Follows existing hook patterns from the codebase
 */
const useProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const { user } = useAuth();
  
  // Cache with 5-minute TTL
  const cacheRef = useRef({
    data: null,
    timestamp: null,
    TTL: CACHE_TTL
  });

  // localStorage cache functions
  const getCachedProfile = useCallback((userId) => {
    if (!userId) return null;
    
    try {
      const cached = localStorage.getItem(`${CACHE_KEY}_${userId}`);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TTL) {
          logger.debug('Profile loaded from localStorage cache', { userId });
          return data;
        } else {
          // Remove expired cache
          localStorage.removeItem(`${CACHE_KEY}_${userId}`);
          logger.debug('Expired profile cache removed', { userId });
        }
      }
    } catch (error) {
      logger.warn('Failed to read profile cache from localStorage', { error: error.message });
      try {
        localStorage.removeItem(`${CACHE_KEY}_${userId}`);
      } catch (cleanupError) {
        logger.error('Failed to cleanup corrupted cache', { error: cleanupError.message });
      }
    }
    
    return null;
  }, []);

  const setCachedProfile = useCallback((userId, profileData) => {
    if (!userId || !profileData) return;
    
    try {
      const cacheData = {
        data: profileData,
        timestamp: Date.now()
      };
      localStorage.setItem(`${CACHE_KEY}_${userId}`, JSON.stringify(cacheData));
      logger.debug('Profile cached to localStorage', { userId });
    } catch (error) {
      logger.warn('Failed to cache profile to localStorage', { error: error.message });
    }
  }, []);

  const invalidateCache = useCallback((userId) => {
    if (!userId) return;
    
    try {
      localStorage.removeItem(`${CACHE_KEY}_${userId}`);
      cacheRef.current = { data: null, timestamp: null, TTL: CACHE_TTL };
      logger.debug('Profile cache invalidated', { userId });
    } catch (error) {
      logger.warn('Failed to invalidate profile cache', { error: error.message });
    }
  }, []);

  // Helper function to check if cache is valid
  const isCacheValid = useCallback(() => {
    const cache = cacheRef.current;
    if (!cache.data || !cache.timestamp) return false;
    
    const now = Date.now();
    return (now - cache.timestamp) < cache.TTL;
  }, []);

  // Division enum mapping function
  const mapEnumToDivision = useCallback((division) => {
    const enumMap = {
      'I': 'Division I',
      'II': 'Division II', 
      'III': 'Division III',
      'NAIA': 'NAIA',
      'JUCO': 'JUCO'
    };
    return enumMap[division] || division;
  }, []);

  // Legacy division format conversion
  const convertLegacyDivision = useCallback((division) => {
    if (!division?.startsWith('D')) return division;
    
    const divisionMap = {
      'D1': 'Division I',
      'D2': 'Division II',
      'D3': 'Division III'
    };
    return divisionMap[division] || division;
  }, []);

  // Format sports array for display
  const formatSportsArray = useCallback((sports) => {
    if (!sports) return [];
    return Array.isArray(sports) ? sports : [sports];
  }, []);

  // Retry mechanism for failed requests
  const retryWithDelay = useCallback(async (operation, attempt = 1) => {
    try {
      return await operation();
    } catch (error) {
      if (attempt >= MAX_RETRY_ATTEMPTS) {
        throw error;
      }
      
      logger.warn(`Profile fetch attempt ${attempt} failed, retrying...`, { 
        error: error.message, 
        attempt,
        maxAttempts: MAX_RETRY_ATTEMPTS 
      });
      
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
      return retryWithDelay(operation, attempt + 1);
    }
  }, []);

  // Fetch profile data with caching
  const fetchProfile = useCallback(async (forceRefresh = false) => {
    if (!user) {
      const errorMsg = 'No authenticated user';
      setError(errorMsg);
      logger.warn('Profile fetch attempted without authenticated user');
      return null;
    }

    // Check localStorage cache first if not forcing refresh
    if (!forceRefresh) {
      const cachedProfile = getCachedProfile(user.id);
      if (cachedProfile) {
        setProfile(cachedProfile);
        cacheRef.current = { data: cachedProfile, timestamp: Date.now(), TTL: CACHE_TTL };
        return cachedProfile;
      }

      // Return memory cache if valid and not forcing refresh
      if (isCacheValid()) {
        setProfile(cacheRef.current.data);
        return cacheRef.current.data;
      }
    }

    setLoading(true);
    setError(null);
    setRetryCount(0);

    try {
      const profileData = await retryWithDelay(async () => {
        logger.debug('Fetching profile from database', { userId: user.id, forceRefresh });
        
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (fetchError) {
          // Handle specific Supabase errors
          if (fetchError.code === 'PGRST116') {
            logger.info('Profile not found, creating default profile', { userId: user.id });
            // Profile doesn't exist, return minimal profile data
            return {
              id: user.id,
              email: user.email,
              first_name: '',
              last_name: '',
              university: '',
              sports: [],
              division: '',
              phone: '',
              graduation_year: null
            };
          }
          throw fetchError;
        }

        return data;
      });

      if (profileData) {
        // Format the profile data
        const formattedData = {
          ...profileData,
          // Handle division enum mapping
          division: profileData.division?.startsWith('D') 
            ? convertLegacyDivision(profileData.division)
            : mapEnumToDivision(profileData.division),
          // Format sports array
          sports: formatSportsArray(profileData.sports),
          // Format phone number if exists
          phone: profileData.phone ? formatPhoneNumber(profileData.phone) : '',
          // Ensure email from auth data
          email: user.email || profileData.email || '',
          // Add computed fields
          displayName: profileData.first_name && profileData.last_name 
            ? `${profileData.first_name} ${profileData.last_name}`
            : profileData.first_name || profileData.last_name || 'Student-Athlete',
          initials: profileData.first_name && profileData.last_name 
            ? `${profileData.first_name[0]}${profileData.last_name[0]}`
            : profileData.first_name?.[0] || profileData.last_name?.[0] || 'SA',
          // Profile completion percentage
          completionPercentage: calculateCompletionPercentage(profileData)
        };

        // Update both memory and localStorage cache
        cacheRef.current = {
          data: formattedData,
          timestamp: Date.now(),
          TTL: CACHE_TTL
        };
        setCachedProfile(user.id, formattedData);

        setProfile(formattedData);
        logger.info('Profile fetched and cached successfully', { userId: user.id });
        return formattedData;
      }

      logger.warn('No profile data returned from database', { userId: user.id });
      return null;
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch profile data';
      setError(errorMessage);
      logger.error('Error fetching profile', { 
        error: errorMessage, 
        userId: user.id,
        code: err.code,
        details: err.details 
      });
      
      // Try to return cached data as fallback
      const fallbackProfile = getCachedProfile(user.id);
      if (fallbackProfile) {
        logger.info('Using cached profile as fallback', { userId: user.id });
        setProfile(fallbackProfile);
        return fallbackProfile;
      }
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, isCacheValid, mapEnumToDivision, convertLegacyDivision, formatSportsArray, getCachedProfile, setCachedProfile, retryWithDelay]);

  // Calculate profile completion percentage
  const calculateCompletionPercentage = useCallback((data) => {
    if (!data) return 0;
    
    const requiredFields = [
      'first_name', 'last_name', 'university', 'sports', 
      'division', 'gender', 'graduation_year'
    ];
    
    const optionalFields = [
      'phone', 'hometown', 'instagram', 'twitter', 'tiktok'
    ];
    
    let completed = 0;
    const total = requiredFields.length + optionalFields.length;
    
    // Check required fields (weighted more heavily)
    requiredFields.forEach(field => {
      if (data[field] && (Array.isArray(data[field]) ? data[field].length > 0 : true)) {
        completed += 1.5; // Required fields worth 1.5 points
      }
    });
    
    // Check optional fields
    optionalFields.forEach(field => {
      if (data[field] && data[field] !== '') {
        completed += 1;
      }
    });
    
    return Math.round((completed / (requiredFields.length * 1.5 + optionalFields.length)) * 100);
  }, []);

  // Refresh profile data (bypasses cache)
  const refetchProfile = useCallback(async () => {
    return await fetchProfile(true);
  }, [fetchProfile]);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Clear cache manually
  const clearCache = useCallback(() => {
    cacheRef.current = {
      data: null,
      timestamp: null,
      TTL: 5 * 60 * 1000
    };
  }, []);

  // Check if profile is complete enough for dashboard display
  const isProfileComplete = useCallback((profileData = profile) => {
    if (!profileData) return false;
    
    const requiredFields = ['first_name', 'last_name', 'university', 'sports'];
    return requiredFields.every(field => 
      profileData[field] && (Array.isArray(profileData[field]) ? profileData[field].length > 0 : true)
    );
  }, [profile]);

  // Get profile summary for banner display
  const getProfileSummary = useCallback((profileData = profile) => {
    if (!profileData) return null;
    
    return {
      name: profileData.displayName,
      initials: profileData.initials,
      university: profileData.university || 'University',
      sports: profileData.sports?.length > 0 ? profileData.sports.join(', ') : 'Sport',
      division: profileData.division || 'Division',
      graduationYear: profileData.graduation_year || 'Class of TBD',
      completionPercentage: profileData.completionPercentage || 0,
      isComplete: isProfileComplete(profileData)
    };
  }, [profile, isProfileComplete]);

  return {
    profile,
    loading,
    error,
    retryCount,
    fetchProfile,
    refetchProfile,
    clearError,
    clearCache,
    invalidateCache: () => invalidateCache(user?.id),
    isProfileComplete,
    getProfileSummary
  };
};

export default useProfile; 