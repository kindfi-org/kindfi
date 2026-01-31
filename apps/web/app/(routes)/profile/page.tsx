import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import { createSupabaseServerClient } from '@packages/lib/supabase-server'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { ProfileDashboard } from '~/components/sections/profile/profile-dashboard'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { mapDiditStatusToKYC } from '~/lib/services/didit'

interface ProfilePageProps {
	searchParams: Promise<{
		kyc?: string
		verificationSessionId?: string
		status?: string
	}>
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
	const session = await getServerSession(nextAuthOption)
	console.log('📝 ProfilePage session:', session)
	if (!session?.user) {
		redirect('/sign-in')
	}

	const params = await searchParams
	const kycCompleted = params.kyc === 'completed'

	// If we have callback parameters, update the KYC status directly
	if (params.verificationSessionId && params.status && kycCompleted) {
		const kycStatus = mapDiditStatusToKYC(params.status)
		// Find and update the KYC record
		// Try multiple strategies to find the record:
		// 1. First try to find by session ID in notes
		// 2. If not found, get the most recent record for this user
		let kycRecord = null

		const { data: kycRecordsBySession } = await supabaseServiceRole
			.from('kyc_reviews')
			.select('id, notes')
			.eq('user_id', session.user.id)
			.like('notes', `%${params.verificationSessionId}%`)
			.order('created_at', { ascending: false })
			.limit(1)

		if (kycRecordsBySession && kycRecordsBySession.length > 0) {
			kycRecord = kycRecordsBySession[0]
			console.log('✅ Found KYC record by session ID:', kycRecord.id)
		} else {
			// Fallback: get the most recent KYC record for this user
			const { data: kycRecordsRecent } = await supabaseServiceRole
				.from('kyc_reviews')
				.select('id, notes')
				.eq('user_id', session.user.id)
				.order('created_at', { ascending: false })
				.limit(1)

			if (kycRecordsRecent && kycRecordsRecent.length > 0) {
				kycRecord = kycRecordsRecent[0]
				console.log('✅ Found KYC record by most recent:', kycRecord.id)
			} else {
				console.log('⚠️ No KYC record found for user:', session.user.id)
			}
		}

		if (kycRecord) {
			const notes =
				typeof kycRecord.notes === 'string'
					? JSON.parse(kycRecord.notes)
					: kycRecord.notes || {}

			const updateResult = await supabaseServiceRole
				.from('kyc_reviews')
				.update({
					status: kycStatus,
					notes: JSON.stringify({
						...notes,
						diditSessionId: params.verificationSessionId,
						diditStatus: params.status,
						callbackReceived: new Date().toISOString(),
					}),
					updated_at: new Date().toISOString(),
				})
				.eq('id', kycRecord.id)
				.select()

			if (updateResult.error) {
				console.error(' Failed to update KYC record:', updateResult.error)
			} else {
				console.log(' Successfully updated KYC status to:', kycStatus)
			}
		} else {
			// Create a new record if none exists

			console.log('Creating new KYC record with status:', kycStatus)
			await supabaseServiceRole.from('kyc_reviews').insert({
				user_id: session.user.id,
				status: kycStatus,
				verification_level: 'enhanced',
				notes: JSON.stringify({
					diditSessionId: params.verificationSessionId,
					diditStatus: params.status,
					callbackReceived: new Date().toISOString(),
				}),
			})
		}
	}

	const supabase = await createSupabaseServerClient()
	const { data: profileData, error } = await supabase
		.from('profiles')
		.select('role, display_name, bio, image_url, slug, created_at')
		.eq('id', session.user.id)
		.single()

	if (error || !profileData) {
		console.error('⚠️ ProfilePage profile fetch error:', error)
		console.log('📝 ProfilePage profile data:', profileData)
		redirect('/sign-in')
	}

	return (
		<ProfileDashboard
			user={{
				id: session.user.id,
				email: session.user.email || '',
				created_at: profileData.created_at,
				profile: profileData,
			}}
			smartAccountAddress={
				session.device?.address || session.user.device?.address || null
			}
			kycCompleted={kycCompleted}
		/>
	)
}
