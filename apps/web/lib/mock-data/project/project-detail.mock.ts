import type { ProjectDetail } from '~/lib/types/project/project-detail.types'
import { categories } from './categories.mock'

export const projectDetail: ProjectDetail = {
	id: '1',
	title: 'Empowering Education',
	description:
		'Support education programs for children in low-income areas. Together, we can bridge the education gap and create opportunities for all children regardless of their background.',
	story: `# Empowering Education: A Vision for Equal Opportunity

Our mission is to bridge the education gap in low-income communities by providing quality educational resources, technology, and mentorship programs.

## The Problem

In many underserved communities, schools lack basic resources, qualified teachers, and modern technology. This creates a cycle of educational inequality that affects generations.

## Our Solution

We're implementing a three-pronged approach:

1. **Resource Distribution**: Providing books, supplies, and learning materials to schools in need.
2. **Technology Access**: Setting up computer labs and internet connectivity in schools.
3. **Mentorship Programs**: Connecting students with professionals who can guide their educational journey.

## Impact

With your support, we aim to reach 50 schools and impact over 10,000 students in the first year. Each investment directly contributes to a child's future.

Join us in creating a world where every child has access to quality education.`,
	image: '/images/education.webp',
	category: categories.find((c) => c.id === '7') ?? categories[0],
	goal: 55000,
	raised: 40000,
	investors: 40,
	minInvestment: 10,
	tags: [
		{ id: 'tag-education', name: 'EDUCATION', color: '#4A90E2' },
		{ id: 'tag-children', name: 'CHILDREN', color: '#9B59B6' },
		{ id: 'tag-future', name: 'FUTURE', color: '#03A9F4' },
	],
	owner: {
		id: 'owner1',
		name: 'Sarah Johnson',
		avatar: '/images/sarah-johnson.webp',
		bio: 'Education advocate with 10+ years of experience in developing programs for underserved communities.',
	},
	pitchVideo: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
	pitchFiles: [
		{
			id: 'file1',
			name: 'Empowering Education Presentation',
			type: 'pdf',
			url: '#',
			size: 2500000,
		},
		{
			id: 'file2',
			name: 'Budget Breakdown',
			type: 'pptx',
			url: '#',
			size: 1800000,
		},
		{
			id: 'file3',
			name: 'Implementation Timeline',
			type: 'pdf',
			url: '#',
			size: 1200000,
		},
	],
	team: [
		{
			id: 'team1',
			name: 'Sarah Johnson',
			avatar: '/images/sarah-johnson.webp',
			role: 'Project Lead',
			bio: 'Education advocate with 10+ years of experience developing programs for underserved communities. Sarah oversees all aspects of the project and maintains relationships with school administrators and community leaders.',
			isAdmin: true,
			isEditor: true,
		},
		{
			id: 'team2',
			name: 'Michael Chen',
			avatar: '/images/michael-chen.webp',
			role: 'Education Specialist',
			bio: 'Former teacher with a PhD in Education Policy. Michael designs curriculum materials and training programs for teachers, ensuring our educational resources meet the highest standards.',
			isAdmin: false,
			isEditor: true,
		},
		{
			id: 'team3',
			name: 'Aisha Patel',
			avatar: '/images/aisha-patel.webp',
			role: 'Community Outreach',
			bio: 'Community organizer with deep connections in underserved neighborhoods. Aisha builds relationships with families and community organizations to ensure our programs address real needs.',
			isAdmin: false,
			isEditor: true,
		},
		{
			id: 'team4',
			name: 'David Rodriguez',
			avatar: '/images/david-rodriguez.webp',
			role: 'Technology Coordinator',
			bio: 'IT specialist with expertise in educational technology. David manages the implementation of computer labs, internet connectivity, and digital learning tools in partner schools.',
			isAdmin: false,
			isEditor: false,
		},
	],
	milestones: [
		{
			id: 'milestone1',
			title: 'Initial Resource Distribution',
			description:
				'Distribute books and supplies to the first 10 schools in the program.',
			amount: 10000,
			deadline: '2023-12-31',
			status: 'completed',
			index: 0,
		},
		{
			id: 'milestone2',
			title: 'Technology Implementation',
			description:
				'Set up computer labs in 15 schools and provide internet connectivity.',
			amount: 25000,
			deadline: '2024-03-31',
			status: 'approved',
			index: 1,
		},
		{
			id: 'milestone3',
			title: 'Mentorship Program Launch',
			description:
				'Launch mentorship program connecting students with professionals.',
			amount: 15000,
			deadline: '2024-06-30',
			status: 'pending',
			index: 2,
		},
		{
			id: 'milestone4',
			title: 'Program Evaluation',
			description:
				'Conduct comprehensive evaluation of program impact and effectiveness.',
			amount: 5000,
			deadline: '2024-09-30',
			status: 'disputed',
			index: 3,
		},
	],
	updates: [
		{
			id: 'update1',
			title: 'First Milestone Completed!',
			content:
				"We're excited to announce that we've completed our first milestone! We've distributed books and supplies to 10 schools, reaching over 2,000 students. Thank you for your support!",
			author: {
				id: 'owner1',
				name: 'Sarah Johnson',
				avatar: '/images/sarah-johnson.webp',
			},
			date: '2023-12-15',
			comments: [
				{
					id: 'comment1',
					content: 'This is amazing! So happy to see the progress.',
					author: {
						id: 'user1',
						name: 'John Doe',
						avatar: '/thoughtful-man.png',
					},
					date: '2023-12-15',
					reactions: {
						like: 5,
						heart: 3,
						celebrate: 2,
					},
				},
				{
					id: 'comment2',
					content:
						'How many more schools are you planning to reach in the next phase?',
					author: {
						id: 'user2',
						name: 'Jane Smith',
						avatar: '/diverse-woman-portrait.png',
					},
					date: '2023-12-16',
					type: 'question',
					reactions: {
						like: 2,
						heart: 0,
						celebrate: 0,
					},
				},
				{
					id: 'comment3',
					content:
						"We're planning to reach 15 more schools in the next phase, focusing on technology implementation.",
					author: {
						id: 'owner1',
						name: 'Sarah Johnson',
						avatar: '/images/sarah-johnson.webp',
					},
					date: '2023-12-16',
					type: 'answer',
					parentId: 'comment2',
					reactions: {
						like: 3,
						heart: 1,
						celebrate: 0,
					},
				},
			],
		},
		{
			id: 'update2',
			title: 'Technology Implementation Underway',
			content:
				"We've started setting up computer labs in the first 5 schools. The students are excited to have access to technology for the first time!",
			author: {
				id: 'team4',
				name: 'David Rodriguez',
				avatar: '/images/david-rodriguez.webp',
			},
			date: '2024-02-10',
			comments: [],
		},
	],
	comments: [
		{
			id: 'generalComment1',
			content:
				'This project is exactly what our community needs. Thank you for your work!',
			author: {
				id: 'user3',
				name: 'Maria Garcia',
				avatar: '/confident-latina-woman.png',
			},
			date: '2023-11-20',
			reactions: {
				like: 8,
				heart: 5,
				celebrate: 3,
			},
		},
		{
			id: 'generalComment2',
			content:
				"I'm interested in volunteering. Is there a way to get involved beyond investing?",
			author: {
				id: 'user4',
				name: 'Robert Kim',
				avatar: '/images/michael-chen.webp',
			},
			date: '2023-11-25',
			type: 'question',
			reactions: {
				like: 4,
				heart: 0,
				celebrate: 0,
			},
		},
		{
			id: 'generalComment3',
			content:
				"We're always looking for volunteers. Please send an email to volunteer@empoweringeducation.org with your interests and availability.",
			author: {
				id: 'team3',
				name: 'Aisha Patel',
				avatar: '/images/aisha-patel.webp',
			},
			date: '2023-11-26',
			type: 'answer',
			parentId: 'generalComment2',
			reactions: {
				like: 3,
				heart: 2,
				celebrate: 0,
			},
		},
	],
	createdAt: '2023-10-15',
}
