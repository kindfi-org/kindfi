import type { Lesson } from '~/lib/types/learn/lesson.types'

export const stellarConsensusLesson: Lesson = {
	metadata: {
		title: 'Consensus Mechanism',
		subtitle: 'Understand how the Stellar Consensus Protocol works.',
		readTime: 20,
		level: 'Intermediate',
		xpEarned: 100,
		lessonNumber: 3,
		totalLessons: 4,
		progress: 50,
		moduleId: 1,
		lessonId: 3,
		previousLesson: {
			title: 'Introduction to Stellar',
			moduleId: 1,
			lessonId: 2,
		},
		nextLesson: {
			title: 'Asset Issuance',
			moduleId: 1,
			lessonId: 4,
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
				'Proof of Work',
				'Proof of Stake',
				'Federated Byzantine Agreement',
				'Delegated Proof of Stake',
			],
			correctAnswer: 2,
			explanation:
				'Stellar uses a Federated Byzantine Agreement system for consensus.',
		},
		{
			id: 2,
			question: 'What is a key advantage of the Stellar Consensus Protocol?',
			options: [
				'It requires mining',
				'It confirms transactions in seconds',
				'It uses more energy than Bitcoin',
				'It requires all nodes to trust each other',
			],
			correctAnswer: 1,
			explanation:
				'SCP achieves low latency and confirms transactions quickly.',
		},
		{
			id: 3,
			question: "What is a 'quorum slice' in SCP?",
			options: [
				'A piece of the blockchain',
				'A group of miners',
				'A subset of trusted nodes',
				'A transaction fee',
			],
			correctAnswer: 2,
			explanation:
				'A quorum slice is a subset of nodes that a participant trusts.',
		},
	],
}
