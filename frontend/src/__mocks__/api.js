/**
 * API Mocking Utilities for FairPlay NIL Platform
 * Comprehensive mocks for testing API-dependent components
 */

// Mock data for consistent testing
const createMockData = () => ({
  deals: [
    {
      id: 1,
      user_id: 'test-user-id',
      status: 'draft',
      deal_type: 'standard',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      deal_nickname: 'Test Deal 1',
      payor_name: 'Test Brand',
      payor_type: 'brand',
      contact_name: 'John Doe',
      contact_email: 'john@testbrand.com',
      contact_phone: '+1234567890',
      activities: ['social_media', 'appearances'],
      obligations: ['post_content', 'attend_events'],
      grant_exclusivity: true,
      uses_school_ip: false,
      licenses_nil: true,
      compensation_cash: 1000,
      compensation_goods: 500,
      compensation_other: 'Product samples',
      is_group_deal: false,
      is_paid_to_llc: false,
      athlete_social_media: {
        instagram: 'testuser',
        twitter: 'testuser',
        tiktok: 'testuser'
      },
      social_media_confirmed: true,
      social_media_confirmed_at: '2024-01-01T00:00:00Z',
      clearinghouse_prediction: 'likely_approved',
      valuation_prediction: 'high_value',
      brand_partner: 'Test Brand',
      clearinghouse_result: 'approved',
      actual_compensation: 1500,
      valuation_range: '1000-2000',
      fmv: 1500
    },
    {
      id: 2,
      user_id: 'test-user-id',
      status: 'signed',
      deal_type: 'simple',
      created_at: '2024-01-02T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
      deal_nickname: 'Test Deal 2',
      payor_name: 'Another Brand',
      payor_type: 'collective',
      contact_name: 'Jane Smith',
      contact_email: 'jane@anotherbrand.com',
      contact_phone: '+1234567891',
      activities: ['endorsements'],
      obligations: ['wear_brand'],
      grant_exclusivity: false,
      uses_school_ip: true,
      licenses_nil: false,
      compensation_cash: 2000,
      compensation_goods: 0,
      compensation_other: null,
      is_group_deal: true,
      is_paid_to_llc: true,
      athlete_social_media: {
        instagram: 'testuser2',
        twitter: 'testuser2'
      },
      social_media_confirmed: false,
      social_media_confirmed_at: null,
      clearinghouse_prediction: 'needs_review',
      valuation_prediction: 'medium_value',
      brand_partner: 'Another Brand',
      clearinghouse_result: null,
      actual_compensation: null,
      valuation_range: '1500-2500',
      fmv: 2000
    }
  ],
  profiles: [
    {
      id: 'test-user-id',
      full_name: 'Test User',
      university: 'Test University',
      sports: ['Football', 'Basketball'],
      division: 'Division I',
      gender: 'Male',
      email: 'test@example.com',
      phone: '+1234567890',
      role: 'student',
      avatar_url: 'https://example.com/avatar.jpg',
      graduation_year: 2025,
      major: 'Computer Science',
      minor: 'Business',
      gpa: 3.5,
      academic_standing: 'Good Standing',
      social_media_handles: {
        instagram: 'testuser',
        twitter: 'testuser',
        tiktok: 'testuser',
        youtube: 'testuser',
        linkedin: 'testuser'
      }
    }
  ],
  socialMedia: [
    {
      id: 1,
      platform: 'instagram',
      handle: 'testuser',
      followers: 10000,
      verified: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      platform: 'twitter',
      handle: 'testuser',
      followers: 5000,
      verified: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 3,
      platform: 'tiktok',
      handle: 'testuser',
      followers: 15000,
      verified: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ],
  schools: [
    {
      id: 1,
      name: 'Test University',
      division: 'Division I',
      conference: 'Test Conference',
      state: 'CA',
      city: 'Test City'
    },
    {
      id: 2,
      name: 'Another University',
      division: 'Division II',
      conference: 'Another Conference',
      state: 'NY',
      city: 'Another City'
    }
  ]
});

// Helper function to create mock response
const createMockResponse = (data, status = 200) => {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data)
  };
};

