import { Router } from 'express';
import { KycReviewsService } from '../services/kyc-reviews.service';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const kycReviewsService = new KycReviewsService();

// Create a new KYC review
router.post('/', authMiddleware, async (req, res) => {
  try {
    const review = await kycReviewsService.createKycReview(req.body);
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create KYC review' });
  }
});

// Get KYC reviews for a user
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const reviews = await kycReviewsService.getKycReviewsByUserId(userId);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch KYC reviews' });
  }
});

// Get a specific KYC review
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const review = await kycReviewsService.getKycReviewById(id);
    
    if (!review) {
      return res.status(404).json({ error: 'KYC review not found' });
    }
    
    res.json(review);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch KYC review' });
  }
});

// Update a KYC review
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const review = await kycReviewsService.updateKycReview(id, req.body);
    res.json(review);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update KYC review' });
  }
});

// Get latest KYC review for a user
router.get('/user/:userId/latest', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const review = await kycReviewsService.getLatestKycReviewByUserId(userId);
    res.json(review);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch latest KYC review' });
  }
});

export default router;