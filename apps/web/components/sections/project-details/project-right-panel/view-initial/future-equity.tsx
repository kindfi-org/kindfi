import { Shield } from 'lucide-react'
import { Separator } from '~/components/base/separator'

type FutureEquityProps = {
	valuationCap: string
	investmentRange: string
}

export function FutureEquity({
	valuationCap,
	investmentRange,
}: FutureEquityProps) {
	return (
		<div className="space-y-1">
			<Separator className="mb-3" />
			<h3 className="font-semibold text-gray-900 text-lg">Future Equity</h3>
			<div className="flex justify-between">
				<span className="text-gray-600">{valuationCap}</span>
				<span className="text-gray-600">Valuation cap</span>
			</div>
			<div className="flex items-center gap-1">
				<Shield className="size-5 text-green-600" />
				<span className="text-green-600 ">Investor Advantages:</span>
			</div>
			<span className="text-gray-600 block">{investmentRange}</span>
		</div>
	)
}
