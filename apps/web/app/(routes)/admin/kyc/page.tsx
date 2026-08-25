import { redirect } from 'next/navigation'
import { AdminKycMetrics } from '~/components/sections/admin/admin-kyc-metrics'
import { requireComplianceAdmin } from '~/lib/compliance/admin-guard'
import { getKycEnforcementMode } from '~/lib/kyc/enforcement-config'
import { getKycEnforcementMetrics } from '~/lib/kyc/metrics'

interface AdminKycPageProps {
	searchParams: Promise<{ days?: string }>
}

export default async function AdminKycPage({ searchParams }: AdminKycPageProps) {
	try {
		await requireComplianceAdmin('viewKycMetrics')
	} catch {
		redirect('/admin')
	}

	const params = await searchParams
	const parsedDays = Number(params.days)
	const sinceDays = parsedDays === 7 || parsedDays === 90 ? parsedDays : 30

	const [mode, metrics] = await Promise.all([
		Promise.resolve(getKycEnforcementMode()),
		getKycEnforcementMetrics(sinceDays),
	])

	return <AdminKycMetrics mode={mode} metrics={metrics} />
}
