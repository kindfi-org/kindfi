'use client'

import { useEffect, useRef, useState } from 'react'

import { Button } from '~/components/base/button'
import { Separator } from '~/components/base/separator'
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '~/components/base/sheet'
import { useKycActions } from '~/hooks/use-kyc-actions'
import { getStatusPillColor } from '~/utils/table'
import type { UserData } from './user-table-columns'

interface UserDetailsSheetProps {
	item: UserData
}

export function UserDetailsSheet({ item }: UserDetailsSheetProps) {
	const [isLoading, setIsLoading] = useState(false)
	const [isOpen, setIsOpen] = useState(false)
	const timerRef = useRef<NodeJS.Timeout | null>(null)
	const { updateKycStatus, isUpdating } = useKycActions()

	// Clear timer on unmount
	useEffect(() => {
		return () => {
			if (timerRef.current) {
				clearTimeout(timerRef.current)
			}
		}
	}, [])

	// Handle sheet open/close state changes
	useEffect(() => {
		if (isOpen) {
			// Start loading when sheet opens
			setIsLoading(true)
			timerRef.current = setTimeout(() => {
				setIsLoading(false)
			}, 800)
		} else {
			// Clear timer and reset loading when sheet closes
			if (timerRef.current) {
				clearTimeout(timerRef.current)
				timerRef.current = null
			}
			setIsLoading(false)
		}
	}, [isOpen])

	const handleApprove = async () => {
		const success = await updateKycStatus({
			recordId: item.id,  // Use the primary key instead of user_id
			userId: item.user_id,
			status: 'approved',
		})
		if (success) {
			// Optionally close the sheet or refresh data
		}
	}

	const handleReject = async () => {
		const success = await updateKycStatus({
			recordId: item.id,  // Use the primary key instead of user_id
			userId: item.user_id,
			status: 'rejected',
		})
		if (success) {
			// Optionally close the sheet or refresh data
			console.log('KYC rejected successfully')
		}
	}

	const handleViewProfile = () => {
		// Placeholder for view profile functionality
		console.log('View profile for user:', item.user_id)
	}

	const handleContactUser = () => {
		// Placeholder for contact user functionality
		console.log('Contact user:', item.user_id)
	}

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		})
	}


	return (
		<Sheet open={isOpen} onOpenChange={setIsOpen}>
			<SheetTrigger asChild>
				<Button
					variant="link"
					className="w-fit px-0 text-left text-foreground hover:text-primary"
					aria-label={`View details for user ${item.display_name || item.user_id}`}
				>
					{item.user_id}
				</Button>
			</SheetTrigger>
			<SheetContent
				side="right"
				className="flex flex-col w-full sm:w-[540px]"
				aria-describedby="user-details-description"
			>
				{isLoading ? (
					<div className="flex items-center justify-center h-full">
						<div className="text-center space-y-4">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
							<p className="text-muted-foreground">Loading user details...</p>
						</div>
					</div>
				) : (
					<>
						<SheetHeader className="pb-6">
							<SheetTitle className="text-xl font-semibold">
								User Details
							</SheetTitle>
							<SheetDescription id="user-details-description">
								Detailed information and KYC status for{' '}
								{item.display_name || item.user_id}
							</SheetDescription>
						</SheetHeader>

						<div className="flex-1 space-y-6 overflow-auto">
							{/* User Information */}
							<div className="space-y-4">
								<h3 className="text-lg font-medium">User Information</h3>

								<div className="grid grid-cols-1 gap-4">
									<div className="space-y-2">
										<p className="text-sm font-medium text-muted-foreground">
											User ID
										</p>
										<p className="text-sm font-mono bg-muted px-3 py-2 rounded">
											{item.user_id}
										</p>
									</div>

									<div className="space-y-2">
										<p className="text-sm font-medium text-muted-foreground">
											Display Name
										</p>
										<p className="text-sm">
											{item.display_name || 'Not provided'}
										</p>
									</div>

									<div className="space-y-2">
										<p className="text-sm font-medium text-muted-foreground">
											Email Address
										</p>
										<p className="text-sm">{item.email || 'Not provided'}</p>
									</div>
								</div>
							</div>

							<Separator />

							{/* KYC Status */}
							<div className="space-y-4">
								<h3 className="text-lg font-medium">KYC Status</h3>

								<div className="grid grid-cols-1 gap-4">
									<div className="space-y-2">
										<p className="text-sm font-medium text-muted-foreground">
											Current Status
										</p>
										<div
											className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getStatusPillColor(item.status)}`}
										>
											{item.status.charAt(0).toUpperCase() +
												item.status.slice(1)}
										</div>
									</div>

									<div className="space-y-2">
										<p className="text-sm font-medium text-muted-foreground">
											Verification Level
										</p>
										<p className="text-sm">
											{item.verification_level.charAt(0).toUpperCase() +
												item.verification_level.slice(1)}
										</p>
									</div>
								</div>
							</div>

							<Separator />

							{/* Timestamps */}
							<div className="space-y-4">
								<h3 className="text-lg font-medium">Timeline</h3>

								<div className="grid grid-cols-1 gap-4">
									<div className="space-y-2">
										<p className="text-sm font-medium text-muted-foreground">
											Account Created
										</p>
										<p className="text-sm">{formatDate(item.created_at)}</p>
									</div>

									<div className="space-y-2">
										<p className="text-sm font-medium text-muted-foreground">
											Last Updated
										</p>
										<p className="text-sm">{formatDate(item.updated_at)}</p>
									</div>
								</div>
							</div>

							<Separator />

							{/* Actions */}
							<div className="space-y-4">
								<h3 className="text-lg font-medium">Quick Actions</h3>

								<div className="flex flex-wrap gap-2">
									<Button
										variant="outline"
										size="sm"
										disabled={item.status === 'approved' || isUpdating}
										onClick={handleApprove}
									>
										{isUpdating ? 'Loading...' : 'Approve KYC'}
									</Button>
									<Button
										variant="outline"
										size="sm"
										disabled={item.status === 'rejected' || isUpdating}
										onClick={handleReject}
									>
										{isUpdating ? 'Loading...' : 'Reject KYC'}
									</Button>
									<Button 
										variant="outline" 
										size="sm"
										onClick={handleViewProfile}
										disabled={isUpdating}
									>
										View Profile
									</Button>
									<Button 
										variant="outline" 
										size="sm"
										onClick={handleContactUser}
										disabled={isUpdating}
									>
										Contact User
									</Button>
								</div>
							</div>
						</div>
					</>
				)}
			</SheetContent>
		</Sheet>
	)
}
