'use client'

import type { EscrowType } from '@trustless-work/escrow'
import { useId, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '~/components/base/button'
import { Input } from '~/components/base/input'
import { useEscrow } from '~/hooks/contexts/use-escrow.context'
import { useWallet } from '~/hooks/contexts/use-stellar-wallet.context'

export function EscrowAdminPanel({
	projectId,
	escrowContractAddress,
	escrowType,
}: {
	projectId: string
	escrowContractAddress?: string
	escrowType?: EscrowType
}) {
	const { deployEscrow, approveMilestone, changeMilestoneStatus } = useEscrow()
	const { isConnected, connect, address } = useWallet()

	const [title, setTitle] = useState('')
	const [amount, setAmount] = useState<number | ''>('')
	const [milestoneIndex, setMilestoneIndex] = useState('0')
	const titleId = useId()
	const amountId = useId()
	const milestoneId = useId()

	const ensureWallet = async () => {
		if (!isConnected) await connect()
		if (!address) throw new Error('Wallet address missing')
		return address
	}

	const handleCreateEscrow = async () => {
		try {
			const signer = await ensureWallet()
			const payload: {
				signer: string
				engagementId: string
				title: string
				roles: {
					approver: string
					serviceProvider: string
					platformAddress: string
					releaseSigner: string
					disputeResolver: string
					receiver: string
				}
				description: string
				amount: number
				platformFee: number
				trustline: { address: string; decimals: number }
				milestones: { description: string }[]
			} = {
				signer,
				engagementId: `project-${projectId}`,
				title: title || 'Project Escrow',
				roles: {
					approver: signer,
					serviceProvider: signer,
					platformAddress: signer,
					releaseSigner: signer,
					disputeResolver: signer,
					receiver: signer,
				},
				description: `Escrow for project ${projectId}`,
				amount: typeof amount === 'number' ? amount : 0,
				platformFee: 2,
				trustline: { address: '', decimals: 7 },
				milestones: [{ description: 'Milestone 1' }],
			}
			const res = await deployEscrow(
				payload,
				(escrowType as EscrowType) || 'single-release',
			)
			if (res.status !== 'SUCCESS') throw new Error('Failed to create escrow')
			toast.success(
				'Escrow initialized. Sign and broadcast next steps in flow.',
			)
		} catch (e) {
			console.error(e)
			toast.error('Failed to create escrow')
		}
	}

	const handleApproveMilestone = async () => {
		if (!escrowContractAddress)
			return toast.error('No escrow contract configured')
		try {
			const signer = await ensureWallet()
			const res = await approveMilestone(
				{
					contractId: escrowContractAddress,
					milestoneIndex,
					approver: signer,
					newFlag: true,
				},
				(escrowType as EscrowType) || 'single-release',
			)
			if (res.status !== 'SUCCESS') throw new Error('Approve failed')
			toast.success(
				'Milestone approved (unsigned tx). Continue to sign & submit.',
			)
		} catch (e) {
			console.error(e)
			toast.error('Failed to approve milestone')
		}
	}

	const handleChangeMilestoneStatus = async () => {
		if (!escrowContractAddress)
			return toast.error('No escrow contract configured')
		try {
			const signer = await ensureWallet()
			const res = await changeMilestoneStatus(
				{
					contractId: escrowContractAddress,
					milestoneIndex,
					newStatus: 'approved',
					newEvidence: 'Updated via admin panel',
					serviceProvider: signer,
				},
				(escrowType as EscrowType) || 'multi-release',
			)
			if (res.status !== 'SUCCESS') throw new Error('Update failed')
			toast.success(
				'Milestone status updated (unsigned tx). Continue to sign & submit.',
			)
		} catch (e) {
			console.error(e)
			toast.error('Failed to update milestone status')
		}
	}

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Escrow Admin</h1>

			<div className="grid gap-3">
				<label htmlFor={titleId} className="text-sm font-medium">
					Escrow Title
				</label>
				<Input
					id={titleId}
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					placeholder="Project Escrow"
				/>
			</div>

			<div className="grid gap-3">
				<label htmlFor={amountId} className="text-sm font-medium">
					Amount
				</label>
				<Input
					id={amountId}
					type="number"
					value={amount}
					onChange={(e) =>
						setAmount(e.target.value === '' ? '' : Number(e.target.value))
					}
					placeholder="100"
				/>
			</div>

			<div className="flex gap-3">
				<Button onClick={handleCreateEscrow} className="text-white">
					Create Escrow
				</Button>
			</div>

			<div className="h-px bg-gray-200" />

			<div className="grid gap-3">
				<label htmlFor={milestoneId} className="text-sm font-medium">
					Milestone Index
				</label>
				<Input
					id={milestoneId}
					value={milestoneIndex}
					onChange={(e) => setMilestoneIndex(e.target.value)}
				/>
			</div>

			<div className="flex gap-3">
				<Button variant="outline" onClick={handleApproveMilestone}>
					Approve Milestone
				</Button>
				<Button variant="outline" onClick={handleChangeMilestoneStatus}>
					Change Status
				</Button>
			</div>
		</div>
	)
}
