/**
 * Test file for API mocking utilities
 * Verifies that API mocks work correctly
 */

import { mockApi, mockFetch, mockData } from './api';

describe('API Mocking Utilities', () => {
  describe('mockApi.deals', () => {
    it('should fetch deals with pagination', async () => {
      const response = await mockApi.deals.fetch({ page: 1, limit: 10 });
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.deals).toBeDefined();
      expect(data.pagination).toBeDefined();
      expect(data.pagination.page).toBe(1);
      expect(data.pagination.limit).toBe(10);
    });

    it('should filter deals by status', async () => {
      const response = await mockApi.deals.fetch({ status: 'draft' });
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.deals.every(deal => deal.status === 'draft')).toBe(true);
    });

    it('should create a new deal', async () => {
      const dealData = { deal_type: 'standard' };
      const response = await mockApi.deals.create(dealData);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.deal_type).toBe('standard');
      expect(data.status).toBe('draft');
    });

    it('should update an existing deal', async () => {
      const updateData = { deal_nickname: 'Updated Deal' };
      const response = await mockApi.deals.update(1, updateData);
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.deal_nickname).toBe('Updated Deal');
    });

    it('should return 404 for non-existent deal', async () => {
      const response = await mockApi.deals.update(999, {});

      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
    });

    it('should fetch deal by ID', async () => {
      const response = await mockApi.deals.fetchById(1);
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.id).toBe(1);
    });

    it('should delete a deal', async () => {
      const response = await mockApi.deals.delete(1);
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.message).toBe('Deal deleted successfully');
    });
  });

  describe('mockApi.profiles', () => {
    it('should fetch user profile', async () => {
      const response = await mockApi.profiles.fetch();
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.full_name).toBe('Test User');
      expect(data.university).toBe('Test University');
    });

    it('should update user profile', async () => {
      const updateData = { full_name: 'Updated User' };
      const response = await mockApi.profiles.update(updateData);
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.full_name).toBe('Updated User');
    });
  });

  describe('mockApi.socialMedia', () => {
    it('should fetch social media platforms', async () => {
      const response = await mockApi.socialMedia.fetch();
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
    });

    it('should update social media platforms', async () => {
      const updateData = {
        platforms: [
          { platform: 'instagram', handle: 'newuser', followers: 20000 }
        ]
      };
      const response = await mockApi.socialMedia.update(updateData);
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data[0].handle).toBe('newuser');
    });

    it('should delete a social media platform', async () => {
      const response = await mockApi.socialMedia.delete('instagram');
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.message).toBe('Platform deleted successfully');
    });
  });

  describe('mockApi.schools', () => {
    it('should fetch all schools', async () => {
      const response = await mockApi.schools.fetch();
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
    });

    it('should filter schools by division', async () => {
      const response = await mockApi.schools.fetch({ division: 'Division I' });
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.every(school => school.division === 'Division I')).toBe(true);
    });
  });

  describe('mockFetch', () => {
    it('should handle GET /api/deals', async () => {
      const response = await mockFetch('http://localhost:8000/api/deals');
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.deals).toBeDefined();
    });

    it('should handle POST /api/deals', async () => {
      const response = await mockFetch('http://localhost:8000/api/deals', {
        method: 'POST',
        body: JSON.stringify({ deal_type: 'standard' })
      });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.deal_type).toBe('standard');
    });

    it('should handle PUT /api/deals/{id}', async () => {
      const response = await mockFetch('http://localhost:8000/api/deals/1', {
        method: 'PUT',
        body: JSON.stringify({ deal_nickname: 'Updated Deal' })
      });
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.deal_nickname).toBe('Updated Deal');
    });

    it('should handle GET /api/profile', async () => {
      const response = await mockFetch('http://localhost:8000/api/profile');
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.full_name).toBe('Test User');
    });

    it('should handle GET /api/social-media', async () => {
      const response = await mockFetch('http://localhost:8000/api/social-media');
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(Array.isArray(data)).toBe(true);
    });

    it('should handle GET /api/schools', async () => {
      const response = await mockFetch('http://localhost:8000/api/schools');
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(Array.isArray(data)).toBe(true);
    });

    it('should return 404 for unknown endpoints', async () => {
      const response = await mockFetch('http://localhost:8000/api/unknown');

      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
    });
  });

  describe('mockData', () => {
    it('should have realistic deal data', () => {
      expect(mockData.deals).toBeDefined();
      expect(mockData.deals.length).toBeGreaterThan(0);
      expect(mockData.deals[0]).toHaveProperty('id');
      expect(mockData.deals[0]).toHaveProperty('status');
      expect(mockData.deals[0]).toHaveProperty('deal_type');
    });

    it('should have realistic profile data', () => {
      expect(mockData.profiles).toBeDefined();
      expect(mockData.profiles.length).toBeGreaterThan(0);
      expect(mockData.profiles[0]).toHaveProperty('full_name');
      expect(mockData.profiles[0]).toHaveProperty('university');
      expect(mockData.profiles[0]).toHaveProperty('sports');
    });

    it('should have realistic social media data', () => {
      expect(mockData.socialMedia).toBeDefined();
      expect(mockData.socialMedia.length).toBeGreaterThan(0);
      expect(mockData.socialMedia[0]).toHaveProperty('platform');
      expect(mockData.socialMedia[0]).toHaveProperty('handle');
      expect(mockData.socialMedia[0]).toHaveProperty('followers');
    });

    it('should have realistic school data', () => {
      expect(mockData.schools).toBeDefined();
      expect(mockData.schools.length).toBeGreaterThan(0);
      expect(mockData.schools[0]).toHaveProperty('name');
      expect(mockData.schools[0]).toHaveProperty('division');
      expect(mockData.schools[0]).toHaveProperty('state');
    });
  });
});