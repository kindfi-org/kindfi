'use client'

import type React from 'react'

import { motion } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

export interface InvestmentSection {
	id: string
	title: string
	content: React.ReactNode
}

export interface InvestmentDetailsProps {
	title: string
	sections: InvestmentSection[]
}

export function InvestmentDetails({ title, sections }: InvestmentDetailsProps) {
	const [openSections, setOpenSections] = useState<string[]>([])

	const toggleSection = (id: string) => {
		setOpenSections((prev) =>
			prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
		)
	}

	return (
		<div className="max-w-4xl mx-auto">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
			>
				<h1 className="text-3xl font-bold mb-8">{title}</h1>

				<div className="border rounded-md overflow-hidden">
					{sections.map((section) => {
						const isOpen = openSections.includes(section.id)

						return (
							<div key={section.id}>
								<div className="h-px bg-border" />
								<div className="flex flex-col">
									<button
										type="button"
										onClick={() => toggleSection(section.id)}
										className="flex items-center justify-between w-full p-4 text-left font-semibold hover:bg-muted/50 transition-colors"
									>
										<span>{section.title}</span>
										{isOpen ? (
											<ChevronUp className="h-5 w-5 text-muted-foreground" />
										) : (
											<ChevronDown className="h-5 w-5 text-muted-foreground" />
										)}
									</button>

									{isOpen && (
										<motion.div
											initial={{ height: 0, opacity: 0 }}
											animate={{ height: 'auto', opacity: 1 }}
											exit={{ height: 0, opacity: 0 }}
											transition={{ duration: 0.2 }}
											className="px-4 pb-4"
										>
											{section.content}
										</motion.div>
									)}
								</div>
							</div>
						)
					})}
				</div>
			</motion.div>
		</div>
	)
}
