import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { AchievementCard } from '~/components/sections/achievements/achievement-card'

function render(status: 'completed' | 'in-progress' | 'locked', progressPercentage = 50) {
	return renderToStaticMarkup(
		<AchievementCard
			title="Community builder"
			description="Support five projects"
			status={status}
			icon="trophy"
			progressPercentage={progressPercentage}
			onClick={() => {}}
		/>,
	)
}

describe('AchievementCard accessibility', () => {
	test('available cards use a named native button with visible keyboard focus', () => {
		for (const status of ['completed', 'in-progress'] as const) {
			const html = render(status)
			const button = html.match(/<button[^>]*>/)?.[0] ?? ''
			expect(button).toContain('type="button"')
			expect(button).not.toContain('disabled=""')
			expect(button).toContain('focus-visible:ring-2')
			const titleId = button.match(/aria-labelledby="([^"]+)"/)?.[1]
			const descriptionId = button.match(/aria-describedby="([^"]+)"/)?.[1]
			expect(titleId).toBeDefined()
			expect(descriptionId).toBeDefined()
			expect(html).toContain(`<h3 id="${titleId}"`)
			expect(html).toContain(`<p id="${descriptionId}"`)
		}
	})

	test('locked cards expose native disabled state', () => {
		const button = render('locked').match(/<button[^>]*>/)?.[0] ?? ''
		expect(button).toContain('disabled=""')
	})

	test('progress remains outside the button and retains clamped values', () => {
		for (const [input, expected] of [
			[-10, 0],
			[50, 50],
			[120, 100],
		]) {
			const html = render('in-progress', input)
			expect(html).toContain(`aria-valuenow="${expected}"`)
			expect(html).toContain('aria-valuemin="0"')
			expect(html).toContain('aria-valuemax="100"')
			expect(html.indexOf('</button>')).toBeLessThan(html.indexOf('role="progressbar"'))
		}
	})

	test('multiple cards have distinct accessible label IDs', () => {
		const html = renderToStaticMarkup(
			<>
				<AchievementCard
					title="First"
					description="One"
					status="completed"
					icon="star"
					onClick={() => {}}
				/>
				<AchievementCard
					title="Second"
					description="Two"
					status="locked"
					icon="heart"
					onClick={() => {}}
				/>
			</>,
		)
		const labels = [...html.matchAll(/aria-labelledby="([^"]+)"/g)].map((match) => match[1])
		expect(labels).toHaveLength(2)
		expect(new Set(labels).size).toBe(2)
	})
})
