import { ArrowRight, GraduationCap } from 'lucide-react'
import { Button } from '~/components/base/button'

export function HeroButtons() {
	return (
		<div className="flex flex-col sm:flex-row gap-4 justify-center">
			<Button className="gradient-btn text-white h-12 px-8" size="lg">
				Start Learning
				<ArrowRight className="ml-2 h-5 w-5" />
			</Button>
			<Button
				variant="outline"
				size="lg"
				className="gradient-border-btn h-12 px-8"
			>
				<GraduationCap className="mr-2 h-5 w-5" />
				Browse Courses
			</Button>
		</div>
	)
}
