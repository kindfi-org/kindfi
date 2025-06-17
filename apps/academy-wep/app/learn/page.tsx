

import ModuleFooter from '~/components/module-detail/module-footer'
import ModuleHeader from '~/components/module-detail/module-header'
import ModuleLessons from '~/components/module-detail/module-lessons'

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
