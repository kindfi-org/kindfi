import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { logger } from '@/lib/logger'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { evaluateCountryRiskAuthorization } from '~/lib/compliance/authorization-service'
import { requireKycAuthorization } from '~/lib/kyc/denial'
import { withRateLimit } from '~/lib/middleware/rate-limit'
import { canAccessDevelopmentOnlyProject } from '~/lib/queries/projects/development-only-access'
import { createContributionSchema } from '~/lib/schemas/contribution.schemas'
import {
	checkDuplicateContribution,
	createContributionWithProjectUpdate,
	resolveProjectId,
	sendContributionNotifications,
	triggerGamificationUpdates,
	validateContributionAllowed,
} from '~/lib/services/contribution-service'
import { validateRequest } from '~/lib/utils/validation'

const MAX_CONTRIBUTION_AMOUNT = 1_000_000

async function createContributionHandler(req: NextRequest) {
	try {
		const [session, body] = await Promise.all([getServerSession(nextAuthOption), req.json()])
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const validation = validateRequest(createContributionSchema, body)
		if (!validation.success) {
			return validation.response
		}
		const { projectId, contractId, amount, transactionHash, walletAddress } = validation.data

		const numericAmount = Number(amount)

		if (typeof numericAmount !== 'number' || Number.isNaN(numericAmount) || numericAmount <= 0) {
			return NextResponse.json(
				{ error: 'Invalid request. amount must be a positive number.' },
				{ status: 400 },
			)
		}
		if (numericAmount > MAX_CONTRIBUTION_AMOUNT) {
			return NextResponse.json(
				{
					error: `Amount exceeds maximum allowed ($${MAX_CONTRIBUTION_AMOUNT.toLocaleString()}).`,
				},
				{ status: 400 },
			)
		}

		const countryRiskDecision = await evaluateCountryRiskAuthorization({
			userId: session.user.id,
			action: 'donate',
			amount: numericAmount,
		})
		if (!countryRiskDecision.allowed) {
			return NextResponse.json(
				{
					error:
						'This donation is currently unavailable for your account. Please complete verification, wait for manual review, or contact support.',
					requiredAction: countryRiskDecision.requiredAction,
				},
				{ status: 403 },
			)
		}

		const kycDecision = await requireKycAuthorization({
			userId: session.user.id,
			action: 'donate',
			amount: numericAmount,
		})
		if (!kycDecision.ok) {
			return kycDecision.response
		}

		const projectResolution = await resolveProjectId({ contractId, projectId })
		if (!projectResolution.success) {
			return NextResponse.json(
				{ error: projectResolution.error },
				{ status: projectResolution.status },
			)
		}
		const finalProjectId = projectResolution.projectId

		if (!finalProjectId) {
			return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
		}

		const devAccessAllowed = await canAccessDevelopmentOnlyProject(finalProjectId, session.user.id)
		if (!devAccessAllowed) {
			return NextResponse.json({ error: 'Project not found' }, { status: 404 })
		}

		const [contributionCheck, duplicateCheck] = await Promise.all([
			validateContributionAllowed(finalProjectId, contractId),
			checkDuplicateContribution({
				transactionHash,
				projectId: finalProjectId,
				contributorId: session.user.id,
			}),
		])
		if (!contributionCheck.allowed) {
			return NextResponse.json({ error: contributionCheck.error }, { status: 403 })
		}

		if (duplicateCheck.duplicate) {
			return NextResponse.json(
				{
					success: true,
					contributionId: duplicateCheck.contributionId,
					message: 'Contribution already exists',
				},
				{ status: 200 },
			)
		}

		const contributionResult = await createContributionWithProjectUpdate({
			projectId: finalProjectId,
			contributorId: session.user.id,
			amount: numericAmount,
		})
		if (!contributionResult.success) {
			return NextResponse.json(
				{
					error: contributionResult.error,
					details: contributionResult.details,
				},
				{ status: 500 },
			)
		}

		sendContributionNotifications({
			projectId: finalProjectId,
			contributorId: session.user.id,
			amount: numericAmount,
		}).catch((err) => {
			logger.error('[Contributions] Unhandled notification error:', err)
		})

		triggerGamificationUpdates({
			session,
			amount,
			req,
			walletAddress,
		}).catch((error) => {
			logger.error('[Gamification] Unhandled error in gamification updates:', error)
		})

		return NextResponse.json(
			{
				success: true,
				contributionId: contributionResult.contributionId,
			},
			{ status: 201 },
		)
	} catch (error) {
		logger.error('Create contribution error:', error)
		return NextResponse.json(
			{
				error: error instanceof Error ? error.message : 'Internal server error',
			},
			{ status: 500 },
		)
	}
}

export const POST = withRateLimit(
	{
		preset: 'strict',
		identifier: async (req) => {
			const ip = req.headers.get('x-forwarded-for')
			const session = await getServerSession(nextAuthOption)
			return session?.user?.id ?? ip ?? 'anonymous'
		},
	},
	createContributionHandler,
)
