'use client'

import { TabsList, TabsTrigger } from '~/components/base/tabs'

interface TabSelectorProps {
	activeTab: string
}

export function TabSelector({ activeTab }: TabSelectorProps) {
	return (
		<TabsList className="bg-white p-1 rounded-full border border-gray-100 shadow-sm flex w-fit">
			<TabsTrigger
				value="modules"
				className="rounded-full px-6 py-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#7CC635] data-[state=active]:to-[#1e3a8a] data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-[#7CC635]/50 transition-all duration-300"
			>
				Learning Modules
			</TabsTrigger>
			<TabsTrigger
				value="resources"
				className="rounded-full px-6 py-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#7CC635] data-[state=active]:to-[#1e3a8a] data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-[#7CC635]/50 transition-all duration-300"
			>
				Resources & Guides
			</TabsTrigger>
		</TabsList>
	)
}
