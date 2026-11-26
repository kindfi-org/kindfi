import type { ProductTourAdapter, ProductTourRole, ProductTourStep } from './types'

const donorSteps: ProductTourStep[] = [
	{
		id: 'welcome',
		targetSelector: '[data-tour-id="profile-header"]',
		titleKey: 'onboarding.tourDonor.discoverTitle',
		bodyKey: 'onboarding.tourDonor.discoverBody',
	},
	{
		id: 'wallet',
		targetSelector: '[data-tour-id="wallet-card"]',
		titleKey: 'onboarding.tourDonor.walletTitle',
		bodyKey: 'onboarding.tourDonor.walletBody',
	},
	{
		id: 'kyc',
		targetSelector: '[data-tour-id="kyc-card"]',
		titleKey: 'onboarding.tourDonor.kycTitle',
		bodyKey: 'onboarding.tourDonor.kycBody',
	},
	{
		id: 'governance',
		targetSelector: '[data-tour-id="governance-card"]',
		titleKey: 'onboarding.tourDonor.governanceTitle',
		bodyKey: 'onboarding.tourDonor.governanceBody',
	},
	{
		id: 'tabs',
		targetSelector: '[data-tour-id="profile-tabs"]',
		titleKey: 'onboarding.tourDonor.historyTitle',
		bodyKey: 'onboarding.tourDonor.historyBody',
	},
]

const creatorSteps: ProductTourStep[] = [
	{
		id: 'welcome',
		targetSelector: '[data-tour-id="profile-header"]',
		titleKey: 'onboarding.tourCreator.createTitle',
		bodyKey: 'onboarding.tourCreator.createBody',
	},
	{
		id: 'wallet',
		targetSelector: '[data-tour-id="wallet-card"]',
		titleKey: 'onboarding.tourCreator.walletTitle',
		bodyKey: 'onboarding.tourCreator.walletBody',
	},
	{
		id: 'kyc',
		targetSelector: '[data-tour-id="kyc-card"]',
		titleKey: 'onboarding.tourCreator.kycTitle',
		bodyKey: 'onboarding.tourCreator.kycBody',
	},
	{
		id: 'governance',
		targetSelector: '[data-tour-id="governance-card"]',
		titleKey: 'onboarding.tourCreator.gamificationTitle',
		bodyKey: 'onboarding.tourCreator.gamificationBody',
	},
	{
		id: 'tabs',
		targetSelector: '[data-tour-id="profile-tabs"]',
		titleKey: 'onboarding.tourCreator.manageTitle',
		bodyKey: 'onboarding.tourCreator.manageBody',
	},
]

/**
 * Local abstraction over the tour implementation. Feature components depend
 * on this adapter, not on any vendor tour library — see PR notes for why a
 * minimal custom tour was chosen over a third-party library.
 */
export const defaultProductTourAdapter: ProductTourAdapter = {
	getSteps(role: ProductTourRole) {
		return role === 'creator' ? creatorSteps : donorSteps
	},
}
