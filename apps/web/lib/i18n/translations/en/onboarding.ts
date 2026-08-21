export const onboarding = {
	progressLabel: 'Setup progress',
	roleTitle: 'How will you use KindFi?',
	roleDescription:
		"Choose the option that fits you best. You can't change this later — a role change would be a separate settings request.",
	roleDonorSummary: 'Discover causes and support them with Stellar donations.',
	roleDonorHighlights: [
		'Discover and browse campaigns',
		'Donate using Stellar wallets',
		'Track your donation history and impact',
		'Earn quests, streaks, referrals, and NFTs',
		'Vote in governance when eligible',
	],
	roleCreatorSummary: 'Create and manage donation campaigns for your projects.',
	roleCreatorHighlights: [
		'Create campaigns and submit them for KindFi review',
		'Manage content, teams, and milestones',
		'Create and manage foundations',
		'Work with admins on escrow setup',
		'Track funding progress and milestones',
	],
	roleSeparateSteps:
		'Campaign publication, identity verification (KYC), and wallet setup are separate steps after onboarding.',
	roleSaving: 'Saving your choice…',
	roleSaveError: 'Failed to save your role. Please try again.',
	back: 'Back',
	continue: 'Continue',
	saving: 'Saving…',
	saveRetry: 'Something went wrong. Please try again.',
	personalInfoTitle: 'Tell us about yourself',
	personalInfoDescription: 'This information appears on your public KindFi profile.',
	displayNameError: 'Enter a display name between 2 and 60 characters.',
	bioError: 'Enter a short bio between 10 and 500 characters.',
	confirmTitle: "You're all set",
	confirmDescriptionDonor:
		'Your donor profile is ready. Head to your dashboard to explore campaigns and start supporting causes.',
	confirmDescriptionCreator:
		'Your creator profile is ready. Head to your dashboard to create your first campaign.',
	confirmComplianceNote:
		'Completing onboarding does not verify your identity. You will still need to complete KYC before donating or publishing a campaign.',
	goToDashboard: 'Go to my dashboard',
	tour: {
		skip: 'Skip tour',
		next: 'Next',
		back: 'Back',
		finish: 'Finish tour',
		replay: 'Take the tour again',
		start: 'Take a quick tour',
		stepLabel: 'Step {current} of {total}',
	},
	tourDonor: {
		discoverTitle: 'Discover campaigns',
		discoverBody: 'Browse active campaigns and find causes that match what you care about.',
		openTitle: 'Open a campaign',
		openBody: 'Each campaign page shows its story, milestones, and funding progress.',
		donateTitle: 'Where donations begin',
		donateBody: 'Donations start from a campaign page using your connected Stellar wallet.',
		walletTitle: 'Your wallet',
		walletBody:
			'You need a Stellar wallet address (a G-address) to send donations. We show your wallet status here.',
		kycTitle: 'Identity verification',
		kycBody:
			'KYC verification is required before you can donate. It is handled separately, by Didit.',
		historyTitle: 'Donation history',
		historyBody: 'Track every donation you make and see your overall impact over time.',
		gamificationTitle: 'Quests and NFTs',
		gamificationBody:
			'Earn quests, streaks, referral rewards, and collectible NFTs as you participate.',
		governanceTitle: 'Governance',
		governanceBody: 'Eligible donors can vote on platform decisions through governance rounds.',
	},
	tourCreator: {
		createTitle: 'Create a campaign',
		createBody: 'Start a new campaign with your project details and funding goal.',
		manageTitle: 'Manage your campaign',
		manageBody: 'Update content, milestones, and your team from your campaign management area.',
		reviewTitle: 'Review and publication',
		reviewBody: 'Campaigns are reviewed by the KindFi team before they go live.',
		foundationTitle: 'Foundations',
		foundationBody:
			'Create and manage a foundation to organize multiple campaigns under one identity.',
		kycTitle: 'Identity verification',
		kycBody:
			'KYC verification is required before your campaign can be published. It is handled separately, by Didit.',
		walletTitle: 'Wallet and escrow',
		walletBody:
			'Campaign funds are held in a Trustless Work escrow contract. You will work with admins to set this up.',
		milestonesTitle: 'Milestones and updates',
		milestonesBody: 'Track milestone completion and post updates to keep your supporters informed.',
		gamificationTitle: 'Gamification and governance',
		gamificationBody: 'Creators can also take part in quests and governance where eligible.',
	},
}
