import { X } from 'lucide-react'
import { Button } from './button'

function ResetButton() {
	return (
		<div className="flex flex-col items-start gap-4 w-full justify-normal">
			<div className="flex w-full items-end justify-end">
				<Button className="bg-transparent text-black hover:text-white border  hover:border-none group hover:bg-primary-500">
					<X className="text-black  group-hover:text-white" /> Reset Filters
				</Button>
			</div>
		</div>
	)
}

export default ResetButton