// Helper function to create error response
const createErrorResponse = (message, status = 400) => {
  return {
    ok: false,
    status,
    json: async () => ({ detail: message }),
    text: async () => message
  };
};

// Mock API object with immutable data
export const mockApi = {
  // Deals endpoints
  deals: {
    // GET /api/deals - Get all deals
    fetch: async (params = {}) => {
      const { page = 1, limit = 20, status, deal_type, sort_by = 'created_at', sort_order = 'desc' } = params;

      const mockData = createMockData();
      let filteredDeals = [...mockData.deals];

      // Apply filters
      if (status) {
        filteredDeals = filteredDeals.filter(deal => deal.status === status);
      }
      if (deal_type) {
        filteredDeals = filteredDeals.filter(deal => deal.deal_type === deal_type);
      }

      // Apply sorting
      filteredDeals.sort((a, b) => {
        const aValue = a[sort_by];
        const bValue = b[sort_by];
        if (sort_order === 'desc') {
          return bValue > aValue ? 1 : -1;
        }
        return aValue > bValue ? 1 : -1;
      });

      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedDeals = filteredDeals.slice(startIndex, endIndex);

      return createMockResponse({
        deals: paginatedDeals,
        pagination: {
          page,
          limit,
          total: filteredDeals.length,
          total_pages: Math.ceil(filteredDeals.length / limit)
        }
      });
    },

    // POST /api/deals - Create new deal
    create: async (dealData = {}) => {
      const newDeal = {
        id: Math.floor(Math.random() * 1000) + 100,
        user_id: 'test-user-id',
        status: 'draft',
        deal_type: dealData.deal_type || 'standard',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...dealData
      };

      return createMockResponse(newDeal, 201);
    },

    // PUT /api/deals/{id} - Update deal
    update: async (dealId, updateData) => {
      const mockData = createMockData();
      const deal = mockData.deals.find(deal => deal.id === parseInt(dealId));

      if (!deal) {
        return createErrorResponse('Deal not found', 404);
      }

      const updatedDeal = {
        ...deal,
        ...updateData,
        updated_at: new Date().toISOString()
      };

      return createMockResponse(updatedDeal);
    },

    // GET /api/deals/{id} - Get specific deal
    fetchById: async (dealId) => {
      const mockData = createMockData();
      const deal = mockData.deals.find(deal => deal.id === parseInt(dealId));

      if (!deal) {
        return createErrorResponse('Deal not found', 404);
      }

      return createMockResponse(deal);
    },

    // DELETE /api/deals/{id} - Delete deal
    delete: async (dealId) => {
      const mockData = createMockData();
      const deal = mockData.deals.find(deal => deal.id === parseInt(dealId));

      if (!deal) {
        return createErrorResponse('Deal not found', 404);
      }

      return createMockResponse({ message: 'Deal deleted successfully' });
    },

    // PUT /api/deals/{id}/clearinghouse-prediction
    updateClearinghousePrediction: async (dealId, predictionData) => {
      const mockData = createMockData();
      const deal = mockData.deals.find(deal => deal.id === parseInt(dealId));

      if (!deal) {
        return createErrorResponse('Deal not found', 404);
      }

      return createMockResponse({ message: 'Clearinghouse prediction updated' });
    },

    // PUT /api/deals/{id}/valuation-prediction
    updateValuationPrediction: async (dealId, predictionData) => {
      const mockData = createMockData();
      const deal = mockData.deals.find(deal => deal.id === parseInt(dealId));

      if (!deal) {
        return createErrorResponse('Deal not found', 404);
      }

      return createMockResponse({ message: 'Valuation prediction updated' });
    }
  },

  // Profiles endpoints
  profiles: {
    // GET /api/profile - Get user profile
    fetch: async () => {
      const mockData = createMockData();
      const profile = mockData.profiles[0];
      if (!profile) {
        return createErrorResponse('Profile not found', 404);
      }
      return createMockResponse(profile);
    },

    // PUT /api/profile - Update user profile
    update: async (profileData) => {
      const mockData = createMockData();
      const profile = mockData.profiles[0];

      const updatedProfile = {
        ...profile,
        ...profileData,
        updated_at: new Date().toISOString()
      };

      return createMockResponse(updatedProfile);
    }
  },

  // Social Media endpoints
  socialMedia: {
    // GET /api/social-media - Get social media platforms
    fetch: async () => {
      const mockData = createMockData();
      return createMockResponse(mockData.socialMedia);
    },

    // PUT /api/social-media - Update social media platforms
    update: async (socialMediaData) => {
      const mockData = createMockData();
      const updatedPlatforms = socialMediaData.platforms || mockData.socialMedia;

      return createMockResponse(updatedPlatforms);
    },

    // DELETE /api/social-media/{platform} - Delete specific platform
    delete: async (platform) => {
      const mockData = createMockData();
      const platformExists = mockData.socialMedia.find(sm => sm.platform === platform);

      if (!platformExists) {
        return createErrorResponse('Platform not found', 404);
      }

      return createMockResponse({ message: 'Platform deleted successfully' });
    }
  },

  // Schools endpoints
  schools: {
    // GET /api/schools - Get schools
    fetch: async (params = {}) => {
      const { division } = params;
      const mockData = createMockData();

      let filteredSchools = [...mockData.schools];

      if (division) {
        filteredSchools = filteredSchools.filter(school => school.division === division);
      }

      return createMockResponse(filteredSchools);
    }
  }
};

