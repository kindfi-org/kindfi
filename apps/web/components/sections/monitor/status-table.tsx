'use client'

import type { Database } from '@services/supabase'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo } from 'react'
import { useSetState } from 'react-use'
import {
	getEscrowRecordsAction,
	insertTestEscrowRecordAction,
	updateEscrowStatusAction,
} from '~/app/actions'
import { Button } from '~/components/base/button'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/base/select'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '~/components/base/table'
import { appConfig } from '~/lib/config/app.config'

type Tables = Database['public']['Tables']
type EscrowRecord = Tables['escrow_status']['Row']
type EscrowStatusType =
	| 'NEW'
	| 'FUNDED'
	| 'ACTIVE'
	| 'COMPLETED'
	| 'DISPUTED'
	| 'CANCELLED'

interface State {
	dbStatus: string
	error: string | null
	records: EscrowRecord[]
	isLoading: boolean
}

export function EscrowTable() {
	const router = useRouter()
	const [state, setState] = useSetState<State>({
		dbStatus: 'Checking...',
		error: null,
		records: [],
		isLoading: false,
	})

	const isDevelopment = useMemo(
		() => process.env.NODE_ENV === 'development',
		[],
	)

	const statusColors = useMemo(
		() => ({
			NEW: 'bg-gray-100',
			FUNDED: 'bg-blue-100',
			ACTIVE: 'bg-green-100',
			COMPLETED: 'bg-purple-100',
			DISPUTED: 'bg-red-100',
			CANCELLED: 'bg-yellow-100',
		}),
		[],
	)

	const fetchRecords = useCallback(async () => {
		if (!isDevelopment || !appConfig.features.enableEscrowFeature) return

		setState({ isLoading: true })
		try {
			const response = await getEscrowRecordsAction()

			if (!response.success) {
				setState({
					error: response.error || 'Failed to fetch records',
					dbStatus: 'Failed',
					isLoading: false,
				})
			} else {
				setState({
					records: (response.data as EscrowRecord[]) || [],
					dbStatus: 'Connected',
					error: null,
					isLoading: false,
				})
			}
		} catch (err) {
			setState({
				error: err instanceof Error ? err.message : 'Unknown error',
				dbStatus: 'Failed',
				isLoading: false,
			})
		}
	}, [isDevelopment, setState])

	const updateStatus = async (id: string, newStatus: EscrowStatusType) => {
		if (!isDevelopment || !appConfig.features.enableEscrowFeature) return

		setState({ isLoading: true })
		try {
			const response = await updateEscrowStatusAction(id, newStatus)

			if (!response.success) {
				throw new Error(response.error || 'Failed to update status')
			}

			await fetchRecords()
		} catch (err) {
			console.error('Error:', err)
			setState({
				error: err instanceof Error ? err.message : 'Unknown error',
				isLoading: false,
			})
		}
	}

	const insertTestData = async () => {
		if (!isDevelopment || !appConfig.features.enableEscrowFeature) return

		setState({ isLoading: true })
		try {
			const response = await insertTestEscrowRecordAction()

			if (!response.success) {
				throw new Error(response.error || 'Failed to insert test data')
			}

			await fetchRecords()
		} catch (err) {
			console.error('Error:', err)
			setState({
				error: err instanceof Error ? err.message : 'Unknown error',
				isLoading: false,
			})
		}
	}

	useEffect(() => {
		if (!isDevelopment) {
			router.push('/')
			return
		}

		if (appConfig.features.enableEscrowFeature) {
			fetchRecords()
		}
	}, [fetchRecords, isDevelopment, router])

	if (!isDevelopment) {
		return null
	}

	const { dbStatus, error, records, isLoading } = state

	return (
		<div className="p-8">
			<div className="bg-white rounded-lg shadow-lg p-6">
				<h1 className="text-2xl font-bold mb-4 text-black">
					Escrow Status System Test
				</h1>

				<div className="mb-4">
					<h2 className="text-xl mb-2 text-black">Database Status</h2>
					<p
						className={`font-medium ${
							dbStatus === 'Connected'
								? 'text-green-600'
								: dbStatus === 'Failed'
									? 'text-red-600'
									: 'text-yellow-600'
						}`}
					>
						Status: {dbStatus}
					</p>
					{error && <p className="text-red-500">Error: {error}</p>}
				</div>

				<div className="mb-4">
					<h2 className="text-xl mb-2 text-black">Test Actions</h2>
					<div className="flex flex-col gap-3 lg:flex-row lg:gap-4 md:w-[40%]">
						<Button
							onClick={insertTestData}
							className="bg-blue-500 hover:bg-blue-600"
							disabled={isLoading}
						>
							Insert Test Data
						</Button>

						<Button
							onClick={fetchRecords}
							className="bg-green-500 hover:bg-green-600"
							disabled={isLoading}
						>
							Refresh Records
						</Button>
					</div>
				</div>

				<div className="mt-8">
					<h2 className="text-xl mb-2 text-black">
						Current Records ({records.length})
					</h2>
					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="text-blue-600">ID</TableHead>
									<TableHead className="text-blue-600">Escrow ID</TableHead>
									<TableHead className="text-blue-600">Status</TableHead>
									<TableHead className="text-blue-600">Milestone</TableHead>
									<TableHead className="text-blue-600">Funded</TableHead>
									<TableHead className="text-blue-600">Released</TableHead>
									<TableHead className="text-blue-600">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{records.map((record) => (
									<TableRow
										key={record.id}
										className={statusColors[record.status]}
									>
										<TableCell className="font-mono text-sm">
											{record.id}
										</TableCell>
										<TableCell>{record.escrow_id}</TableCell>
										<TableCell className="font-medium">
											{record.status}
										</TableCell>
										<TableCell>{record.current_milestone}</TableCell>
										<TableCell>{record.total_funded}</TableCell>
										<TableCell>{record.total_released}</TableCell>
										<TableCell>
											<Select
												value={record.status}
												onValueChange={(value) =>
													updateStatus(record.id, value as EscrowStatusType)
												}
												disabled={isLoading}
											>
												<SelectTrigger className="w-[130px]">
													<SelectValue placeholder={record.status} />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="NEW">NEW</SelectItem>
													<SelectItem value="FUNDED">FUNDED</SelectItem>
													<SelectItem value="ACTIVE">ACTIVE</SelectItem>
													<SelectItem value="COMPLETED">COMPLETED</SelectItem>
													<SelectItem value="DISPUTED">DISPUTED</SelectItem>
													<SelectItem value="CANCELLED">CANCELLED</SelectItem>
												</SelectContent>
											</Select>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</div>

				<div className="mt-4">
					<h3 className="font-medium mb-2 text-black">Status Legend:</h3>
					<div className="grid grid-cols-3 gap-2">
						{Object.entries(statusColors).map(([status, color]) => (
							<div
								key={status}
								className={`${color} py-2 rounded text-[10px] text-center md:text-[20px] text-black`}
							>
								{status}
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	)
}
