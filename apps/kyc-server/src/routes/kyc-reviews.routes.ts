import { Router } from 'express';
import { KycReviewsService } from '../services/kyc-reviews.service';
import { authMiddleware } from '../middleware/auth.middleware';
// Import shared KYC review types for type safety
import type { KycReview, CreateKycReviewInput, UpdateKycReviewInput } from '../../../../packages/shared/types/kyc-reviews';

const router = Router();
const kycReviewsService = new KycReviewsService();

// Create a new KYC review
router.post(
  '/',
  authMiddleware,
  async (req, res) => {
    try {
      const { user_id, status, notes }: CreateKycReviewInput = req.body;

      // Input validation: ensure required fields are present and valid
      if (typeof user_id !== 'string' || user_id.trim() === '') {
        return res.status(400).json({ error: 'Invalid or missing user_id' });
      }
      if (typeof status !== 'string' || status.trim() === '') {
        return res.status(400).json({ error: 'Invalid or missing status' });
      }
      if (notes !== undefined && typeof notes !== 'string') {
        return res.status(400).json({ error: 'Invalid notes' });
      }

      const review: KycReview = await kycReviewsService.createKycReview({ user_id, status, notes });
      res.status(201).json(review);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create KYC review' });
    }
  }
);

// Get KYC reviews for a user
router.get(
  '/user/:userId',
  authMiddleware,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const reviews: KycReview[] = await kycReviewsService.getKycReviewsByUserId(userId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch KYC reviews' });
    }
  }
);

// Get a specific KYC review
router.get(
  '/:id',
  authMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;
      const review: KycReview | null = await kycReviewsService.getKycReviewById(id);

      if (!review) {
        return res.status(404).json({ error: 'KYC review not found' });
      }

      res.json(review);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch KYC review' });
    }
  }
);

// Update a KYC review
router.patch(
  '/:id',
  authMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status, notes }: UpdateKycReviewInput = req.body;

      // Input validation: ensure required fields are present and valid
      if (typeof status !== 'string' || status.trim() === '') {
        return res.status(400).json({ error: 'Invalid or missing status' });
      }
      if (notes !== undefined && typeof notes !== 'string') {
        return res.status(400).json({ error: 'Invalid notes' });
      }

      const review: KycReview | null = await kycReviewsService.updateKycReview(id, { status, notes });

      if (!review) {
        return res.status(404).json({ error: 'KYC review not found' });
      }

      res.json(review);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update KYC review' });
    }
  }
);

// Get latest KYC review for a user
router.get(
  '/user/:userId/latest',
  authMiddleware,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const review: KycReview | null = await kycReviewsService.getLatestKycReviewByUserId(userId);
      res.json(review);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch latest KYC review' });
    }
  }
);

export { router as kycReviewsRouter };