// Helper function to mock fetch globally
export const mockFetch = (url, options = {}) => {
  const urlObj = new URL(url);
  const path = urlObj.pathname;
  const method = options.method || 'GET';

  // Extract deal ID from URL if present
  const dealIdMatch = path.match(/\/deals\/(\d+)/);
  const dealId = dealIdMatch ? dealIdMatch[1] : null;

  // Handle different endpoints
  if (path === '/api/deals' && method === 'GET') {
    const params = new URLSearchParams(urlObj.search);
    return mockApi.deals.fetch({
      page: parseInt(params.get('page')) || 1,
      limit: parseInt(params.get('limit')) || 20,
      status: params.get('status'),
      deal_type: params.get('deal_type'),
      sort_by: params.get('sort_by') || 'created_at',
      sort_order: params.get('sort_order') || 'desc'
    });
  }

  if (path === '/api/deals' && method === 'POST') {
    const body = JSON.parse(options.body || '{}');
    return mockApi.deals.create(body);
  }

  if (dealId && path.includes('/deals/') && method === 'PUT') {
    const body = JSON.parse(options.body || '{}');
    if (path.includes('/clearinghouse-prediction')) {
      return mockApi.deals.updateClearinghousePrediction(dealId, body);
    }
    if (path.includes('/valuation-prediction')) {
      return mockApi.deals.updateValuationPrediction(dealId, body);
    }
    return mockApi.deals.update(dealId, body);
  }

  if (dealId && path.includes('/deals/') && method === 'GET') {
    return mockApi.deals.fetchById(dealId);
  }

  if (dealId && path.includes('/deals/') && method === 'DELETE') {
    return mockApi.deals.delete(dealId);
  }

  if (path === '/api/profile' && method === 'GET') {
    return mockApi.profiles.fetch();
  }

  if (path === '/api/profile' && method === 'PUT') {
    const body = JSON.parse(options.body || '{}');
    return mockApi.profiles.update(body);
  }

  if (path === '/api/social-media' && method === 'GET') {
    return mockApi.socialMedia.fetch();
  }

  if (path === '/api/social-media' && method === 'PUT') {
    const body = JSON.parse(options.body || '{}');
    return mockApi.socialMedia.update(body);
  }

  if (path.match(/\/social-media\/[^\/]+$/) && method === 'DELETE') {
    const platform = path.split('/').pop();
    return mockApi.socialMedia.delete(platform);
  }

  if (path === '/api/schools' && method === 'GET') {
    const params = new URLSearchParams(urlObj.search);
    return mockApi.schools.fetch({
      division: params.get('division')
    });
  }

  // Default error response for unknown endpoints
  return createErrorResponse('Endpoint not found', 404);
};

// Export mock data for testing
export const mockData = createMockData();

export default mockApi;