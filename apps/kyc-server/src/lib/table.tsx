import type { Enums } from '@services/supabase'
import { CheckCircle2, Clock, Loader, XCircle } from 'lucide-react'

export const getStatusIcon = (
	status: Enums<'kyc_status_enum'> | null | undefined,
) => {
	if (!status) return <Loader className="text-muted-foreground" />

	switch (status) {
		case 'approved':
		case 'verified':
			return <CheckCircle2 className="text-green-500 dark:text-green-400" />
		case 'pending':
			return <Clock className="text-orange-500 dark:text-orange-400" />
		case 'rejected':
			return <XCircle className="text-red-500 dark:text-red-400" />
		default:
			return <Loader className="text-muted-foreground" />
	}
}

export const getStatusColor = (
	status: Enums<'kyc_status_enum'> | null | undefined,
) => {
	if (!status) return 'text-muted-foreground'

	switch (status) {
		case 'approved':
		case 'verified':
			return 'text-green-600 dark:text-green-400'
		case 'pending':
			return 'text-orange-600 dark:text-orange-400'
		case 'rejected':
			return 'text-red-600 dark:text-red-400'
		default:
			return 'text-muted-foreground'
	}
}

export const getStatusPillColor = (
	status: Enums<'kyc_status_enum'> | null | undefined,
) => {
	if (!status)
		return 'text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-800 dark:border-gray-700'

	switch (status) {
		case 'approved':
		case 'verified':
			return 'text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-900/20 dark:border-green-800'
		case 'pending':
			return 'text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-900/20 dark:border-orange-800'
		case 'rejected':
			return 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800'
		default:
			return 'text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-800 dark:border-gray-700'
	}
}
