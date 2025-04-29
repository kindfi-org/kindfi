'use client'

import type { SVGProps } from 'react'

interface IllustrationProps extends SVGProps<SVGSVGElement> {
	className?: string
}

export function WaveIllustration({ className, ...props }: IllustrationProps) {
	return (
		// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
		<svg
			viewBox="0 0 200 200"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={`w-48 h-48 ${className || ''}`}
			{...props}
		>
			<rect width="200" height="200" fill="#E6EEF9" />
			<path
				d="M60 100 L140 100 M100 60 L100 140"
				stroke="#93C5FD"
				strokeWidth="20"
				strokeLinecap="round"
			/>
		</svg>
	)
}

export const ProjectDetailsIcon = () => (
	// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
	<svg
		viewBox="0 0 200 200"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		className="w-48 h-48"
	>
		<rect width="200" height="200" fill="#E6EEF9" />
		<circle cx="100" cy="100" r="40" stroke="#93C5FD" strokeWidth="20" />
	</svg>
)

export const InvestDonateIcon = () => (
	// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
	<svg
		viewBox="0 0 200 200"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		className="w-48 h-48"
	>
		<rect width="200" height="200" fill="#E6EEF9" />
		<path
			d="M60 140 L100 60 L140 140"
			stroke="#93C5FD"
			strokeWidth="20"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
)

export const ExploreProject = () => (
	// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
	<svg
		viewBox="0 0 240 240"
		xmlns="http://www.w3.org/2000/svg"
		className="w-48 h-48"
	>
		<defs>
			<linearGradient id="cardGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
				<stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
				<stop offset="100%" style={{ stopColor: '#2563eb', stopOpacity: 1 }} />
			</linearGradient>
			<linearGradient id="cardGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
				<stop offset="0%" style={{ stopColor: '#60a5fa', stopOpacity: 1 }} />
				<stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
			</linearGradient>
			<linearGradient id="cardGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
				<stop offset="0%" style={{ stopColor: '#93c5fd', stopOpacity: 1 }} />
				<stop offset="100%" style={{ stopColor: '#60a5fa', stopOpacity: 1 }} />
			</linearGradient>
		</defs>

		<rect
			x="45"
			y="65"
			width="90"
			height="110"
			rx="8"
			fill="#e2e8f0"
			opacity="0.5"
			filter="url(#shadow)"
		/>
		<rect
			x="40"
			y="60"
			width="90"
			height="110"
			rx="8"
			fill="url(#cardGradient1)"
		/>
		<rect
			x="50"
			y="75"
			width="40"
			height="6"
			rx="3"
			fill="white"
			opacity="0.9"
		/>
		<rect
			x="50"
			y="90"
			width="70"
			height="4"
			rx="2"
			fill="white"
			opacity="0.7"
		/>
		<rect
			x="50"
			y="100"
			width="60"
			height="4"
			rx="2"
			fill="white"
			opacity="0.7"
		/>
		<circle cx="65" cy="130" r="20" fill="white" opacity="0.2" />

		<rect
			x="115"
			y="45"
			width="90"
			height="110"
			rx="8"
			fill="#e2e8f0"
			opacity="0.5"
			filter="url(#shadow)"
		/>
		<rect
			x="110"
			y="40"
			width="90"
			height="110"
			rx="8"
			fill="url(#cardGradient2)"
		/>
		<rect
			x="120"
			y="55"
			width="40"
			height="6"
			rx="3"
			fill="white"
			opacity="0.9"
		/>
		<rect
			x="120"
			y="70"
			width="70"
			height="4"
			rx="2"
			fill="white"
			opacity="0.7"
		/>
		<rect
			x="120"
			y="80"
			width="60"
			height="4"
			rx="2"
			fill="white"
			opacity="0.7"
		/>
		<circle cx="135" cy="110" r="20" fill="white" opacity="0.2" />

		<rect
			x="85"
			y="95"
			width="90"
			height="110"
			rx="8"
			fill="#e2e8f0"
			opacity="0.5"
			filter="url(#shadow)"
		/>
		<rect
			x="80"
			y="90"
			width="90"
			height="110"
			rx="8"
			fill="url(#cardGradient3)"
		/>
		<rect
			x="90"
			y="105"
			width="40"
			height="6"
			rx="3"
			fill="white"
			opacity="0.9"
		/>
		<rect
			x="90"
			y="120"
			width="70"
			height="4"
			rx="2"
			fill="white"
			opacity="0.7"
		/>
		<rect
			x="90"
			y="130"
			width="60"
			height="4"
			rx="2"
			fill="white"
			opacity="0.7"
		/>
		<circle cx="105" cy="160" r="20" fill="white" opacity="0.2" />

		<defs>
			<filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
				<feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.2" />
			</filter>
			<filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
				<feGaussianBlur stdDeviation="2" result="coloredBlur" />
				<feMerge>
					<feMergeNode in="coloredBlur" />
					<feMergeNode in="SourceGraphic" />
				</feMerge>
			</filter>
		</defs>

		<g transform="translate(140, 140)" filter="url(#glow)">
			<circle cx="0" cy="0" r="18" fill="none" stroke="white" strokeWidth="4" />
			<line
				x1="13"
				y1="13"
				x2="25"
				y2="25"
				stroke="white"
				strokeWidth="4"
				strokeLinecap="round"
			/>
		</g>
	</svg>
)

