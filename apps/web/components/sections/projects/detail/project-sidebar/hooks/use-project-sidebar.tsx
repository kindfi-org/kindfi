'use client'

import { CircleAlert } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'
import { useTrustlessSigner } from '~/hooks/escrow/use-trustless-signer'
import { useAuth } from '~/hooks/use-auth'
import { getProjectPageUrl } from '~/lib/seo/project-metadata'
import type { ProjectDetail } from '~/lib/types/project/project-detail.types'
import { useProjectSidebarEscrowState } from './use-project-sidebar-escrow-state'
import { useProjectSidebarFormSubmit } from './use-project-sidebar-form-submit'

export function useProjectSidebar(project: ProjectDetail, projectSlug: string) {
	const [isFollowing, setIsFollowing] = useState(false)
	const [isMounted, setIsMounted] = useState(false)

	const { address, walletName, isConnected, connect, disconnect } = useTrustlessSigner()
	const { user } = useAuth()

	useEffect(() => setIsMounted(true), [])

	const {
		escrowData,
		hasEscrow,
		isDonationReady,
		isEscrowDataLoading,
		onChainRaised,
		isFetchingBalance,
		progressPercentage,
		isGoalReached,
		displayReleased,
		releasedProgressPercent,
		fetchEscrowBalance,
		resolveEscrowTypeForFunding,
	} = useProjectSidebarEscrowState(project)

	const { form, onSubmit } = useProjectSidebarFormSubmit({
		project,
		isGoalReached,
		escrowData,
		fetchEscrowBalance,
		resolveEscrowTypeForFunding,
	})

	useEffect(() => {
		if (!user?.id || !project.kindlerId) {
			setIsFollowing(false)
			return
		}

		let cancelled = false

		const loadFollowStatus = async () => {
			try {
				const res = await fetch(
					`/api/profile/follow?targetUserId=${encodeURIComponent(project.kindlerId as string)}`,
				)
				if (!res.ok) return

				const data = (await res.json()) as { isFollowing?: boolean }
				if (!cancelled) {
					setIsFollowing(Boolean(data.isFollowing))
				}
			} catch (error) {
				logger.error('Failed to load follow status', error)
			}
		}

		void loadFollowStatus()

		return () => {
			cancelled = true
		}
	}, [user?.id, project.kindlerId])

	const handleToggleFollow = async () => {
		try {
			if (!user?.id) {
				toast.error('Sign in to follow this project', {
					icon: <CircleAlert className="text-destructive" />,
				})
				return
			}

			if (!project.kindlerId) {
				toast.error('Unable to follow: project creator unknown')
				return
			}

			const action = isFollowing ? 'unfollow' : 'follow'
			const res = await fetch('/api/profile/follow', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ targetUserId: project.kindlerId, action }),
			})

			if (!res.ok) {
				const payload = (await res.json().catch(() => null)) as { error?: string } | null
				throw new Error(payload?.error || 'Follow request failed')
			}

			const payload = (await res.json()) as { isFollowing?: boolean }
			setIsFollowing(typeof payload.isFollowing === 'boolean' ? payload.isFollowing : !isFollowing)
		} catch (error) {
			logger.error(error)
			toast.error(error instanceof Error ? error.message : 'Unable to update follow status', {
				icon: <CircleAlert className="text-destructive" />,
			})
		}
	}

	const shareUrl = useMemo(
		() => getProjectPageUrl(project.slug, projectSlug),
		[project.slug, projectSlug],
	)

	const isAuthenticated = Boolean(user?.id)

	const signInHref = useMemo(() => {
		const slug = project.slug ?? projectSlug
		const callbackPath = slug ? `/projects/${slug}` : '/projects'
		return `/sign-in?callbackUrl=${encodeURIComponent(callbackPath)}`
	}, [project.slug, projectSlug])

	return {
		form,
		hasEscrow,
		isGoalReached,
		isDonationReady,
		isEscrowDataLoading,
		progressPercentage,
		displayReleased,
		releasedProgressPercent,
		onChainRaised,
		isFetchingBalance,
		isMounted,
		isFollowing,
		isAuthenticated,
		signInHref,
		address,
		walletName,
		isConnected,
		connect,
		disconnect,
		onSubmit,
		handleToggleFollow,
		shareUrl,
	}
}
