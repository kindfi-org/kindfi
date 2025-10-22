/** biome-ignore-all lint/a11y/useAriaPropsSupportedByRole: any */
'use client'

import type {
	EscrowType,
	MultiReleaseMilestone,
	SingleReleaseMilestone,
} from '@trustless-work/escrow'
import { motion, useInView } from 'framer-motion'
import { AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useEscrow } from '~/hooks/contexts/use-escrow.context'
import type { Milestone } from '~/lib/types/project/project-detail.types'

interface MilestonesTabProps {
	milestones: Milestone[]
	escrowContractAddress?: string
	escrowType?: EscrowType
}

export function MilestonesTab({
	milestones,
	escrowContractAddress,
	escrowType: _escrowType,
}: MilestonesTabProps) {
	const { getEscrowByContractIds } = useEscrow()
	const [onChainMilestones, setOnChainMilestones] = useState<
		Milestone[] | null
	>(null)
	const [isLoadingOnChain, setIsLoadingOnChain] = useState(false)

	useEffect(() => {
		const fetchOnChain = async () => {
			if (!escrowContractAddress) return
			try {
				setIsLoadingOnChain(true)
				const resp = await getEscrowByContractIds({
					contractIds: [escrowContractAddress],
					validateOnChain: false,
				})
				// Handle both object and array responses from the indexer
				const escrow = Array.isArray(resp) ? resp[0] : resp
				const ms =
					(escrow?.milestones as
						| (SingleReleaseMilestone | MultiReleaseMilestone)[]
						| undefined) || []
				const isSingle = (
					m: SingleReleaseMilestone | MultiReleaseMilestone,
				): m is SingleReleaseMilestone => 'approved' in m
				const mapped: Milestone[] = ms.map((m, idx) => ({
					id: String(idx),
					title: m.description || `Milestone ${idx + 1}`,
					description: m.description || '',
					amount: (m as MultiReleaseMilestone).amount ?? 0,
					deadline: new Date().toISOString(),
					status: isSingle(m)
						? m.approved
							? 'approved'
							: 'pending'
						: 'pending',
					orderIndex: idx,
				}))
				setOnChainMilestones(mapped)
			} finally {
				setIsLoadingOnChain(false)
			}
		}
		fetchOnChain()
	}, [escrowContractAddress, getEscrowByContractIds])

	// Prefer on-chain milestones when an escrow contract is present.
	const effectiveMilestones = useMemo(() => {
		if (escrowContractAddress) return onChainMilestones ?? []
		return milestones
	}, [escrowContractAddress, onChainMilestones, milestones])
	const sortedMilestones = [...effectiveMilestones].sort(
		(a, b) => a.orderIndex - b.orderIndex,
	)

	if (sortedMilestones.length === 0) {
		if (escrowContractAddress && isLoadingOnChain) {
			return (
				<div className="p-6 text-center text-gray-500 bg-white rounded-xl shadow-sm">
					Loading milestones from escrow...
				</div>
			)
		}
		return (
			<div className="p-6 text-center text-gray-500 bg-white rounded-xl shadow-sm">
				No milestones available for this project.
			</div>
		)
	}

	return (
		<motion.div
			className="p-6 bg-white rounded-xl shadow-sm"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.3 }}
		>
			<h2 className="mb-8 text-2xl font-bold">Project Milestones</h2>

			<div className="relative">
				{/* Vertical timeline line */}
				<div
					className="absolute left-0 sm:left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"
					aria-hidden="true"
				/>

				<div className="space-y-12">
					{sortedMilestones.map((milestone, index) => (
						<MilestoneCard
							key={milestone.id}
							milestone={milestone}
							index={index}
						/>
					))}
				</div>
			</div>
		</motion.div>
	)
}

interface MilestoneCardProps {
	milestone: Milestone
	index: number
}

function MilestoneCard({ milestone, index }: MilestoneCardProps) {
	const cardRef = useRef<HTMLDivElement>(null)
	const isInView = useInView(cardRef, { once: true, amount: 0.3 })

	const getStatusIcon = (status: string) => {
		const iconProps = { className: 'h-4 w-4', 'aria-hidden': true }
		switch (status) {
			case 'completed':
				return (
					<>
						<CheckCircle {...iconProps} className="text-green-500" />
						<span className="sr-only">Milestone completed</span>
					</>
				)
			case 'pending':
				return (
					<>
						<Clock {...iconProps} className="text-amber-500" />
						<span className="sr-only">Milestone pending</span>
					</>
				)
			case 'approved':
				return (
					<>
						<CheckCircle {...iconProps} className="text-blue-500" />
						<span className="sr-only">Milestone approved</span>
					</>
				)
			case 'rejected':
				return (
					<>
						<AlertCircle {...iconProps} className="text-red-500" />
						<span className="sr-only">Milestone rejected</span>
					</>
				)
			case 'disputed':
				return (
					<>
						<AlertCircle {...iconProps} className="text-yellow-600" />
						<span className="sr-only">Milestone disputed</span>
					</>
				)
			default:
				return null
		}
	}

	const getStatusClass = (status: string) => {
		switch (status) {
			case 'completed':
				return 'bg-green-100 text-green-800'
			case 'pending':
				return 'bg-amber-100 text-amber-800'
			case 'approved':
				return 'bg-blue-100 text-blue-800'
			case 'rejected':
				return 'bg-red-100 text-red-800'
			case 'disputed':
				return 'bg-yellow-100 text-yellow-800'
			default:
				return 'bg-gray-100 text-gray-800'
		}
	}

	const formattedDate = new Date(milestone.deadline).toLocaleDateString(
		'en-US',
		{
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		},
	)

	return (
		<div ref={cardRef} className="relative">
			{/* Timeline dot */}
			<div className="flex absolute top-0 -left-3 z-10 justify-center items-center w-6 h-6 bg-white rounded-full border-2 shadow-md sm:left-0 sm:w-12 sm:h-12">
				{getStatusIcon(milestone.status)}
			</div>
			{/* Card content */}
			<motion.div
				className="relative p-6 ml-6 bg-white rounded-lg border border-gray-200 shadow-sm sm:ml-20"
				initial={{ opacity: 0, x: 50 }}
				animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
				transition={{ duration: 0.5, delay: index * 0.1 }}
			>
				{/* Pointer triangle */}
				<div
					className="hidden absolute left-0 top-4 w-4 h-4 bg-white border-b border-l border-gray-200 transform rotate-45 -translate-x-2 sm:block"
					aria-hidden="true"
				/>

				<div className="flex flex-wrap gap-4 justify-between items-start mb-4">
					<h3 className="text-xl font-bold">{milestone.title}</h3>
					<span
						className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(milestone.status)}`}
						aria-label={`Status: ${milestone.status}`}
					>
						{milestone.status
							.replace('-', ' ')
							.replace(/\b\w/g, (l) => l.toUpperCase())}
					</span>
				</div>

				<p className="mb-6 text-muted-foreground">{milestone.description}</p>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div className="p-3 bg-gray-50 rounded-lg">
						<p className="mb-1 text-sm text-gray-500">Funding Required</p>
						<p className="font-bold">${milestone.amount.toLocaleString()}</p>
					</div>
					<div className="p-3 bg-gray-50 rounded-lg">
						<p className="mb-1 text-sm text-gray-500">Deadline</p>
						<p className="font-bold">{formattedDate}</p>
					</div>
				</div>
			</motion.div>
		</div>
	)
}
