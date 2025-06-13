import { CheckCircle2, Clock, Loader, XCircle } from 'lucide-react'

export const getStatusIcon = (status: string) => {
	switch (status) {
		case 'approved':
		case 'verified':
			return <CheckCircle2 className="text-green-500 dark:text-green-400" />
		case 'pending':
			return <Clock className="text-orange-500 dark:text-orange-400" />
		case 'rejected':
			return <XCircle className="text-red-500 dark:text-red-400" />
		default:
			return <Loader />
	}
}

export const getStatusColor = (status: string) => {
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
