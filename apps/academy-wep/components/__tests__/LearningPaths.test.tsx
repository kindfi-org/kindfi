import './setupTests'

import { afterEach, expect, mock, test } from 'bun:test'
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from '@testing-library/react'
import { useRouter } from 'next/navigation'
import type { LearningPathCardProps } from '../learningpaths/LearningPathCard'
import LearningPaths from '../learningpaths/LearningPaths'

mock.module('next/navigation', () => ({
	useRouter: () => ({
		push: mock(() => {}),
	}),
}))

mock.module('../learningpaths/LearningPathCard', () => ({
	LearningPathsCard: (props: LearningPathCardProps) => (
		<div data-testid="mock-learning-path">
			<h3>{props.title}</h3>
			<p>{props.description}</p>
		</div>
	),
}))

mock.module('../learningpaths/LoadingCard', () => ({
	default: () => <div data-testid="loading-card">Loading...</div>,
}))

afterEach(() => {
	cleanup()
})

test('renders loading state initially', async () => {
	render(<LearningPaths />)
	const loadingCards = screen.getAllByTestId('loading-card')
	expect(loadingCards.length).toBeGreaterThan(0)
})

test('renders learning cards after loading', async () => {
	render(<LearningPaths />)

	await waitFor(() => {
		expect(screen.getByText('Blockchain Fundamentals')).toBeTruthy()
		expect(screen.getByText('Impact Crowdfunding')).toBeTruthy()
	})
})

test("clicking 'View All Paths' navigates to /learn", async () => {
	const router = useRouter()
	render(<LearningPaths />)

	const button = screen.getByRole('button', { name: /view all paths/i })
	fireEvent.click(button)

	expect(router.push).toHaveBeenCalledWith('/learn')
})

test('renders error fallback UI if LearningPathsCard throws', async () => {
	mock.module('../learningpaths/LearningPathCard', () => {
		throw new Error('Test Error')
	})

	// Dynamic import to apply new mock
	const { default: ErrorComponent } = await import(
		'../learningpaths/LearningPaths'
	)

	render(<ErrorComponent />)

	await waitFor(() => {
		expect(screen.getByRole('alert')).toBeTruthy()
		expect(screen.getByText(/something went wrong/i)).toBeTruthy()
		expect(screen.getByText(/test error/i)).toBeTruthy()
	})
})
