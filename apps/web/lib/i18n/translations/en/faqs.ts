export const faqs = {
			badge: 'Help Center',
			title1: 'Got Questions?',
			title2: 'We Have Answers',
			subtitle: 'Explore our FAQs to learn about KindFi.',
			searchPlaceholder: 'Search frequently asked questions...',
			searchAria: 'Search FAQs',
			viewInContext: 'View in full context',
			tabs: {
				platform: 'Platform',
				campaigns: 'Campaigns',
				donors: 'Donors',
				security: 'Security',
			},
			// Category titles/subtitles
			categories: {
				platform: {
					title: 'Platform FAQs',
					subtitle: 'General questions about KindFi',
				},
				campaigns: {
					title: 'Campaign FAQs',
					subtitle: 'Learn how to launch and manage campaigns',
				},
				donors: {
					title: 'Donor FAQs',
					subtitle: 'Everything you need to know about donating',
				},
				security: {
					title: 'Security & Verification',
					subtitle: 'How we keep your funds and data safe',
				},
			},
			support: {
				title: 'Still Have Questions?',
				description:
					"Can't find what you're looking for? Join our community for real-time support and discussions",
				seeHowItWorks: 'See How It Works',
				seeCommunity: 'See The Community',
				startCampaign: 'Start a Campaign',
			},
			// Item-level translations (fallback to mock data if not present)
			items: {
				'1': {
					q: 'What is KindFi, and how does it work?',
					a: 'KindFi is a Web3 crowdfunding platform for social impact causes. It uses blockchain and AI to ensure secure, transparent donations through milestone-based fund releases. Supporters can discover campaigns, donate using crypto, and track how funds are used.',
				},
				'2': {
					q: 'How does KindFi ensure transparency and trust?',
					a: 'KindFi integrates the Stellar blockchain and trustless escrow to record every donation on-chain. Funds are only released when project milestones are verified, ensuring total transparency and accountability.',
				},
				'3': {
					q: 'What makes KindFi different from traditional crowdfunding platforms?',
					a: 'KindFi eliminates intermediaries, reduces fees, and introduces blockchain-powered accountability. It offers gamified rewards, open-source development, and AI-driven campaign optimization—all with a focus on social good.',
				},
				'4': {
					q: 'Is KindFi open source? Can I contribute?',
					a: 'Yes! KindFi is an open-source project welcoming developers at all levels. You can contribute via structured GitHub issues, OnlyDust hackathons, and join our growing contributor community.',
				},
				'5': {
					q: 'Which blockchain does KindFi use, and why Stellar?',
					a: 'KindFi is powered by the Stellar blockchain for its low fees, fast transactions, and global accessibility. Stellar also supports our milestone-based escrow model to guarantee transparency.',
				},
				'6': {
					q: 'What is Trustless Work escrow, and how does it protect funds?',
					a: 'Trustless Work escrow is a blockchain-based system that holds donated funds securely until project milestones are met. It ensures that no funds are released without verified progress, reducing the risk of misuse.',
				},
				'7': {
					q: 'How do I start a fundraising campaign on KindFi?',
					a: 'To start a campaign, register on the platform, complete the onboarding course, and submit your project for AI review. Once approved, your campaign will be listed with milestone-based funding stages.',
				},
				'8': {
					q: 'What are the requirements to launch a project?',
					a: 'You need a verified identity (KYC), a well-defined cause, and milestone plans. Completion of the KindFi Academy onboarding ensures your project meets our transparency and impact criteria.',
				},
				'9': {
					q: 'How does the milestone-based escrow system work?',
					a: 'Funds are released in tranches as your project completes verified milestones. This model ensures progress, builds donor trust, and prevents misuse of donations.',
				},
				'10': {
					q: 'Can I receive funding in stages, or is it all at once?',
					a: 'Funding is released in stages. Each tranche is unlocked only after you provide evidence that the previous milestone has been completed and verified.',
				},
				'11': {
					q: 'What happens if my project doesn’t reach its funding goal?',
					a: 'If a project fails to reach its funding goal or complete milestones, unused funds remain in escrow. Refunds or reallocation are handled transparently, with options for donors to redirect their impact.',
				},
				'12': {
					q: 'Are there fees for creating a campaign?',
					a: 'KindFi charges minimal fees to sustain the platform, but they are significantly lower than traditional crowdfunding platforms thanks to blockchain efficiencies.',
				},
				'13': {
					q: 'How does KindFi verify and approve campaigns?',
					a: 'KindFi uses AI to review campaigns for legitimacy and clarity. Human moderation ensures alignment with social impact standards. Only verified projects are listed.',
				},
				'14': {
					q: 'How do I provide updates to my backers?',
					a: 'Project creators can post updates directly on their campaign page. Backers receive notifications and see progress towards each milestone.',
				},
				'15': {
					q: 'How do I donate to a campaign on KindFi?',
					a: 'Click on any active campaign, connect your wallet, and choose a donation tier. You can use supported cryptocurrencies to contribute directly.',
				},
				'16': {
					q: 'Which cryptocurrencies does KindFi accept?',
					a: 'KindFi currently supports donations in USDC and XLM, with plans to expand to additional Stellar-compatible and ERC-20 tokens.',
				},
				'17': {
					q: 'Why does KindFi use USDC and XLM for donations?',
					a: 'USDC provides price stability, while XLM ensures low-cost, fast transactions. Both are ideal for transparent, accessible global giving.',
				},
				'18': {
					q: 'Do I need a Stellar wallet to donate?',
					a: 'No. You can donate using any supported Web3 wallet. Stellar wallets are recommended for enhanced features like donation tracking and NFT rewards.',
				},
				'19': {
					q: 'How do I connect my wallet to KindFi?',
					a: 'Click "Connect Wallet" and follow the prompts to link your Metamask, Ledger, or any other compatible wallet. Stellar and Ethereum wallets are supported.',
				},
				'20': {
					q: 'Are there transaction fees when donating?',
					a: 'Yes, but they are minimal thanks to Stellar’s low-cost blockchain. KindFi does not charge additional fees on top of blockchain gas fees.',
				},
				'21': {
					q: 'Can I donate anonymously?',
					a: 'Yes. Verified users can choose to donate anonymously while still receiving NFT rewards and recognition inside their private profile.',
				},
				'22': {
					q: 'How do I track my donations on the blockchain?',
					a: 'Each transaction is recorded on-chain. You can view your donation history in your KindFi profile or verify it directly on the Stellar explorer.',
				},
				'23': {
					q: 'Can I get a refund if the project fails?',
					a: 'If milestones are not met, funds remain in escrow. Depending on your settings, donations can be refunded or redirected to other impactful projects through our yearly community vote.',
				},
				'24': {
					q: 'Is my donation secure?',
					a: 'Yes. Donations are secured in a blockchain-based escrow and only released when milestones are verified. The system is transparent and tamper-proof.',
				},
				'25': {
					q: 'How does KindFi ensure funds go to the right projects?',
					a: 'AI-powered project reviews, milestone-based escrow, and community verification all work together to ensure funds are allocated correctly and fairly.',
				},
				'26': {
					q: 'Are my transactions publicly visible on the blockchain?',
					a: 'Yes. All donations are transparently recorded on the Stellar blockchain and can be verified at any time.',
				},
				'27': {
					q: 'What happens if a project is flagged as fraudulent?',
					a: 'Flagged projects are paused and reviewed by our team. Funds in escrow remain locked until a final decision is made. If fraud is confirmed, refunds or redirection options are activated.',
				},
			},
}
