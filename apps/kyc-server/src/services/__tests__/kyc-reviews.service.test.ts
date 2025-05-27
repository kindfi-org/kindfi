import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { KycReviewsService } from '../kyc-reviews.service';
import type { CreateKycReviewInput } from '@kindfi/shared/types/kyc-reviews';
import { prisma } from '../../../lib/prisma'; // Adjust path if needed

describe('KycReviewsService', () => {
  let service: KycReviewsService;
  let testUserId: string;

  beforeEach(() => {
    service = new KycReviewsService();
    testUserId = `test-user-${Date.now()}`;
  });

  afterEach(async () => {
    // Cleanup: remove all reviews for the test user to ensure test isolation
    await prisma.kycReview.deleteMany({
      where: { user_id: testUserId }
    });
  });

  it('should create a KYC review', async () => {
    const input: CreateKycReviewInput = {
      user_id: testUserId,
      status: 'pending',
      verification_level: 'basic',
      notes: 'Initial KYC review'
    };

    const review = await service.createKycReview(input);
    
    expect(review).toBeTruthy();
    expect(review?.user_id).toBe(testUserId);
    expect(review?.status).toBe('pending');
    expect(review?.verification_level).toBe('basic');
  });

  it('should fetch KYC reviews by user ID', async () => {
    // Create a review first
    const input: CreateKycReviewInput = {
      user_id: testUserId,
      status: 'approved',
      verification_level: 'enhanced'
    };

    await service.createKycReview(input);
    
    const reviews = await service.getKycReviewsByUserId(testUserId);
    
    expect(reviews).toBeTruthy();
    expect(reviews.length).toBeGreaterThan(0);
    expect(reviews[0].user_id).toBe(testUserId);
  });

  it('should update a KYC review', async () => {
    // Create a review first
    const input: CreateKycReviewInput = {
      user_id: testUserId,
      status: 'pending',
      verification_level: 'basic'
    };

    const createdReview = await service.createKycReview(input);
    
    if (createdReview) {
      const updatedReview = await service.updateKycReview(createdReview.id, {
        status: 'approved',
        notes: 'Approved after document verification'
      });

      expect(updatedReview?.status).toBe('approved');
      expect(updatedReview?.notes).toBe('Approved after document verification');
    }
  });

  it('should handle update for non-existent KYC review ID gracefully', async () => {
    const nonExistentId = `non-existent-id-${Date.now()}`;
    const result = await service.updateKycReview(nonExistentId, {
      status: 'rejected',
      notes: 'No such review'
    });

    expect(result).toBeNull();
  });
});