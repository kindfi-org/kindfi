'use client'

import type React from 'react'
import { useState } from 'react'
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from '~/components/base/tabs'

type Tab = {
	id: string
	label: string
	content: React.ReactNode
}

type TabNavigationProps = {
	tabs: Tab[]
	defaultTab?: string
}

const TabNavigation: React.FC<TabNavigationProps> = ({ tabs, defaultTab }) => {
	const [activeTab, setActiveTab] = useState(defaultTab || tabs[0].id)

	const handleTabChange = (tabId: string) => {
		setActiveTab(tabId)
	}

	return (
		<Tabs
			defaultValue={activeTab}
			onValueChange={handleTabChange}
			className="w-full"
		>
			<TabsList className="flex space-x-4 border-b border-gray-200">
				{tabs.map((tab) => (
					<TabsTrigger
						key={tab.id}
						value={tab.id}
						className={`px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
							activeTab === tab.id
								? 'border-b-2 border-blue-500 text-blue-500'
								: ''
						}`}
					>
						{tab.label}
					</TabsTrigger>
				))}
			</TabsList>
			{tabs.map((tab) => (
				<TabsContent
					key={tab.id}
					value={tab.id}
					className={`pt-4 ${activeTab === tab.id ? 'block' : 'hidden'}`}
				>
					<div>{tab.content}</div>
				</TabsContent>
			))}
		</Tabs>
	)
}

export { TabNavigation }
