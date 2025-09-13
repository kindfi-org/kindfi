// biome-ignore assist/source/organizeImports: false
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { ReactNode } from 'react'
// import { Navigation } from './Navigation'

interface HomeProps {
	message: string | ReactNode
	currentPath?: string
}

// Get the client filename from the manifest
function getClientFilename(): string {
	try {
		const manifestPath = join(process.cwd(), 'public', 'manifest.json')
		if (existsSync(manifestPath)) {
			const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'))
			return manifest.clientJs || 'client.js'
		}
	} catch (error) {
		console.error('Error reading manifest:', error)
	}
	return 'client.js'
}

export default function Home({ message }: HomeProps) {
	// Get the client filename
	const clientJs = getClientFilename()

	return (
		<html lang="en">
			<head>
				<title>Kindfi KYC Server</title>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="stylesheet" href="/client.css" />
				<script type="module" src={`/${clientJs}`} defer />
			</head>
			<body>
				{/* <h1>Kindfi KYC Server HOM</h1> */}

				{/** biome-ignore lint/correctness/useUniqueElementIds: root element */}
				<div id="root">
					{/* <Navigation currentPath={currentPath} /> */}
					<div className="card">
						{typeof message === 'string' ? <p>{message}</p> : message}
					</div>
					<p>Server-side rendered with React and Bun</p>
				</div>
			</body>
		</html>
	)
}
