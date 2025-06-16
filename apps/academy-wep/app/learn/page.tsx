

import ModuleFooter from '~/components/Module-Detail/ModuleFooter'
import ModuleHeader from '~/components/Module-Detail/ModuleHeader'
import ModuleLessons from '~/components/Module-Detail/ModuleLessons'

export default function LearnPage() {
	return (
		<>
			<title>Learning Materials | KindFi Academy</title>
			<meta
				name="description"
				content="Explore educational modules and resources to enhance your financial literacy"
			/>

			<ModuleHeader />
			<ModuleLessons />
			<ModuleFooter />
		</>
	)
}
