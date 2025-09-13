'use client'

import { useEffect, useState } from 'react'

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

interface UserData {
	id: string
	user_id: string
	email?: string | null
	display_name?: string | null
	status: 'pending' | 'approved' | 'rejected' | 'verified'
	verification_level: 'basic' | 'enhanced'
	reviewer_id?: string | null
	notes?: string | null
	created_at: string
	updated_at: string
}

interface UserDetailsSheetProps {
	item: UserData
}

export function UserDetailsSheet({ item }: UserDetailsSheetProps) {
	const [isLoading, setIsLoading] = useState(false)

	// Simulate loading state when opening
	useEffect(() => {
		setIsLoading(true)
		const timer = setTimeout(() => {
			setIsLoading(false)
		}, 800)
		return () => clearTimeout(timer)
	}, [])

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		})
	}

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'pending':
				return 'text-orange-600 bg-orange-50 border-orange-200'
			case 'approved':
				return 'text-green-600 bg-green-50 border-green-200'
			case 'rejected':
				return 'text-red-600 bg-red-50 border-red-200'
			default:
				return 'text-gray-600 bg-gray-50 border-gray-200'
		}
	}

	return (
		<Sheet>
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
								Detailed information and KYC status for {item.display_name || item.user_id}
							</SheetDescription>
						</SheetHeader>

						<div className="flex-1 space-y-6 overflow-auto">
							{/* User Information */}
							<div className="space-y-4">
								<h3 className="text-lg font-medium">User Information</h3>
								
								<div className="grid grid-cols-1 gap-4">
									<div className="space-y-2">
										<label className="text-sm font-medium text-muted-foreground">
											User ID
										</label>
										<p className="text-sm font-mono bg-muted px-3 py-2 rounded">
											{item.user_id}
										</p>
									</div>
									
									<div className="space-y-2">
										<label className="text-sm font-medium text-muted-foreground">
											Display Name
										</label>
										<p className="text-sm">
											{item.display_name || 'Not provided'}
										</p>
									</div>
									
									<div className="space-y-2">
										<label className="text-sm font-medium text-muted-foreground">
											Email Address
										</label>
										<p className="text-sm">
											{item.email || 'Not provided'}
										</p>
									</div>
								</div>
							</div>

							<Separator />

							{/* KYC Status */}
							<div className="space-y-4">
								<h3 className="text-lg font-medium">KYC Status</h3>
								
								<div className="grid grid-cols-1 gap-4">
									<div className="space-y-2">
										<label className="text-sm font-medium text-muted-foreground">
											Current Status
										</label>
										<div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(item.status)}`}>
											{item.status.charAt(0).toUpperCase() + item.status.slice(1)}
										</div>
									</div>
									
									<div className="space-y-2">
										<label className="text-sm font-medium text-muted-foreground">
											Verification Level
										</label>
										<p className="text-sm">
											{item.verification_level.charAt(0).toUpperCase() + item.verification_level.slice(1)}
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
										<label className="text-sm font-medium text-muted-foreground">
											Account Created
										</label>
										<p className="text-sm">
											{formatDate(item.created_at)}
										</p>
									</div>
									
									<div className="space-y-2">
										<label className="text-sm font-medium text-muted-foreground">
											Last Updated
										</label>
										<p className="text-sm">
											{formatDate(item.updated_at)}
										</p>
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
										disabled={item.status === 'approved'}
									>
										Approve KYC
									</Button>
									<Button 
										variant="outline" 
										size="sm"
										disabled={item.status === 'rejected'}
									>
										Reject KYC
									</Button>
									<Button variant="outline" size="sm">
										View Profile
									</Button>
									<Button variant="outline" size="sm">
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