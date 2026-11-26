'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import {
	createExceptionAction,
	revokeExceptionAction,
} from '~/app/actions/compliance/exception-actions'
import {
	activatePolicyAction,
	createDraftPolicyAction,
	disablePolicyAction,
	rollBackPolicyAction,
} from '~/app/actions/compliance/policy-actions'
import { Button } from '~/components/base/button'
import { Input } from '~/components/base/input'
import { Label } from '~/components/base/label'
import { Textarea } from '~/components/base/textarea'
import type { ComplianceMetrics } from '~/lib/compliance/metrics'
import type { ExceptionRecord, PolicyRecord } from '~/lib/compliance/policy-service'
import { PROTECTED_ACTIONS, type ProtectedAction, RISK_LEVELS } from '~/lib/compliance/types'
import { AdminSectionHeader } from './admin-section-header'

interface AdminComplianceManagerProps {
	mode: 'disabled' | 'monitor' | 'enforced'
	policies: PolicyRecord[]
	activePolicyId: string | null
	mismatches: Array<{
		user_id: string
		declared_country: string | null
		verified_country: string | null
	}>
	exceptions: ExceptionRecord[]
	metrics: ComplianceMetrics
}

const MODE_LABEL: Record<AdminComplianceManagerProps['mode'], string> = {
	disabled: 'Disabled — no country-risk evaluation runs',
	monitor: 'Monitor — decisions are computed and audited but never block',
	enforced: 'Enforced — matching policy rules can block actions',
}

function MetricTile({ label, value }: { label: string; value: number }) {
	return (
		<div className="rounded-lg border border-border/60 bg-muted/20 p-4">
			<div className="text-2xl font-semibold">{value}</div>
			<div className="text-xs text-muted-foreground">{label}</div>
		</div>
	)
}

function CreatePolicyForm({ onCreated }: { onCreated: () => void }) {
	const [isPending, startTransition] = useTransition()
	const [selectedActions, setSelectedActions] = useState<ProtectedAction[]>([])

	function toggleAction(action: ProtectedAction) {
		setSelectedActions((prev) =>
			prev.includes(action) ? prev.filter((a) => a !== action) : [...prev, action],
		)
	}

	function handleSubmit(formData: FormData) {
		const countryRulesRaw = String(formData.get('countryRules') ?? '')
		const countryRules = countryRulesRaw
			.split(',')
			.map((entry) => entry.trim())
			.filter(Boolean)
			.map((entry) => {
				const [code, risk] = entry.split(':').map((s) => s.trim())
				return { countryCode: code, riskLevel: risk }
			})
			.filter(
				(r) => r.countryCode && RISK_LEVELS.includes(r.riskLevel as (typeof RISK_LEVELS)[number]),
			)

		startTransition(async () => {
			const result = await createDraftPolicyAction({
				name: String(formData.get('name') ?? ''),
				reason: String(formData.get('reason') ?? ''),
				policyReference: String(formData.get('policyReference') ?? ''),
				effectiveStart: new Date(String(formData.get('effectiveStart') ?? '')).toISOString(),
				effectiveEnd: formData.get('effectiveEnd')
					? new Date(String(formData.get('effectiveEnd'))).toISOString()
					: null,
				countryRules,
				actions: selectedActions,
			})

			if (!result.success) {
				toast.error(result.error)
				return
			}
			toast.success('Draft policy created')
			setSelectedActions([])
			onCreated()
		})
	}

	return (
		<form action={handleSubmit} className="space-y-4 rounded-lg border border-border/60 p-4">
			<h3 className="font-semibold">Create draft policy</h3>
			<div className="grid gap-3 sm:grid-cols-2">
				<div className="space-y-1">
					<Label htmlFor="name">Name</Label>
					<Input id="name" name="name" required />
				</div>
				<div className="space-y-1">
					<Label htmlFor="policyReference">Policy reference</Label>
					<Input id="policyReference" name="policyReference" required />
				</div>
				<div className="space-y-1">
					<Label htmlFor="effectiveStart">Effective start</Label>
					<Input id="effectiveStart" name="effectiveStart" type="date" required />
				</div>
				<div className="space-y-1">
					<Label htmlFor="effectiveEnd">Effective end (optional)</Label>
					<Input id="effectiveEnd" name="effectiveEnd" type="date" />
				</div>
			</div>
			<div className="space-y-1">
				<Label htmlFor="reason">Internal reason (required)</Label>
				<Textarea id="reason" name="reason" required minLength={10} rows={2} />
			</div>
			<div className="space-y-1">
				<Label htmlFor="countryRules">
					Country risk rules — comma-separated `CODE:risk_level` (e.g. `US:standard,
					XX:enhanced_review`)
				</Label>
				<Textarea id="countryRules" name="countryRules" rows={2} placeholder="XX:enhanced_review" />
			</div>
			<fieldset className="space-y-2">
				<legend className="text-sm font-medium">Affected actions</legend>
				<div className="flex flex-wrap gap-3">
					{PROTECTED_ACTIONS.map((action) => (
						<label key={action} className="flex items-center gap-2 text-sm">
							<input
								type="checkbox"
								checked={selectedActions.includes(action)}
								onChange={() => toggleAction(action)}
							/>
							{action}
						</label>
					))}
				</div>
			</fieldset>
			<Button type="submit" disabled={isPending}>
				{isPending ? 'Saving...' : 'Save draft'}
			</Button>
		</form>
	)
}

