import { Wifi, WifiOff } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import { KycTable } from '~/components/dashboard/table/kyc-table'
import { useKYCWebSocket } from '~/hooks/use-kyc-ws'
import { mockKycRecords } from '~/lib/mock-data/dashboard'

interface KYCUser {
	id: string
	user_id: string
	status: 'pending' | 'approved' | 'rejected' | 'verified'
	verification_level: 'basic' | 'enhanced'
	created_at: string
	updated_at: string
	notes: string | null
	reviewer_id: string | null
}

export default function Users() {
	const [allUsers, setAllUsers] = useState<KYCUser[]>([])
	const [filteredUsers, setFilteredUsers] = useState<KYCUser[]>([])
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
				const updatedUsers = currentUsers.map((user) =>
					user.user_id === update.data.user_id ||
					user.id === update.data.user_id
						? {
								...user,
								status: update.data.status as KYCUser['status'],
								verification_level: update.data.verification_level as KYCUser['verification_level'],
							}
						: user,
				)

				setStats({
					total: updatedUsers.length,
					pending: updatedUsers.filter((u) => u.status === 'pending').length,
					approved: updatedUsers.filter((u) => u.status === 'approved').length,
					rejected: updatedUsers.filter((u) => u.status === 'rejected').length,
					verified: updatedUsers.filter((u) => u.status === 'verified').length,
				})

				return updatedUsers
			})
		},
	})

	const fetchUsers = useCallback(async () => {
		setLoading(true)
		try {
			const res = await fetch(`/api/users?page=1&limit=100`)
			const data = await res.json()

			if (data.users) {
				setAllUsers(data.users)
				setFilteredUsers(data.users)

				setStats({
					total: data.users.length,
					pending: data.users.filter((u: KYCUser) => u.status === 'pending').length,
					approved: data.users.filter((u: KYCUser) => u.status === 'approved').length,
					rejected: data.users.filter((u: KYCUser) => u.status === 'rejected').length,
					verified: data.users.filter((u: KYCUser) => u.status === 'verified').length,
				})
			}
		} catch {
			console.log('API failed, using mock data')
			setAllUsers(mockKycRecords)
			setFilteredUsers(mockKycRecords)
			setStats({
				total: mockKycRecords.length,
				pending: mockKycRecords.filter((u: KYCUser) => u.status === 'pending').length,
				approved: mockKycRecords.filter((u: KYCUser) => u.status === 'approved').length,
				rejected: mockKycRecords.filter((u: KYCUser) => u.status === 'rejected').length,
				verified: mockKycRecords.filter((u: KYCUser) => u.status === 'verified').length,
			})
		}
		setLoading(false)
	}, [])

	useEffect(() => {
		if (!search) {
			setFilteredUsers(allUsers)
			return
		}

		const filtered = allUsers.filter(
			(user: KYCUser) => user.user_id?.includes(search) || user.id?.includes(search),
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
						<input
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
