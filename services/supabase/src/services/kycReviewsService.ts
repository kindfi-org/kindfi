import { supabase } from '../lib/supabase';
import type { KycReview, CreateKycReview, UpdateKycReview } from '../types/database';

export class KycReviewsService {
  async createReview(reviewData: CreateKycReview): Promise<KycReview> {
    const { data, error } = await supabase
      .from('kyc_reviews')
      .insert(reviewData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create KYC review: ${error.message}`);
    }

    return data;
  }

  async getReviewsByUserId(userId: string): Promise<KycReview[]> {
    const { data, error } = await supabase
      .from('kyc_reviews')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch KYC reviews: ${error.message}`);
    }

    return data || [];
  }

  async getReviewById(reviewId: string): Promise<KycReview | null> {
    const { data, error } = await supabase
      .from('kyc_reviews')
      .select('*')
      .eq('id', reviewId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No rows returned
      }
      throw new Error(`Failed to fetch KYC review: ${error.message}`);
    }

    return data;
  }

  async updateReview(reviewId: string, updateData: UpdateKycReview): Promise<KycReview> {
    const { data, error } = await supabase
      .from('kyc_reviews')
      .update(updateData)
      .eq('id', reviewId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update KYC review: ${error.message}`);
    }

    return data;
  }

  async getLatestReviewByUserId(userId: string): Promise<KycReview | null> {
    const { data, error } = await supabase
      .from('kyc_reviews')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No rows returned
      }
      throw new Error(`Failed to fetch latest KYC review: ${error.message}`);
    }

    return data;
  }

  async getReviewsByStatus(status: KycStatus): Promise<KycReview[]> {
    const { data, error } = await supabase
      .from('kyc_reviews')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch KYC reviews by status: ${error.message}`);
    }

    return data || [];
  }
}

export const kycReviewsService = new KycReviewsService();