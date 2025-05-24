import { Router } from 'express';
import { kycReviewsService } from '../services/kycReviewsService';
import { validateCreateKycReview, validateUpdateKycReview } from '../middleware/validation';
import { authenticate } from '../middleware/auth';

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
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// Get reviews for a specific user
router.get('/user/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const reviews = await kycReviewsService.getReviewsByUserId(userId);
    res.json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// Get latest review for a specific user
router.get('/user/:userId/latest', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const review = await kycReviewsService.getLatestReviewByUserId(userId);
    res.json({
      success: true,
      data: review,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
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
    res.status(400).json({
      success: false,
      error: error.message,
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
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// Get reviews by status
router.get('/status/:status', authenticate, async (req, res) => {
  try {
    const { status } = req.params;
    const reviews = await kycReviewsService.getReviewsByStatus(status as KycStatus);
    res.json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;