'use client'

import { useSupabaseQuery } from '@packages/lib/hooks'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Lock } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '~/components/base/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/base/card'
import { getBasicProjectInfoBySlug } from '~/lib/queries/projects/get-basic-project-info-by-slug'
import { EscrowManagementPanel } from './escrow-management-panel'

export function EscrowManagementClientWrapper({ projectSlug }: { projectSlug: string }) {
	const prefersReducedMotion = useReducedMotion()
	const { data: project, error } = useSupabaseQuery(
		'basic-project-info',
		(client) => getBasicProjectInfoBySlug(client, projectSlug),
		{ additionalKeyValues: [projectSlug] },
	)

	if (error || !project) notFound()

	if (!project.escrowContractAddress) {
		return (
			<div className="mx-auto max-w-2xl space-y-8">
				<EmptyEscrowHeader />
				<Card>
					<CardHeader>
						<CardTitle>No Escrow Yet</CardTitle>
						<CardDescription>
							This project does not have an escrow contract. Create one first, then return here to
							fund it and manage milestones.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button asChild>
							<Link href={`/projects/${projectSlug}/manage/settings`}>
								Create Escrow
								<ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
							</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		)
	}

	return (
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
							Manage Project Escrow
						</h1>
						<p className="mt-1 text-muted-foreground">
							Fund, approve milestones, and release payments for{' '}
							<span className="font-medium text-foreground">{project.title}</span>
						</p>
					</div>
				</div>
				<p className="max-w-2xl text-sm text-muted-foreground">
					Follow the workflow guide below: fund the contract, approve milestones as work completes,
					then release funds to receivers.
				</p>
			</header>

			<EscrowManagementPanel
				projectId={project.id}
				escrowContractAddress={project.escrowContractAddress}
				escrowType={project.escrowType}
			/>
		</motion.div>
	)
}

function EmptyEscrowHeader() {
	return (
		<header className="space-y-3 text-center sm:text-left">
			<div className="flex flex-col items-center gap-3 sm:flex-row">
				<div
					className="rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 p-3 text-white shadow-sm"
					aria-hidden="true"
				>
					<Lock className="h-6 w-6" />
				</div>
				<div>
					<h1 className="text-3xl font-bold tracking-tight text-wrap-balance md:text-4xl">
						Manage Project Escrow
					</h1>
					<p className="mt-1 text-muted-foreground">Fund milestones and release payments</p>
				</div>
			</div>
		</header>
	)
}