function PolicyRow({
	policy,
	isActive,
	onChanged,
}: {
	policy: PolicyRecord
	isActive: boolean
	onChanged: () => void
}) {
	const [isPending, startTransition] = useTransition()

	function activate() {
		const reason = window.prompt('Reason for activating this policy version:')
		if (!reason) return
		startTransition(async () => {
			const result = await activatePolicyAction({ policyId: policy.id, reason })
			if (!result.success) toast.error(result.error)
			else {
				toast.success('Policy activated')
				onChanged()
			}
		})
	}

	function rollback() {
		const reason = window.prompt('Reason for rolling back to this policy version:')
		if (!reason) return
		startTransition(async () => {
			const result = await rollBackPolicyAction({ policyId: policy.id, reason })
			if (!result.success) toast.error(result.error)
			else {
				toast.success('Rolled back')
				onChanged()
			}
		})
	}

	return (
		<div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 py-2 text-sm">
			<div>
				<span className="font-medium">v{policy.version}</span> — {policy.name}{' '}
				<span className="text-xs text-muted-foreground">({policy.status})</span>
				{isActive ? (
					<span className="ml-2 rounded bg-green-100 px-2 py-0.5 text-xs text-green-800">
						active
					</span>
				) : null}
			</div>
			<div className="flex gap-2">
				{policy.status === 'draft' ? (
					<Button size="sm" variant="outline" disabled={isPending} onClick={activate}>
						Activate
					</Button>
				) : null}
				{policy.status === 'rolled_back' ? (
					<Button size="sm" variant="outline" disabled={isPending} onClick={rollback}>
						Roll back to this version
					</Button>
				) : null}
			</div>
		</div>
	)
}

function CreateExceptionForm({ onCreated }: { onCreated: () => void }) {
	const [isPending, startTransition] = useTransition()

	function handleSubmit(formData: FormData) {
		startTransition(async () => {
			const result = await createExceptionAction({
				userId: String(formData.get('userId') ?? ''),
				action: String(formData.get('action') ?? ''),
				reason: String(formData.get('reason') ?? ''),
				expiresAt: new Date(String(formData.get('expiresAt') ?? '')).toISOString(),
			})
			if (!result.success) toast.error(result.error)
			else {
				toast.success('Exception created')
				onCreated()
			}
		})
	}

	return (
		<form action={handleSubmit} className="space-y-3 rounded-lg border border-border/60 p-4">
			<h3 className="font-semibold">Create exception</h3>
			<div className="grid gap-3 sm:grid-cols-2">
				<div className="space-y-1">
					<Label htmlFor="userId">User ID</Label>
					<Input id="userId" name="userId" required placeholder="uuid" />
				</div>
				<div className="space-y-1">
					<Label htmlFor="action">Action</Label>
					<select
						id="action"
						name="action"
						required
						className="w-full rounded-md border border-input px-3 py-2 text-sm"
					>
						{PROTECTED_ACTIONS.map((a) => (
							<option key={a} value={a}>
								{a}
							</option>
						))}
					</select>
				</div>
				<div className="space-y-1">
					<Label htmlFor="expiresAt">Expires at</Label>
					<Input id="expiresAt" name="expiresAt" type="date" required />
				</div>
			</div>
			<div className="space-y-1">
				<Label htmlFor="exceptionReason">Justification (required)</Label>
				<Textarea id="exceptionReason" name="reason" required minLength={10} rows={2} />
			</div>
			<Button type="submit" disabled={isPending}>
				{isPending ? 'Saving...' : 'Create exception'}
			</Button>
		</form>
	)
}

