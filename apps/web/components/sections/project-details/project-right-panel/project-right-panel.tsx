'use client'
import { useEffect, useState } from 'react'
import type { ViewModeProps } from './type'
import { ViewClosed } from './view-closed'
import { ViewDonated } from './view-donated'
import { type FormValue, ViewInitial } from './view-initial'

export function ProjectRightPanel() {
	const [amountOfSupport, setAmountOfSupport] = useState(
		projectData.raisedAmount,
	)
	const [viewMode, setViewMode] = useState<ViewModeProps>('initial')
	const percentage = Math.round(
		Math.min((amountOfSupport / projectData.goalAmount) * 100, 100),
	)

	const onSubmit = (data: FormValue) => {
		setViewMode('donated')
		setAmountOfSupport((stateOld) => stateOld + Number(data.amountOfSupport))
	}

	useEffect(() => {
		let timeoutId: ReturnType<typeof setTimeout>
		if (viewMode === 'donated') {
			timeoutId = setTimeout(() => setViewMode('closed'), 4000)
		}
		return () => clearTimeout(timeoutId)
	}, [viewMode])

	const renderView = () => {
		switch (viewMode) {
			case 'donated':
				return (
					<ViewDonated
						amountOfSupport={amountOfSupport}
						goal={projectData.goalAmount}
						percentage={percentage}
					/>
				)
			case 'closed':
				return <ViewClosed changeViewMode={() => setViewMode('initial')} />
			default:
				return (
					<ViewInitial
						amountOfSupport={amountOfSupport}
						goal={projectData.goalAmount}
						percentage={percentage}
						onSubmit={onSubmit}
					/>
				)
		}
	}

	return <div className="max-w-[480px]">{renderView()}</div>
}

const projectData = {
	title: 'Energy storage with zero lithium and zero-degradation',
	raisedAmount: 963419,
	goalAmount: 1500000,
	nftTiers: [
		{
			title: 'Early Bird NFT',
			description: 'Support with $100',
			rightSite: '42 left',
		},
		{
			title: 'Impact Maker NFT',
			description: 'Support with $250',
			rightSite: '18 left',
		},
		{
			title: 'Founding Supporter NFT',
			description: 'Support with $500',
			rightSite: '5 left',
		},
	],
}
