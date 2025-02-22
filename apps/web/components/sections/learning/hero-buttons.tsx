import { ArrowRight, GraduationCap } from 'lucide-react'
import Link from 'next/link'
import { Button } from '~/components/base/button'

export function HeroButtons() {
	return (
		<div className="flex flex-col sm:flex-row gap-4 justify-center">
			<Link href="/learn">
				<Button
					variant="default"
					className="h-12 px-8 bg-black text-white hover:bg-black/90"
					size="lg"
				>
					Start Learning
					<ArrowRight className="ml-2 h-5 w-5" />
				</Button>
			</Link>

			<Link href="/courses">
				<Button
					variant="outline"
					size="lg"
					className="h-12 px-8 border-2 hover:bg-black/5"
				>
					<GraduationCap className="mr-2 h-5 w-5" />
					Browse Courses
				</Button>
			</Link>
		</div>
	)
}
