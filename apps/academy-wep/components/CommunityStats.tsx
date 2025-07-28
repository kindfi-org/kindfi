interface CommunityStatsProps {
	memberCount: string | number
}

export function CommunityStats({ memberCount }: CommunityStatsProps) {
	return (
		<div className="relative flex justify-center md:justify-end">
			<div className="absolute inset-0 bg-gradient-to-br from-[#7CC635]/20 to-blue-500/20 rounded-full blur-xl transform rotate-6 scale-95" />
			<div className="relative bg-white p-4 sm:p-6 rounded-full shadow-lg border border-gray-100 w-36 h-36 sm:w-40 sm:h-40 md:w-44 md:h-44 lg:w-48 lg:h-48 xl:w-52 xl:h-52 flex items-center justify-center">
				<div className="relative z-10 flex flex-col items-center">
					<svg
						width="64"
						height="64"
						viewBox="0 0 32 32"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						className="mb-2 sm:mb-3 md:mb-4"
					>
						<title>Community Icon</title>
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
