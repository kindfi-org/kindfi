interface BadgeProps {
	label: string
}

export function Badge({ label }: BadgeProps) {
	return (
		<span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-4 py-1.5 text-sm text-gray-700">
			<svg
				className="h-3.5 w-3.5"
				viewBox="0 0 24 24"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				role="img"
			>
				<title>Star Icon</title>
				<path
					d="M12 15.4L8.24 17.67L9.07 13.34L5.85 10.22L10.2 9.54L12 5.5L13.8 9.54L18.15 10.22L14.93 13.34L15.76 17.67L12 15.4Z"
					fill="currentColor"
				/>
			</svg>
			{label}
		</span>
	)
}
