'use client'

import { motion } from 'framer-motion'
import { Download, FileText } from 'lucide-react'

export interface Document {
	id: string
	title: string
	url: string
}

export interface ProjectDocumentsProps {
	title: string
	documents: Document[]
}

export function ProjectDocuments({
	title,
	documents,
}: ProjectDocumentsProps) {
	return (
		<div className="max-w-4xl mx-auto">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
			>
				<h1 className="text-3xl font-bold mb-6">{title}</h1>

				<div className="space-y-4">
					{documents.map((document, index) => (
						<motion.div
							key={document.id}
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.2, delay: index * 0.1 }}
						>
							<a
								href={document.url}
								download
								className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
							>
								<div className="flex items-center gap-3">
									<FileText className="h-5 w-5 text-muted-foreground" />
									<span className="font-medium">{document.title}</span>
								</div>
								<Download className="h-5 w-5 text-muted-foreground" />
							</a>
						</motion.div>
					))}
				</div>
			</motion.div>
		</div>
	)
}
