interface CommunityStatsProps {
	memberCount: string
}

export function CommunityStats({ memberCount }: CommunityStatsProps) {
	return (
		<div className="hidden md:block relative">
			<div className="absolute inset-0 bg-gradient-to-br from-[#7CC635]/20 to-blue-500/20 rounded-full blur-xl transform rotate-6 scale-95"></div>
			<div className="relative bg-white p-6 rounded-full shadow-lg border border-gray-100 w-48 h-48 flex items-center justify-center">
				<div className="relative z-10 flex flex-col items-center">
					<svg
						width="64"
						height="64"
						viewBox="0 0 32 32"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						className="mb-3"
					>
						<path
							d="M16 28C22.6274 28 28 22.6274 28 16C28 9.37258 22.6274 4 16 4C9.37258 4 4 9.37258 4 16C4 22.6274 9.37258 28 16 28Z"
							stroke="#7CC635"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
						<path
							d="M16 20C18.7614 20 21 17.7614 21 15C21 12.2386 18.7614 10 16 10C13.2386 10 11 12.2386 11 15C11 17.7614 13.2386 20 16 20Z"
							fill="#7CC635"
							stroke="#7CC635"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
						<path
							d="M7.97485 24.9218C8.72812 23.4408 9.8765 22.1971 11.2929 21.3284C12.7093 20.4598 14.3384 20 16 20C17.6615 20 19.2906 20.4598 20.707 21.3284C22.1234 22.1971 23.2718 23.4408 24.0251 24.9218"
							stroke="#7CC635"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
					<div className="text-center">
						<div className="font-bold text-gray-900">{memberCount}</div>
						<div className="text-sm text-gray-500">Community Members</div>
					</div>
				</div>
			</div>
		</div>
	)
}
