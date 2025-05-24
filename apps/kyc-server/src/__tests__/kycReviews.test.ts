import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { kycReviewsService } from '../services/kycReviewsService';
import type { CreateKycReview } from '../types/database';

describe('KYC Reviews Service', () => {
  const testUserId = 'test-user-123';
  let createdReviewId: string;

  const testReviewData: CreateKycReview = {
    user_id: testUserId,
    status: 'pending',
    verification_level: 'basic',
    reviewer_id: 'reviewer-123',
    notes: 'Initial KYC review',
  };

  test('should create a KYC review', async () => {
    const review = await kycReviewsService.createReview(testReviewData);
    createdReviewId = review.id;

    expect(review).toBeDefined();
    expect(review.user_id).toBe(testUserId);
    expect(review.status).toBe('pending');
    expect(review.verification_level).toBe('basic');
  });

  test('should get reviews by user ID', async () => {
    const reviews = await kycReviewsService.getReviewsByUserId(testUserId);
    expect(reviews).toBeDefined();
    expect(reviews.length).toBeGreaterThan(0);
  });

  test('should get review by ID', async () => {
    const review = await kycReviewsService.getReviewById(createdReviewId);
    expect(review).toBeDefined();
    expect(review!.id).toBe(createdReviewId);
  });

  test('should update a KYC review', async () => {
    const updatedReview = await kycReviewsService.updateReview(createdReviewId, {
      status: 'approved',
      notes: 'KYC approved after verification',
    });

    expect(updatedReview.status).toBe('approved');
    expect(updatedReview.notes).toBe('KYC approved after verification');
  });

  test('should get latest review by user ID', async () => {
    const latestReview = await kycReviewsService.getLatestReviewByUserId(testUserId);
    expect(latestReview).toBeDefined();
    expect(latestReview!.user_id).toBe(testUserId);
  });

  // Cleanup
  afterAll(async () => {
    // Clean up test data if needed
    // This would depend on your test database setup
  });
});