import { Router } from 'express';
import { kycReviewsService } from '../services/kycReviewsService';
import { validateCreateKycReview, validateUpdateKycReview } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import { KycStatus } from '../types/kyc-status.type'; // Add this import (adjust path if needed)

const router = Router();

// Create a new KYC review
router.post('/', authenticate, validateCreateKycReview, async (req, res) => {
  try {
    const review = await kycReviewsService.createReview(req.body);
    res.status(201).json({
      success: true,
      data: review,
    });
  } catch (error) {
    const statusCode =
      error?.name === 'ValidationError'
        ? 400
        : error?.name === 'NotFoundError'
        ? 404
        : 500;
    res.status(statusCode).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

// Get reviews for a specific user
router.get('/user/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const reviews = await kycReviewsService.getReviewsByUserId(userId);

    if (!reviews || (Array.isArray(reviews) && reviews.length === 0)) {
      return res.status(404).json({
        success: false,
        error: 'No KYC reviews found for this user',
      });
    }

    res.json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    const statusCode =
      error?.name === 'ValidationError'
        ? 400
        : error?.name === 'NotFoundError'
        ? 404
        : 500;
    res.status(statusCode).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

// Get latest review for a specific user
router.get('/user/:userId/latest', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const review = await kycReviewsService.getLatestReviewByUserId(userId);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'No latest KYC review found for this user',
      });
    }

    res.json({
      success: true,
      data: review,
    });
  } catch (error) {
    const statusCode =
      error?.name === 'ValidationError'
        ? 400
        : error?.name === 'NotFoundError'
        ? 404
        : 500;
    res.status(statusCode).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

// Get a specific review by ID
router.get('/:reviewId', authenticate, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const review = await kycReviewsService.getReviewById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'KYC review not found',
      });
    }

    res.json({
      success: true,
      data: review,
    });
  } catch (error) {
    const statusCode =
      error?.name === 'ValidationError'
        ? 400
        : error?.name === 'NotFoundError'
        ? 404
        : 500;
    res.status(statusCode).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

// Update a KYC review
router.put('/:reviewId', authenticate, validateUpdateKycReview, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const review = await kycReviewsService.updateReview(reviewId, req.body);
    res.json({
      success: true,
      data: review,
    });
  } catch (error) {
    const statusCode =
      error?.name === 'ValidationError'
        ? 400
        : error?.name === 'NotFoundError'
        ? 404
        : 500;
    res.status(statusCode).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

// Get reviews by status
router.get('/status/:status', authenticate, async (req, res) => {
  try {
    const { status } = req.params;

    // Define allowed KycStatus values (update as needed)
    const allowedStatuses = ['pending', 'approved', 'rejected', 'under_review'] as const;
    type KycStatus = typeof allowedStatuses[number];

    if (!allowedStatuses.includes(status as KycStatus)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status value: '${status}'. Allowed values are: ${allowedStatuses.join(', ')}`,
      });
    }

    const reviews = await kycReviewsService.getReviewsByStatus(status as KycStatus);
    res.json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    const statusCode =
      error?.name === 'ValidationError'
        ? 400
        : error?.name === 'NotFoundError'
        ? 404
        : 500;
    res.status(statusCode).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

export default router;