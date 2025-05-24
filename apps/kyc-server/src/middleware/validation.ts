import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

const kycStatusSchema = Joi.string().valid('pending', 'approved', 'rejected', 'verified');
const verificationLevelSchema = Joi.string().valid('basic', 'enhanced');

const createKycReviewSchema = Joi.object({
  user_id: Joi.string().required(),
  status: kycStatusSchema.required(),
  verification_level: verificationLevelSchema.required(),
  reviewer_id: Joi.string().optional(),
  notes: Joi.string().optional(),
});

const updateKycReviewSchema = Joi.object({
  status: kycStatusSchema.optional(),
  verification_level: verificationLevelSchema.optional(),
  reviewer_id: Joi.string().optional(),
  notes: Joi.string().optional(),
});

/**
 * Factory function to create a validation middleware for a given Joi schema.
 * @param schema Joi schema to validate against
 * @returns Express middleware function
 */
export function createValidationMiddleware(schema: Joi.ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }
    next();
  };
}

export const validateCreateKycReview = createValidationMiddleware(createKycReviewSchema);

export const validateUpdateKycReview = createValidationMiddleware(updateKycReviewSchema);