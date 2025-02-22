import { Tabs, TabsList, TabsTrigger } from '~/components/base/tabs'

interface LevelTabsProps {
	value: string
	onValueChange: (value: string) => void
	className?: string
}

export function LevelTabs({
	value,
	onValueChange,
	className = '',
}: LevelTabsProps) {
	return (
		<Tabs
			defaultValue={value}
			className={`w-full sm:w-auto ${className}`}
			onValueChange={onValueChange}
		>
			<TabsList>
				<TabsTrigger value="all">All Levels</TabsTrigger>
				<TabsTrigger value="beginner">Beginner</TabsTrigger>
				<TabsTrigger value="intermediate">Intermediate</TabsTrigger>
				<TabsTrigger value="advanced">Advanced</TabsTrigger>
			</TabsList>
		</Tabs>
	)
}