function ExceptionRow({
	exception,
	onChanged,
}: {
	exception: ExceptionRecord
	onChanged: () => void
}) {
	const [isPending, startTransition] = useTransition()
	const isRevoked = Boolean(exception.revokedAt)
	const isExpired = new Date(exception.expiresAt) < new Date()

	function revoke() {
		const reason = window.prompt('Reason for revoking this exception:')
		if (!reason) return
		startTransition(async () => {
			const result = await revokeExceptionAction({ exceptionId: exception.id, reason })
			if (!result.success) toast.error(result.error)
			else {
				toast.success('Exception revoked')
				onChanged()
			}
		})
	}

	return (
		<div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 py-2 text-sm">
			<div>
				<span className="font-mono text-xs">{exception.userId}</span> — {exception.action}{' '}
				<span className="text-xs text-muted-foreground">
					{isRevoked ? 'revoked' : isExpired ? 'expired' : 'active'} · expires{' '}
					{new Date(exception.expiresAt).toLocaleDateString()}
				</span>
			</div>
			{!isRevoked ? (
				<Button size="sm" variant="outline" disabled={isPending} onClick={revoke}>
					Revoke
				</Button>
			) : null}
		</div>
	)
}

export function AdminComplianceManager({
	mode,
	policies,
	activePolicyId,
	mismatches,
	exceptions,
	metrics,
}: AdminComplianceManagerProps) {
	const [isPending, startTransition] = useTransition()

	function refresh() {
		window.location.reload()
	}

	function disable() {
		const reason = window.prompt('Reason for disabling enforcement:')
		if (!reason) return
		startTransition(async () => {
			const result = await disablePolicyAction({ reason })
			if (!result.success) toast.error(result.error)
			else {
				toast.success('Enforcement disabled')
				refresh()
			}
		})
	}

	return (
		<div className="space-y-8">
			<AdminSectionHeader
				title="Country-risk compliance"
				description="Configure, preview, monitor, activate, and roll back country-risk policies. No policy is active until an authorized compliance admin explicitly activates it."
			/>

			<div className="rounded-lg border border-border/60 bg-muted/20 p-4">
				<p className="text-sm">
					Current mode (<code>COUNTRY_RISK_MODE</code>): <strong>{mode}</strong> —{' '}
					{MODE_LABEL[mode]}
				</p>
				<p className="mt-1 text-xs text-muted-foreground">
					Changing this requires updating the server-only environment variable and redeploying. It
					cannot be changed from this UI.
				</p>
				{policies.some((p) => p.status === 'active') ? (
					<Button
						size="sm"
						variant="destructive"
						className="mt-3"
						disabled={isPending}
						onClick={disable}
					>
						Disable active policy (keeps history)
					</Button>
				) : null}
			</div>

			<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
				<MetricTile label="Would restrict (30d)" value={metrics.hypotheticalRestrictedCount} />
				<MetricTile label="Actually restricted (30d)" value={metrics.actualRestrictedCount} />
				<MetricTile label="Declared/verified mismatches" value={metrics.mismatchCount} />
				<MetricTile label="Manual review signals (30d)" value={metrics.manualReviewCount} />
				<MetricTile label="Active exceptions" value={metrics.activeExceptionCount} />
				<MetricTile label="Expiring within 7d" value={metrics.expiringExceptionCount} />
			</div>

			<section className="space-y-3">
				<h2 className="text-lg font-semibold">Policies</h2>
				<div className="rounded-lg border border-border/60 p-4">
					{policies.length === 0 ? (
						<p className="text-sm text-muted-foreground">No policies yet.</p>
					) : (
						policies.map((policy) => (
							<PolicyRow
								key={policy.id}
								policy={policy}
								isActive={policy.id === activePolicyId}
								onChanged={refresh}
							/>
						))
					)}
				</div>
				<CreatePolicyForm onCreated={refresh} />
			</section>

			<section className="space-y-3">
				<h2 className="text-lg font-semibold">Declared / verified mismatches</h2>
				<div className="rounded-lg border border-border/60 p-4">
					{mismatches.length === 0 ? (
						<p className="text-sm text-muted-foreground">No mismatches on file.</p>
					) : (
						mismatches.map((m) => (
							<div key={m.user_id} className="border-b border-border/40 py-2 text-sm">
								<span className="font-mono text-xs">{m.user_id}</span> — declared{' '}
								{m.declared_country ?? '—'}, verified {m.verified_country ?? '—'}
							</div>
						))
					)}
				</div>
			</section>

			<section className="space-y-3">
				<h2 className="text-lg font-semibold">Exceptions</h2>
				<div className="rounded-lg border border-border/60 p-4">
					{exceptions.length === 0 ? (
						<p className="text-sm text-muted-foreground">No exceptions yet.</p>
					) : (
						exceptions.map((exception) => (
							<ExceptionRow key={exception.id} exception={exception} onChanged={refresh} />
						))
					)}
				</div>
				<CreateExceptionForm onCreated={refresh} />
			</section>
		</div>
	)
}
