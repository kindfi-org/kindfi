import React from 'react'

export function About() {
	return (
		<div>
			<h2>About This App</h2>
			<p>
				This is a server-side rendered React application built with Bun. It
				demonstrates how to create a modern web application with:
			</p>
			<ul style={{ marginLeft: '1.5rem', listStyleType: 'disc' }}>
				<li>Server-side rendering (SSR)</li>
				<li>Client-side hydration</li>
				<li>WebSocket communication</li>
				<li>Clean component architecture</li>
				<li>TypeScript for type safety</li>
			</ul>
			<p style={{ marginTop: '1rem' }}>
				The application uses a unified approach to rendering, ensuring that the
				server and client render the same content to avoid hydration errors.
			</p>
		</div>
	)
}
