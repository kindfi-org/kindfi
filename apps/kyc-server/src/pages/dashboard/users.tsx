import { Wifi, WifiOff } from 'lucide-react'
import { useCallback, useEffect, useId, useState } from 'react'
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import { KycTable } from '~/components/dashboard/table/kyc-table'
import { useKYCWebSocket } from '~/hooks/use-kyc-ws'
import type { KycRecord } from '~/lib/types/dashboard'
import { mockKycRecords } from '~/lib/mock-data/dashboard'

export function Users() {
	const searchId = useId()
	const [allUsers, setAllUsers] = useState<KycRecord[]>([])
	const [filteredUsers, setFilteredUsers] = useState<KycRecord[]>([])
	const [loading, setLoading] = useState(true)
	const [search, setSearch] = useState('')
	const [stats, setStats] = useState({
		total: 0,
		pending: 0,
		approved: 0,
		rejected: 0,
		verified: 0,
	})

	const { isConnected } = useKYCWebSocket({
		onUpdate: (update) => {
			setAllUsers((currentUsers) => {
				const existingUserIndex = currentUsers.findIndex((user) => user.user_id === update.data.user_id)
				
				let finalUsers: KycRecord[]
				if (existingUserIndex !== -1) {
					finalUsers = currentUsers.map((user, index) =>
						index === existingUserIndex
							? {
									...user,
									status: update.data.status,
									verification_level: update.data.verification_level,
								}
							: user,
					)
				} else {
					const newUser: KycRecord = {
						id: update.data.user_id,
						user_id: update.data.user_id,
						status: update.data.status,
						verification_level: update.data.verification_level,
						created_at: update.data.timestamp,
						updated_at: update.data.timestamp,
						notes: null,
						reviewer_id: null,
					}
					finalUsers = [...currentUsers, newUser]
				}

				setStats({
					total: finalUsers.length,
					pending: finalUsers.filter((u) => u.status === 'pending').length,
					approved: finalUsers.filter((u) => u.status === 'approved').length,
					rejected: finalUsers.filter((u) => u.status === 'rejected').length,
					verified: finalUsers.filter((u) => u.status === 'verified').length,
				})

				return finalUsers
			})
		},
	})

	const fetchUsers = useCallback(async () => {
		const controller = new AbortController()
		setLoading(true)
		
		try {
			const res = await fetch(`/api/users?page=1&limit=100`, { signal: controller.signal })
			
			if (!res.ok) {
				throw new Error(`HTTP ${res.status}`)
			}
			
			const data = await res.json()

			if (controller.signal.aborted) return

			if (data.users) {
				setAllUsers(data.users)
				setFilteredUsers(data.users)

				const statsAccumulator = data.users.reduce(
					(acc: { total: number; pending: number; approved: number; rejected: number; verified: number }, user: KycRecord) => {
						acc.total++
						if (user.status === 'pending') acc.pending++
						else if (user.status === 'approved') acc.approved++
						else if (user.status === 'rejected') acc.rejected++
						else if (user.status === 'verified') acc.verified++
						return acc
					},
					{ total: 0, pending: 0, approved: 0, rejected: 0, verified: 0 }
				)

				setStats(statsAccumulator)
			}
		} catch (error) {
			if (error instanceof Error && error.name === 'AbortError') {
				return
			}
			
			if (controller.signal.aborted) return

			console.log('API failed, using mock data')
			setAllUsers(mockKycRecords)
			setFilteredUsers(mockKycRecords)
			
			const mockStatsAccumulator = mockKycRecords.reduce(
				(acc: { total: number; pending: number; approved: number; rejected: number; verified: number }, user: KycRecord) => {
					acc.total++
					if (user.status === 'pending') acc.pending++
					else if (user.status === 'approved') acc.approved++
					else if (user.status === 'rejected') acc.rejected++
					else if (user.status === 'verified') acc.verified++
					return acc
				},
				{ total: 0, pending: 0, approved: 0, rejected: 0, verified: 0 }
			)
			
			setStats(mockStatsAccumulator)
		} finally {
			if (!controller.signal.aborted) {
				setLoading(false)
			}
		}
		
		return () => controller.abort()
	}, [])

	useEffect(() => {
		const q = search?.trim().toLowerCase()
		
		if (!q) {
			setFilteredUsers(allUsers)
			return
		}

		const filtered = allUsers.filter(
			(user: KycRecord) => user.user_id?.toLowerCase().includes(q) || user.id?.toLowerCase().includes(q),
		)
		setFilteredUsers(filtered)
	}, [search, allUsers])

	useEffect(() => {
		fetchUsers()
	}, [fetchUsers])

	return (
		<div className="@container/main flex flex-1 flex-col gap-2">
			<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
				<div className="flex justify-between items-center">
					<div className="flex items-center gap-3">
						<h1 className="text-xl font-semibold">KYC Users</h1>
						<div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-[1em]">
							{isConnected ? (
								<>
									<Wifi className="w-4 h-4 text-green-500 flex-shrink-0" />
									<span className="whitespace-nowrap">Live</span>
								</>
							) : (
								<>
									<WifiOff className="w-4 h-4 text-orange-500 flex-shrink-0" />
									<span className="whitespace-nowrap">Offline</span>
								</>
							)}
						</div>
					</div>
					<div className="flex gap-2">
						<label htmlFor={searchId} className="sr-only">
							Search users
						</label>
						<input
							id={searchId}
							type="text"
							placeholder="Search user..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="px-3 py-2 border rounded"
						/>
					</div>
				</div>

				<div className="grid grid-cols-2 @xl/main:grid-cols-3 @5xl/main:grid-cols-5 gap-4 px-4 lg:px-6 mb-6">
					<Card className="bg-gradient-to-t from-primary/5 to-card">
						<CardHeader>
							<CardDescription>Total Users</CardDescription>
							<CardTitle className="text-2xl font-semibold tabular-nums">
								{stats.total.toLocaleString()}
							</CardTitle>
						</CardHeader>
					</Card>

					<Card className="bg-gradient-to-t from-orange-100/20 to-card">
						<CardHeader>
							<CardDescription className="text-orange-600">
								Pending
							</CardDescription>
							<CardTitle className="text-2xl font-semibold tabular-nums text-orange-600">
								{stats.pending.toLocaleString()}
							</CardTitle>
						</CardHeader>
					</Card>

					<Card className="bg-gradient-to-t from-green-100/20 to-card">
						<CardHeader>
							<CardDescription className="text-green-600">
								Approved
							</CardDescription>
							<CardTitle className="text-2xl font-semibold tabular-nums text-green-600">
								{stats.approved.toLocaleString()}
							</CardTitle>
						</CardHeader>
					</Card>

					<Card className="bg-gradient-to-t from-red-100/20 to-card">
						<CardHeader>
							<CardDescription className="text-red-600">
								Rejected
							</CardDescription>
							<CardTitle className="text-2xl font-semibold tabular-nums text-red-600">
								{stats.rejected.toLocaleString()}
							</CardTitle>
						</CardHeader>
					</Card>

					<Card className="bg-gradient-to-t from-blue-100/20 to-card">
						<CardHeader>
							<CardDescription className="text-blue-600">
								Verified
							</CardDescription>
							<CardTitle className="text-2xl font-semibold tabular-nums text-blue-600">
								{stats.verified.toLocaleString()}
							</CardTitle>
						</CardHeader>
					</Card>
				</div>

				<KycTable data={filteredUsers} isLoading={loading} />
			</div>
		</div>
	)
}
