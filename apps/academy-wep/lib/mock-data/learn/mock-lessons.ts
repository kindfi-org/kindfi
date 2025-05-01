import type { Lesson } from '~/lib/types/learn/lesson.types'

export const moduleLessons: Lesson[] = [
	{
		metadata: {
			title: 'Introduction to Stellar',
			subtitle: 'Discover the foundation of the Stellar network.',
			readTime: 10,
			level: 'Beginner',
			xpEarned: 50,
			lessonNumber: 1,
			totalLessons: 4,
			progress: 100,
			moduleId: 1,
			lessonId: 1,
			nextLesson: {
				title: 'Consensus Mechanism',
				moduleId: 1,
				lessonId: 2,
			},
		},
		content: {
			title: 'Introduction to Stellar',
			content: [
				{
					id: 'p1',
					type: 'paragraph',
					content:
						'Stellar is a decentralized network designed to facilitate cross-border transactions efficiently and securely. It bridges traditional finance with blockchain technology.',
				},
			],
		},
		quiz: [
			{
				id: 1,
				question: 'What is the primary purpose of Stellar?',
				options: [
					{ id: 'q1-o1', text: 'To mine Bitcoin' },
					{ id: 'q1-o2', text: 'To facilitate cross-border payments' },
					{ id: 'q1-o3', text: 'To provide cloud storage' },
					{ id: 'q1-o4', text: 'To host smart contracts' },
				],
				correctAnswer: 1,
				explanation:
					'Stellar focuses on fast, low-cost cross-border transactions.',
			},
			{
				id: 2,
				question: 'Stellar connects financial systems by using:',
				options: [
					{ id: 'q2-o1', text: 'Anchors' },
					{ id: 'q2-o2', text: 'Validators' },
					{ id: 'q2-o3', text: 'Sharding' },
					{ id: 'q2-o4', text: 'Mining Pools' },
				],
				correctAnswer: 0,
				explanation:
					'Anchors are trusted entities that issue assets and connect real-world currencies to Stellar.',
			},
		],
	},
	{
		metadata: {
			title: 'Consensus Mechanism',
			subtitle: 'Understand how the Stellar Consensus Protocol works.',
			readTime: 20,
			level: 'Intermediate',
			xpEarned: 100,
			lessonNumber: 2,
			totalLessons: 4,
			progress: 100,
			moduleId: 1,
			lessonId: 2,
			previousLesson: {
				title: 'Introduction to Stellar',
				moduleId: 1,
				lessonId: 1,
			},
			nextLesson: {
				title: 'Asset Issuance',
				moduleId: 1,
				lessonId: 3,
			},
		},
		content: {
			title: 'The Stellar Consensus Protocol (SCP)',
			content: [
				{
					id: 'p1',
					type: 'paragraph',
					content:
						'The Stellar Consensus Protocol (SCP) is the underlying consensus mechanism that powers the Stellar network. Unlike proof-of-work systems like Bitcoin, SCP uses a federated Byzantine agreement system that allows for fast, efficient, and environmentally friendly consensus.',
				},
				{
					id: 's1',
					type: 'subheading',
					content: 'Key Features of SCP',
				},
				{
					id: 'b1',
					type: 'bulletList',
					items: [
						{
							id: 'b1-i1',
							title: 'Decentralized Control:',
							description: 'No central authority dictates consensus.',
						},
						{
							id: 'b1-i2',
							title: 'Low Latency:',
							description:
								'Transactions confirm in seconds, not minutes or hours.',
						},
						{
							id: 'b1-i3',
							title: 'Flexible Trust:',
							description: 'Users can choose which participants to trust.',
						},
						{
							id: 'b1-i4',
							title: 'Asymptotic Security:',
							description:
								'Safety is optimal against an adversary with less than a threshold of the network.',
						},
					],
				},
				{
					id: 's2',
					type: 'subheading',
					content: 'How SCP Works',
				},
				{
					id: 'p2',
					type: 'paragraph',
					content:
						'SCP uses a concept called "quorum slices" where each node selects which other nodes it trusts. When enough trusted nodes agree on a transaction, it becomes part of the ledger.',
				},
				{
					id: 'p3',
					type: 'paragraph',
					content:
						'This approach allows the network to reach consensus without requiring all participants to trust each other, making it more resilient and flexible than traditional consensus mechanisms.',
				},
			],
		},
		quiz: [
			{
				id: 1,
				question: 'What type of consensus mechanism does Stellar use?',
				options: [
					{ id: 'q1-o1', text: 'Proof of Work' },
					{ id: 'q1-o2', text: 'Proof of Stake' },
					{ id: 'q1-o3', text: 'Federated Byzantine Agreement' },
					{ id: 'q1-o4', text: 'Delegated Proof of Stake' },
				],
				correctAnswer: 2,
				explanation:
					'Stellar uses a Federated Byzantine Agreement system for consensus.',
			},
			{
				id: 2,
				question: 'What is a key advantage of the Stellar Consensus Protocol?',
				options: [
					{ id: 'q2-o1', text: 'It requires mining' },
					{ id: 'q2-o2', text: 'It confirms transactions in seconds' },
					{ id: 'q2-o3', text: 'It uses more energy than Bitcoin' },
					{ id: 'q2-o4', text: 'It requires all nodes to trust each other' },
				],
				correctAnswer: 1,
				explanation:
					'SCP achieves low latency and confirms transactions quickly.',
			},
			{
				id: 3,
				question: "What is a 'quorum slice' in SCP?",
				options: [
					{ id: 'q3-o1', text: 'A piece of the blockchain' },
					{ id: 'q3-o2', text: 'A group of miners' },
					{ id: 'q3-o3', text: 'A subset of trusted nodes' },
					{ id: 'q3-o4', text: 'A transaction fee' },
				],
				correctAnswer: 2,
				explanation:
					'A quorum slice is a subset of nodes that a participant trusts.',
			},
		],
	},
	{
		metadata: {
			title: 'Asset Issuance',
			subtitle: 'Learn how to issue and manage assets on Stellar.',
			readTime: 15,
			level: 'Intermediate',
			xpEarned: 80,
			lessonNumber: 3,
			totalLessons: 4,
			progress: 0,
			moduleId: 1,
			lessonId: 3,
			previousLesson: {
				title: 'Consensus Mechanism',
				moduleId: 1,
				lessonId: 2,
			},
			nextLesson: {
				title: 'Stellar Ecosystem',
				moduleId: 1,
				lessonId: 4,
			},
		},
		content: {
			title: 'Asset Issuance on Stellar',
			content: [
				{
					id: 'p1',
					type: 'paragraph',
					content:
						'Issuing assets on Stellar is straightforward. Organizations can represent real-world currencies or create custom tokens easily on the network.',
				},
			],
		},
		quiz: [
			{
				id: 5,
				question: 'Which tool allows you to issue assets on Stellar?',
				options: [
					{ id: 'q5-o1', text: 'Anchors' },
					{ id: 'q5-o2', text: 'Issuing Account' },
					{ id: 'q5-o3', text: 'Validators' },
					{ id: 'q5-o4', text: 'Mining Nodes' },
				],
				correctAnswer: 1,
				explanation:
					'An issuing account is responsible for creating new assets on Stellar.',
			},
			{
				id: 6,
				question: 'After issuing an asset, you can:',
				options: [
					{ id: 'q6-o1', text: 'Sell it, trade it, or destroy it' },
					{ id: 'q6-o2', text: 'Only mine it' },
					{ id: 'q6-o3', text: 'Only send it to validators' },
					{ id: 'q6-o4', text: 'Convert it into Bitcoin' },
				],
				correctAnswer: 0,
				explanation:
					'Issued assets can be traded, sold, or destroyed by the asset issuer.',
			},
		],
	},
	{
		metadata: {
			title: 'Stellar Ecosystem',
			subtitle: 'Explore the broader Stellar community and its applications.',
			readTime: 12,
			level: 'Intermediate',
			xpEarned: 70,
			lessonNumber: 4,
			totalLessons: 4,
			progress: 0,
			moduleId: 1,
			lessonId: 4,
			previousLesson: {
				title: 'Asset Issuance',
				moduleId: 1,
				lessonId: 3,
			},
		},
		content: {
			title: 'Stellar Ecosystem Overview',
			content: [
				{
					id: 'p1',
					type: 'paragraph',
					content:
						'Stellar is home to a growing ecosystem of applications, anchors, exchanges, and wallets supporting global financial inclusion.',
				},
			],
		},
		quiz: [
			{
				id: 7,
				question: 'What does an Anchor do in the Stellar network?',
				options: [
					{ id: 'q7-o1', text: 'Mine Stellar Lumens' },
					{
						id: 'q7-o2',
						text: 'Issue assets and connect to real-world currencies',
					},
					{ id: 'q7-o3', text: 'Validate transactions only' },
					{ id: 'q7-o4', text: 'Create NFTs' },
				],
				correctAnswer: 1,
				explanation:
					'Anchors are critical to connecting Stellar to traditional financial systems.',
			},
			{
				id: 8,
				question:
					'Which of the following is NOT typically part of the Stellar ecosystem?',
				options: [
					{ id: 'q8-o1', text: 'Wallets' },
					{ id: 'q8-o2', text: 'Exchanges' },
					{ id: 'q8-o3', text: 'DeFi Protocols' },
					{ id: 'q8-o4', text: 'Mining Rigs' },
				],
				correctAnswer: 3,
				explanation:
					'Stellar does not use mining rigs because it does not rely on Proof of Work.',
			},
		],
	},
]
