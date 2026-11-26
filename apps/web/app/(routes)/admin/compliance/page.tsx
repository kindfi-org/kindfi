import { redirect } from 'next/navigation'
import { AdminComplianceManager } from '~/components/sections/admin/admin-compliance-manager'
import { requireComplianceAdmin } from '~/lib/compliance/admin-guard'
import { getCountryRiskMode } from '~/lib/compliance/country-risk-config'
import { getComplianceMetrics } from '~/lib/compliance/metrics'
import {
	getActivePolicy,
	listExceptions,
	listMismatchedCountryProfiles,
	listPolicies,
} from '~/lib/compliance/policy-service'

export default async function AdminCompliancePage() {
	try {
		await requireComplianceAdmin('viewCompliancePage')
	} catch {
		redirect('/admin')
	}

	const [mode, policies, activePolicy, mismatches, exceptions, metrics] = await Promise.all([
		Promise.resolve(getCountryRiskMode()),
		listPolicies(),
		getActivePolicy(),
		listMismatchedCountryProfiles(),
		listExceptions(),
		getComplianceMetrics(),
	])

	return (
		<AdminComplianceManager
			mode={mode}
			policies={policies}
			activePolicyId={activePolicy?.id ?? null}
			mismatches={
				mismatches as Array<{
					user_id: string
					declared_country: string | null
					verified_country: string | null
				}>
			}
			exceptions={exceptions}
			metrics={metrics}
		/>
	)
}
