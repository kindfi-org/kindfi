import Image from 'next/image'
import { FaExternalLinkAlt, FaLink } from 'react-icons/fa'
import { Card } from '~/components/base/card'
import type { ITeamMember } from '~/lib/types/project/team.types'
import type { ITeamData } from './advisory-board'

export function LeadershipTeamCard({
	name,
	role,
	shortBio,
	links,
}: ITeamMember) {
	return (
		<Card className="max-w-sm rounded overflow-hidden shadow-lg bg-white p-6 border border-gray-200">
			<div className="flex items-start space-x-4">
				<Image
					src="/images/placeholder.png"
					alt={name}
					width={64}
					height={64}
					className="rounded-lg bg-gray-200 object-cover"
				/>
				<div>
					<h2 className="text-lg font-bold text-black">{name}</h2>
					<p className="text-blue-600 font-medium">{role}</p>
					<p className="text-gray-600 text-sm mt-2">{shortBio}</p>
					<div className="mt-3 flex space-x-3 text-gray-500">
						<div className="p-2 rounded-full hover:bg-gray-200 transition">
							{links && (
								<a
									href={links[0] ? links[0] : '#'}
									target="_blank"
									rel="noopener noreferrer"
								>
									<FaLink className="cursor-pointer" />
								</a>
							)}
						</div>
						<div className="p-2 rounded-full hover:bg-gray-200 transition">
							{links && (
								<a
									href={links[1] ? links[1] : '#'}
									target="_blank"
									rel="noopener noreferrer"
								>
									<FaExternalLinkAlt className="cursor-pointer" />
								</a>
							)}
						</div>
					</div>
				</div>
			</div>
		</Card>
	)
}

interface ILeaderData extends ITeamData {
	totalCount: number
}
export function LeadershipTeam({ data, totalCount }: ILeaderData) {
	return (
		<section aria-labelledby="leadership-team-heading">
			<div className="flex justify-between">
				<h2
					className="text-2xl font-bold text-black"
					id="leadership-team-heading"
				>
					Leadership Team
				</h2>
				<span className="px-3 py-1 text-sm font-medium text-black border border-gray-300 rounded-full">
					{totalCount ?? (data?.length || 0)} members
				</span>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-[1.5rem]">
				{data && data.length > 0 ? (
					data.map((ele) => (
						<LeadershipTeamCard
							key={`leadership-${ele.name}${ele.role}`}
							{...ele}
						/>
					))
				) : (
					<p className="col-span-full text-gray-500">
						No leadership team members to display.
					</p>
				)}
			</div>
		</section>
	)
}
