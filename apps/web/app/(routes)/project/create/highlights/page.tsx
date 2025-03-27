'use client'

import { useState } from 'react'
import { IoCheckmark, IoInformationCircleOutline } from 'react-icons/io5'
import { Button } from '~/components/base/button'
import { Card } from '~/components/base/card'
import { ExampleHighlights } from '~/components/sections/project/highlights/example-highlights'
import { ProjectHighlightCard } from '~/components/sections/project/highlights/project-highlight-card'
import { WritingTips } from '~/components/sections/project/highlights/writing-tips'
import { generateUniqueId } from '~/lib/utils/id'

interface Highlight {
	id: string
	title: string
	description: string
}

export function ProjectHighlights() {
	const [highlights, setHighlights] = useState<Highlight[]>([
		{ id: generateUniqueId('highlight-'), title: '', description: '' },
		{ id: generateUniqueId('highlight-'), title: '', description: '' },
	])

	const handleHighlightChange = (
		id: string,
		field: keyof Omit<Highlight, 'id'>,
		value: string,
	) => {
		setHighlights(
			highlights.map((h) => (h.id === id ? { ...h, [field]: value } : h)),
		)
	}

	const addHighlight = () => {
		setHighlights([
			...highlights,
			{
				id: generateUniqueId('highlight-'),
				title: '',
				description: '',
			},
		])
	}

	const removeHighlight = (id: string) => {
		setHighlights(highlights.filter((h) => h.id !== id))
	}

	const isValid =
		highlights.length >= 2 &&
		highlights.every((h) => h.title.trim() && h.description.trim())

	const handleSave = () => {
		if (!isValid) return
		// TODO: Add save logic here
		console.log('Saving highlights:', highlights)
	}

	return (
		<div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
			<div className="flex-1">
				<h1 className="text-4xl font-bold mb-4">Project Highlights</h1>
				<p className="text-[1.2rem] text-gray-600 mb-8">
					Add at least two key achievements or metrics that make your project
					stand out.
				</p>

				<Card className="p-6 shadow-lg bg-white border-none">
					<div className="space-y-6">
						<h2 className="text-2xl font-semibold">Highlights</h2>

						{highlights.map((highlight) => (
							<ProjectHighlightCard
								key={highlight.id}
								{...highlight}
								onChange={handleHighlightChange}
								showDelete={highlights.indexOf(highlight) >= 2}
								onDelete={() => removeHighlight(highlight.id)}
							/>
						))}

						<Button
							variant="outline"
							className="w-full border-gray-200 bg-white hover:text-primary"
							onClick={addHighlight}
						>
							+ Add Another Highlight
						</Button>

						<div className="flex flex-start gap-2 p-4 bg-white border border-gray-200 rounded-lg">
							<IoInformationCircleOutline className="text-black" size={20} />
							<div className="flex flex-col mt-[-4px]">
								<h4 className="font-medium">Reminder</h4>
								<p className="text-gray-700 text-[0.8rem]">
									You need at least two highlights before you can proceed. Make
									them count!
								</p>
							</div>
						</div>
					</div>
				</Card>

				<Button
					className="mt-8 w-full sm:w-auto text-white float-right"
					disabled={!isValid}
					onClick={handleSave}
					variant="secondary"
				>
					<IoCheckmark className="text-white" size={20} /> Save & Continue
				</Button>
			</div>

			<div className="lg:w-[400px] space-y-8 ">
				<ExampleHighlights />
				<WritingTips />
			</div>
		</div>
	)
}
