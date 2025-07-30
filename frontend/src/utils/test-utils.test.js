/**
 * Test file for test utilities
 * Verifies that mock contexts work correctly
 */

import {
  mockAuthContext,
  mockDealContext,
  mockDealContextWithDeal,
  mockDealContextLoading,
  mockDealContextWithError,
  testData
} from './test-utils';

describe('Test Utilities', () => {
  describe('mockAuthContext', () => {
    it('should have realistic user data', () => {
      expect(mockAuthContext.user).toBeDefined();
      expect(mockAuthContext.user.id).toBe('test-user-id');
      expect(mockAuthContext.user.email).toBe('test@example.com');
      expect(mockAuthContext.user.user_metadata.full_name).toBe('Test User');
    });

    it('should have async functions that return promises', async () => {
      const signInResult = await mockAuthContext.signIn({ email: 'test@example.com', password: 'password' });
      expect(signInResult).toHaveProperty('data');
      expect(signInResult).toHaveProperty('error');
      expect(signInResult.error).toBeNull();
    });

    it('should have proper state properties', () => {
      expect(mockAuthContext.loading).toBe(false);
      expect(mockAuthContext.error).toBeNull();
    });
  });

  describe('mockDealContext', () => {
    it('should have async functions that return promises', async () => {
      const createResult = await mockDealContext.createDraftDeal({ deal_type: 'standard' });
      expect(createResult).toHaveProperty('id');
      expect(createResult).toHaveProperty('deal_type');
      expect(createResult).toHaveProperty('status');
    });

    it('should have proper state properties', () => {
      expect(mockDealContext.deal).toBeNull();
      expect(mockDealContext.loading).toBe(false);
      expect(mockDealContext.error).toBeNull();
    });
  });

  describe('mockDealContextWithDeal', () => {
    it('should have a realistic deal object', () => {
      expect(mockDealContextWithDeal.deal).toBeDefined();
      expect(mockDealContextWithDeal.deal.id).toBe('test-deal-123');
      expect(mockDealContextWithDeal.deal.deal_type).toBe('standard');
      expect(mockDealContextWithDeal.deal.status).toBe('draft');
    });

    it('should have social media data', () => {
      expect(mockDealContextWithDeal.deal.social_media).toBeDefined();
      expect(mockDealContextWithDeal.deal.social_media.instagram).toBe('testuser');
    });
  });

  describe('mockDealContextLoading', () => {
    it('should have loading state', () => {
      expect(mockDealContextLoading.loading).toBe(true);
    });
  });

  describe('mockDealContextWithError', () => {
    it('should have error state', () => {
      expect(mockDealContextWithError.error).toBe('Test error message');
    });
  });

  describe('testData', () => {
    it('should have realistic test data', () => {
      expect(testData.user).toBeDefined();
      expect(testData.deal).toBeDefined();
      expect(testData.socialMedia).toBeDefined();
    });

    it('should have consistent user data', () => {
      expect(testData.user.id).toBe('test-user-id');
      expect(testData.user.email).toBe('test@example.com');
    });

    it('should have consistent deal data', () => {
      expect(testData.deal.id).toBe('test-deal-123');
      expect(testData.deal.deal_type).toBe('standard');
    });
  });
});