export const ExploreDetails = () => (
	// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
	<svg
		viewBox="0 0 240 240"
		xmlns="http://www.w3.org/2000/svg"
		className="w-48 h-48"
	>
		<defs>
			<linearGradient id="docGradient" x1="0%" y1="0%" x2="100%" y2="100%">
				<stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
				<stop offset="100%" style={{ stopColor: '#2563eb', stopOpacity: 1 }} />
			</linearGradient>
			<filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
				<feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.2" />
			</filter>
		</defs>

		<rect
			x="50"
			y="40"
			width="140"
			height="160"
			rx="10"
			fill="#e2e8f0"
			opacity="0.5"
			filter="url(#shadow)"
		/>
		<rect
			x="45"
			y="35"
			width="140"
			height="160"
			rx="10"
			fill="url(#docGradient)"
		/>

		<rect
			x="65"
			y="55"
			width="60"
			height="8"
			rx="4"
			fill="white"
			opacity="0.9"
		/>
		<rect
			x="65"
			y="70"
			width="100"
			height="4"
			rx="2"
			fill="white"
			opacity="0.6"
		/>

		<rect
			x="65"
			y="90"
			width="30"
			height="30"
			rx="6"
			fill="white"
			opacity="0.2"
		/>
		<rect
			x="105"
			y="90"
			width="30"
			height="30"
			rx="6"
			fill="white"
			opacity="0.2"
		/>
		<rect
			x="145"
			y="90"
			width="30"
			height="30"
			rx="6"
			fill="white"
			opacity="0.2"
		/>

		<rect
			x="65"
			y="135"
			width="100"
			height="8"
			rx="4"
			fill="white"
			opacity="0.2"
		/>
		<rect
			x="65"
			y="135"
			width="70"
			height="8"
			rx="4"
			fill="white"
			opacity="0.9"
		/>

		<rect
			x="65"
			y="155"
			width="80"
			height="4"
			rx="2"
			fill="white"
			opacity="0.6"
		/>
		<rect
			x="65"
			y="165"
			width="90"
			height="4"
			rx="2"
			fill="white"
			opacity="0.6"
		/>
		<rect
			x="65"
			y="175"
			width="70"
			height="4"
			rx="2"
			fill="white"
			opacity="0.6"
		/>

		<circle cx="160" cy="170" r="15" fill="white" opacity="0.9" />
		<path
			d="M160 165 l5 5 l-5 5"
			fill="none"
			stroke="#3b82f6"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<path
			d="M155 170 h10"
			fill="none"
			stroke="#3b82f6"
			strokeWidth="2"
			strokeLinecap="round"
		/>
	</svg>
)

