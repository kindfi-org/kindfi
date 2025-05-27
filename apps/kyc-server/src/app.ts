// Add import
import kycReviewsRoutes from './routes/kyc-reviews.routes';

// Register API routes in logical order
// Example: Place all /api/* routes together, after middleware and before error handlers

// Register other API routes here (e.g., app.use('/api/users', usersRoutes);)

app.use('/api/kyc-reviews', kycReviewsRoutes);

// Register non-API routes or error handlers here