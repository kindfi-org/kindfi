'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Lock } from 'lucide-react'
import { notFound } from 'next/navigation'
import { useManagedProjectQuery } from '~/hooks/projects/use-managed-project-query'
import type { getBasicProjectInfoBySlug } from '~/lib/queries/projects/get-basic-project-info-by-slug'
import { EscrowAdminPanel } from './escrow-admin-panel'

export function EscrowAdminClientWrapper({ projectSlug }: { projectSlug: string }) {
	const prefersReducedMotion = useReducedMotion()
	const {
		data: project,
		isLoading,
		error,
	} = useManagedProjectQuery<Awaited<ReturnType<typeof getBasicProjectInfoBySlug>>>(
		'basic-project-info',
		projectSlug,
		'basic-info',
		{ additionalKeyValues: [projectSlug] },
	)

	if (isLoading) {
		return null
	}

	if (error || !project) notFound()

	return (
		<div className="relative min-h-[60vh]">
			<motion.div
				initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 12 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: prefersReducedMotion ? 0 : 0.35 }}
				className="mx-auto max-w-4xl space-y-8"
			>
				<header className="space-y-3">
					<div className="flex items-center gap-3">
						<div
							className="rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 p-3 text-white shadow-sm"
							aria-hidden="true"
						>
							<Lock className="h-6 w-6" />
						</div>
						<div className="min-w-0">
							<h1 className="text-3xl font-bold tracking-tight text-wrap-balance md:text-4xl">
								Create Project Escrow
							</h1>
							<p className="mt-1 text-muted-foreground">
								Set up a Trustless Work escrow for{' '}
								<span className="font-medium text-foreground">{project.title}</span>
							</p>
						</div>
					</div>
					<p className="max-w-2xl text-sm text-muted-foreground">
						Follow the steps below to configure your escrow type, roles, and milestones. You will
						sign one on-chain transaction to deploy the contract.
					</p>
				</header>

				<EscrowAdminPanel
					projectId={project.id}
					projectSlug={projectSlug}
					projectTitle={project.title}
					projectDescription={project.description}
					escrowType={project.escrowType}
				/>
			</motion.div>
		</div>
	)
}
