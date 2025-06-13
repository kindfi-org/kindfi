'use client'


import ModuleHeader from '~/components/Module-Detail/ModuleHeader'
import ModuleLessons from '~/components/Module-Detail/ModuleLessons'
import ModuleFooter from '~/components/Module-Detail/ModuleFooter'

export default function LearnPage() {
	return (
		<>
			<title>Learning Materials | KindFi Academy</title>
			<meta
				name="description"
				content="Explore educational modules and resources to enhance your financial literacy"
			/>
			
			<ModuleHeader/>
			<ModuleLessons/>
			<ModuleFooter/>
		</>
	)
}
