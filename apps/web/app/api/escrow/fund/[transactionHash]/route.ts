import { supabase } from '@packages/lib/supabase'
import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import { type NextRequest, NextResponse } from 'next/server'
import { AppError } from '~/lib/error'
import type { EscrowFundUpdateData } from '~/lib/types/escrow/escrow-payload.types'
import { validateEscrowFundUpdate } from '~/lib/validators/escrow'

export async function POST(
	req: NextRequest,
	{ params }: { params: Promise<{ transactionHash: string }> },
) {
	try {
		const transactionHash = (await params).transactionHash
		const updateData: EscrowFundUpdateData = await req.json()

		const validationResult = validateEscrowFundUpdate(updateData)

		if (!validationResult.success) {
			return NextResponse.json(
				{
					error: 'Invalid escrow fund update data',
					details: validationResult.errors,
				},
				{ status: 400 },
			)
		}

		const { escrowId, status } = updateData

		// Update transaction status
		const { data, error } = await supabase
			.from('transactions')
			.update({ status, confirmed_at: new Date().toISOString() })
			.eq('transaction_hash', transactionHash)
			.eq('project_id', escrowId) // Ensure escrowId matches

		if (error) throw new Error(error.message)

		// Send funds released notification when transaction is confirmed
		if (status === 'SUCCESSFUL') {
			const { data: project } = await supabaseServiceRole
				.from('projects')
				.select('title, slug, kindler_id')
				.eq('id', escrowId)
				.single()

			if (project?.kindler_id) {
				let amount: string | undefined
				try {
					const { data: tx } = await supabaseServiceRole
						.from('transactions')
						.select('amount')
						.eq('transaction_hash', transactionHash)
						.eq('project_id', escrowId)
						.single()
					if (tx?.amount != null) {
						amount = `$${Number(tx.amount).toLocaleString()}`
					}
				} catch {
					// amount optional
				}

				import('~/lib/email/email-notification-service')
					.then(({ sendFundsReleasedNotification }) =>
						sendFundsReleasedNotification({
							userId: project.kindler_id,
							projectTitle: project.title ?? 'Your project',
							projectSlug: project.slug ?? '',
							amount,
						}),
					)
					.catch((err) =>
						console.error('[Escrow fund] Notification error:', err),
					)
			}
		}

		return NextResponse.json(
			{ message: 'Transaction updated', data },
			{ status: 200 },
		)
	} catch (error) {
		if (error instanceof AppError) {
			console.error('Escrow Fund error:', error)
			return NextResponse.json(
				{
					error: error.message,
					details: error.details,
				},
				{ status: error.statusCode },
			)
		}

		console.error('Internal server error during escrow fund:', error)
		return NextResponse.json(
			{
				error:
					error instanceof Error
						? error.message
						: 'Internal server error during escrow fund',
			},
			{ status: 500 },
		)
	}
}
