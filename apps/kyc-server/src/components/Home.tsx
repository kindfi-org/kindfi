import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import React from 'react'
import type { ReactNode } from 'react'
import { Navigation } from './navigation'

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

export function Home({ message, currentPath = '/' }: HomeProps) {
	// Get the client filename
	const clientJs = getClientFilename()

	return (
		<html lang="en">
			<head>
				<title>Kindfi KYC Server</title>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<style>{`
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            line-height: 1.6;
          }
          h1 {
            color: #333;
            margin-bottom: 1rem;
          }
          p {
            color: #666;
            margin-bottom: 1.5rem;
          }
          .card {
            background: #f9f9f9;
            border-radius: 8px;
            padding: 1.5rem;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 1.5rem;
          }
          nav {
            margin-bottom: 2rem;
          }
          nav ul {
            display: flex;
            list-style: none;
            padding: 0;
            gap: 1rem;
          }
          nav a {
            color: #0066cc;
            text-decoration: none;
            padding: 0.5rem 0;
            border-bottom: 2px solid transparent;
            transition: border-color 0.2s;
          }
          nav a:hover {
            border-color: #0066cc;
          }
          nav a.active {
            border-color: #0066cc;
            font-weight: 500;
          }
        `}</style>
				<script type="module" src={`/${clientJs}`} defer />
			</head>
			<body>
				<h1>Kindfi KYC Server</h1>
				<div id="root">
					<Navigation currentPath={currentPath} />
					<div className="card">
						{typeof message === 'string' ? <p>{message}</p> : message}
					</div>
					<p>Server-side rendered with React and Bun</p>
				</div>
			</body>
		</html>
	)
}