export const Contribute = () => (
	// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
	<svg
		viewBox="0 0 240 240"
		xmlns="http://www.w3.org/2000/svg"
		className="w-48 h-48"
	>
		<defs>
			<linearGradient id="coinGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
				<stop offset="0%" style={{ stopColor: '#60a5fa', stopOpacity: 1 }} />
				<stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
			</linearGradient>
			<linearGradient id="coinGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
				<stop offset="0%" style={{ stopColor: '#93c5fd', stopOpacity: 1 }} />
				<stop offset="100%" style={{ stopColor: '#60a5fa', stopOpacity: 1 }} />
			</linearGradient>
			<linearGradient id="coinGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
				<stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
				<stop offset="100%" style={{ stopColor: '#2563eb', stopOpacity: 1 }} />
			</linearGradient>
			<filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
				<feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.2" />
			</filter>
		</defs>

		<circle
			cx="85"
			cy="125"
			r="45"
			fill="#e2e8f0"
			opacity="0.5"
			filter="url(#shadow)"
		/>
		<circle cx="80" cy="120" r="45" fill="url(#coinGradient1)" />
		<circle
			cx="80"
			cy="120"
			r="35"
			fill="none"
			stroke="white"
			strokeWidth="2"
			opacity="0.5"
		/>
		<text
			x="80"
			y="130"
			fontFamily="Arial"
			fontSize="24"
			fill="white"
			textAnchor="middle"
			opacity="0.9"
		>
			$
		</text>

		<circle
			cx="155"
			cy="125"
			r="45"
			fill="#e2e8f0"
			opacity="0.5"
			filter="url(#shadow)"
		/>
		<circle cx="150" cy="120" r="45" fill="url(#coinGradient2)" />
		<circle
			cx="150"
			cy="120"
			r="35"
			fill="none"
			stroke="white"
			strokeWidth="2"
			opacity="0.5"
		/>
		<text
			x="150"
			y="130"
			fontFamily="Arial"
			fontSize="24"
			fill="white"
			textAnchor="middle"
			opacity="0.9"
		>
			$
		</text>

		<circle
			cx="120"
			cy="85"
			r="50"
			fill="#e2e8f0"
			opacity="0.5"
			filter="url(#shadow)"
		/>
		<circle cx="115" cy="80" r="50" fill="url(#coinGradient3)" />
		<circle
			cx="115"
			cy="80"
			r="40"
			fill="none"
			stroke="white"
			strokeWidth="2"
			opacity="0.5"
		/>
		<text
			x="115"
			y="90"
			fontFamily="Arial"
			fontSize="28"
			fill="white"
			textAnchor="middle"
			opacity="0.9"
		>
			$
		</text>

		<path
			d="M50 160 C80 150, 150 150, 180 160"
			stroke="white"
			strokeWidth="2"
			opacity="0.3"
			fill="none"
		/>
		<path
			d="M60 170 C90 160, 140 160, 170 170"
			stroke="white"
			strokeWidth="2"
			opacity="0.3"
			fill="none"
		/>

		<circle cx="65" cy="95" r="3" fill="white" opacity="0.5" />
		<circle cx="165" cy="95" r="3" fill="white" opacity="0.5" />
		<circle cx="115" cy="155" r="3" fill="white" opacity="0.5" />
	</svg>
)

export function ExploreProjectsIcon({
	className,
	...props
}: IllustrationProps) {
	return (
		// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
		<svg
			viewBox="0 0 200 200"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
			{...props}
		>
			<rect width="200" height="200" fill="#E6EEF9" />
			<path
				d="M155 160 h10"
				fill="none"
				stroke="#3b82f6"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	)
}
