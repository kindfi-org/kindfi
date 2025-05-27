import { supabase } from '../lib/supabase';
import type { 
  KycReview, 
  CreateKycReviewInput, 
  UpdateKycReviewInput 
} from '@kindfi/shared/types/kyc-reviews';

export class KycReviewsService {
  async createKycReview(input: CreateKycReviewInput): Promise<KycReview | null> {
    const { data, error } = await supabase
      .from('kyc_reviews')
      .insert(input)
      .select()
      .single();

    if (error) {
      console.error('Error creating KYC review:', error);
      throw new Error('Failed to create KYC review');
    }

    return data;
  }

  async getKycReviewsByUserId(userId: string): Promise<KycReview[]> {
    const { data, error } = await supabase
      .from('kyc_reviews')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching KYC reviews:', error);
      throw new Error('Failed to fetch KYC reviews');
    }

    return data || [];
  }

  async getKycReviewById(id: string): Promise<KycReview | null> {
    const { data, error } = await supabase
      .from('kyc_reviews')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error('Failed to fetch KYC review');
    }

    return data;
  }

  async updateKycReview(id: string, input: UpdateKycReviewInput): Promise<KycReview | null> {
    const { data, error } = await supabase
      .from('kyc_reviews')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating KYC review:', error);
      throw new Error('Failed to update KYC review');
    }

    return data;
  }

  async getLatestKycReviewByUserId(userId: string): Promise<KycReview | null> {
    const { data, error } = await supabase
      .from('kyc_reviews')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching latest KYC review:', error);
      return null;
    }

    return data;
  }
}