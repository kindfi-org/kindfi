import type { KycReview, MonthlyChartData } from '~/lib/types/dashboard'

export const mockKycReviews: KycReview[] = [
	{
		id: '1',
		user_id: 'usr_001',
		reviewer_id: 'rev_001',
		status: 'approved',
		notes: 'All documents verified successfully. Identity confirmed.',
		verification_level: 'basic',
		created_at: '2024-01-20T14:30:00Z',
		updated_at: '2024-01-20T14:30:00Z',
	},
	{
		id: '2',
		user_id: 'usr_002',
		reviewer_id: 'rev_002',
		status: 'rejected',
		notes: 'Document quality insufficient for verification.',
		verification_level: 'basic',
		created_at: '2024-01-19T10:15:00Z',
		updated_at: '2024-01-19T10:15:00Z',
	},
	{
		id: '3',
		user_id: 'usr_003',
		reviewer_id: 'rev_003',
		status: 'pending',
		notes: 'Additional documentation required for enhanced verification.',
		verification_level: 'enhanced',
		created_at: '2024-01-18T16:45:00Z',
		updated_at: '2024-01-18T16:45:00Z',
	},
]

// TODO: use this as example to filter by periods...
export const mockMonthlyChartData: MonthlyChartData[] = [
	{ month: 'January', signups: 186, kycStarts: 80 },
	{ month: 'February', signups: 305, kycStarts: 200 },
	{ month: 'March', signups: 237, kycStarts: 120 },
	{ month: 'April', signups: 173, kycStarts: 190 },
	{ month: 'May', signups: 209, kycStarts: 130 },
	{ month: 'June', signups: 214, kycStarts: 140 },
]
