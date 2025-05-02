import { Suspense } from 'react';
import { useKYCWebSocket } from '@/hooks/use-kyc-websocket';
import { createClient } from '@services/supabase';
import { KYCDashboardContent } from './components/kyc-dashboard-content';
import { KYCDashboardSkeleton } from './components/kyc-dashboard-skeleton';

async function getInitialKYCData() {
  const supabase = createClient();
  
  const { data: kycData, error } = await supabase
    .from('kyc_verifications')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error('Failed to fetch KYC data');
  }

  return kycData;
}

export default async function KYCDashboardPage() {
  const initialData = await getInitialKYCData();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">KYC Dashboard</h1>
      
      <Suspense fallback={<KYCDashboardSkeleton />}>
        <KYCDashboardContent initialData={initialData} />
      </Suspense>
    </div>
  );
}