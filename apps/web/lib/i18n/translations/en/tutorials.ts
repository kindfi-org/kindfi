export const tutorials = {
	badge: 'Help Center',
	title: 'Tutorials &',
	titleHighlight: 'Guides',
	subtitle:
		'Step-by-step guides to help you get the most out of KindFi — from creating your account to managing campaigns and understanding how funds are released.',
	sections: {
		gettingStarted: 'Getting Started',
		campaigns: 'Campaigns',
		donations: 'Donations & Milestones',
	},
	cards: {
		register: {
			title: 'Register & Create an Account',
			description: 'Set up your KindFi account and get ready to support or launch campaigns.',
			steps: [
				'Go to kindfi.org and click Sign Up.',
				'Enter your email address and create a secure password.',
				'Verify your email using the link sent to your inbox.',
				'Complete passkey registration for added security.',
				'Fill in your profile details (name, bio, avatar).',
				'Your account is ready — explore projects or start a campaign.',
			],
		},
		createCampaign: {
			title: 'Create a Campaign',
			description: 'Launch a milestone-based crowdfunding campaign on the Stellar blockchain.',
			steps: [
				'Sign in and navigate to Create Campaign from the header.',
				'Choose a category and fill in your campaign title and description.',
				'Set your funding goal and target end date.',
				'Define at least one milestone with a clear deliverable and amount.',
				'Upload a cover image and any supporting media.',
				'Submit your campaign for AI-assisted review.',
				'Once approved, your campaign goes live and is visible to supporters.',
			],
		},
		milestones: {
			title: 'Complete & Submit Milestones',
			description: 'Provide evidence of progress to unlock the next tranche of funds.',
			steps: [
				'Open your campaign dashboard and select the active milestone.',
				'Click Submit Evidence and upload proof of completion (docs, photos, links).',
				'Add a written update describing what was accomplished.',
				'Submit the milestone for review.',
				'The KindFi team or community validators will verify your submission.',
				'Once approved, the milestone funds are released to your wallet.',
			],
		},
		readyForReview: {
			title: 'Mark Project as Ready for Review',
			description: 'Signal that your project is complete and ready for final evaluation.',
			steps: [
				'Ensure all milestones have been submitted and verified.',
				'Open your campaign dashboard and click Mark as Ready for Review.',
				'Add a final summary update for your backers.',
				'The platform team will schedule a final review.',
				'Once approved, the project is marked complete and remaining funds released.',
			],
		},
		donationFlow: {
			title: 'Understand the Donation & Milestone Flow',
			description: 'Learn how funds move from donor to campaign creator through trustless escrow.',
			steps: [
				'A donor finds a campaign and clicks Donate.',
				'Funds are transferred to a Trustless Work escrow contract on Stellar.',
				'The campaign creator completes a milestone and submits evidence.',
				'Validators review and approve the milestone submission.',
				'The approved amount is released from escrow to the campaign creator.',
				'Donors can track every step on-chain via the campaign dashboard.',
				'If a milestone is rejected, funds remain locked until resubmission or refund.',
			],
		},
		createFoundation: {
			title: 'Create a Foundation',
			description:
				'Set up an organizational entity to manage multiple campaigns under one umbrella.',
			steps: [
				'Sign in and navigate to Create Foundation from the header menu.',
				'Provide your foundation name, mission statement, and category.',
				'Upload a logo and fill in contact details.',
				'Submit for verification — the KindFi team reviews your application.',
				'Once verified, you can link campaigns to your foundation profile.',
				'Your foundation page becomes a hub for all related initiatives.',
			],
		},
	},
	cta: {
		title: 'Still Have Questions?',
		subtitle: 'Check our FAQs for quick answers or join the community for real-time support.',
		faqs: 'Browse FAQs',
		community: 'Join the Community',
	},
}
