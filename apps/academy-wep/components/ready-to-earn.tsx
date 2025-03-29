'use client'

import { Award } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from './base/button'
interface ReadyToEarnProps {
	badges: Array<{ id: string; name: string; earned: boolean }>
}

interface ReadyToEarnProps {
	badges: Array<{ id: string; name: string; earned: boolean }>
}

// export default function ReadyToEarn({ badges }: ReadyToEarnProps) {
// 	const router = useRouter()
// 	const navigateToLearning = () => router.push('/learning')
// 	const navigateToDashboard = () => router.push('/dashboard')

// 	return (
// 		<div className="p-10">
// 			<section className="w-full min-h-[318px] px-[35px] py-[25px] flex items-center lg:items-start space-y-5 lg:space-y-0 flex-col lg:flex-row  shadow-[0px_4px_5px_rgb(0,0,0,0.1)] bg-gradient-to-r from-[#e7fbfd] via-white to-[#eafde5] rounded-2xl">
// 				<div className="flex flex-col gap-[20px]">
// 					<h1 className="sm:text-[37px] text-[28px] font-black">
// 						Ready to earn more badges?
// 					</h1>
// 					<p className="sm:text-[22px] text-[#555555] font-[600] text-[14px]">
// 						Continue learning your journey to unlock more badge and become a
// 						Kindfi Graduate. Each completed modules brings you close to mastery.
// 					</p>
// 					<div className="flex lg:justify-start flex-col md:flex-row gap-[12px] w-full justify-center">
// 						<Button
// 							onClick={navigateToLearning}
// 							className="bg-gradient-to-r hover:from-[#678a2f] text-center hover:to-[#021405] from-[#8fbe43] max-w-[219px] transition-color duration-300 font-[600] to-[#05250a] flex flex-none rounded-lg text-[18px] py-[16px] px-[28px] items-center justify-center text-white"
// 						>
// 							Continue Learning
// 						</Button>
// 						<Button
// 							onClick={navigateToDashboard}
// 							className="bg-white font-[600] border-[1px] text-center max-w-[219px] hover:text-[#181818] hover:border-[#3a3a3a] hover:bg-transparent transition-color duration-300 rounded-xl text-[18px] py-[16px] flex flex-none border-[#b6b5b5] px-[28px] items-center justify-center text-[#474747]"
// 						>
// 							View Dashboard
// 						</Button>
// 					</div>
// 				</div>
// 				<div className="flex flex-col gap-[4px] w-[230px] h-[230px] border border-[rgba(59,59,59,0.1)] shadow-[0px_10px_20px_rgb(0,0,0,0.1)]  flex-none bg-white rounded-full items-center justify-center">
// 					<Award size={75} color="#8fbe43" />
// 					<p className="font-black text-xl">
// 						<span className="text-green-600">
// 							{badges.filter((badge) => !badge.earned).length}
// 						</span>{' '}
// 						<span>more badges</span>
// 					</p>
// 					<p className="font-bold text-lg text-[#777676]">
// 						waiting to be earned
// 					</p>
// 				</div>
// 			</section>
// 		</div>
// 	)
// }

export default function ReadyToEarn({ badges }: ReadyToEarnProps) {
	const router = useRouter()
	const navigateToLearning = () => router.push('/learning')
	const navigateToDashboard = () => router.push('/dashboard')

	return (
		<div className="p-10">
			<section className="w-full min-h-[318px] px-[35px] py-[25px] flex items-center lg:items-start space-y-5 lg:space-y-0 flex-col lg:flex-row  shadow-[0px_4px_5px_rgb(0,0,0,0.1)] bg-gradient-to-r from-[#e7fbfd] via-white to-[#eafde5] rounded-2xl">
				<div className="flex flex-col gap-[20px]">
					<h1 className="sm:text-[37px] text-[28px] font-black">
						Ready to earn more badges?
					</h1>
					<p className="sm:text-[22px] text-[#555555] font-[600] text-[14px]">
						Continue learning your journey to unlock more badge and become a
						Kindfi Graduate. Each completed modules brings you close to mastery.
					</p>
					<div className="flex lg:justify-start flex-col md:flex-row gap-[12px] w-full justify-center">
						<Button
							onClick={navigateToLearning}
							className="bg-gradient-to-r hover:from-[#678a2f] text-center hover:to-[#021405] from-[#8fbe43] max-w-[219px] transition-color duration-300 font-[600] to-[#05250a] flex flex-none rounded-lg text-[18px] py-[16px] px-[28px] items-center justify-center text-white"
						>
							Continue Learning
						</Button>
						<Button
							onClick={navigateToDashboard}
							className="bg-white font-[600] border-[1px] text-center max-w-[219px] hover:text-[#181818] hover:border-[#3a3a3a] hover:bg-transparent transition-color duration-300 rounded-xl text-[18px] py-[16px] flex flex-none border-[#b6b5b5] px-[28px] items-center justify-center text-[#474747]"
						>
							View Dashboard
						</Button>
					</div>
				</div>
				<div className="flex flex-col gap-[4px] w-[230px] h-[230px] border border-[rgba(59,59,59,0.1)] shadow-[0px_10px_20px_rgb(0,0,0,0.1)]  flex-none bg-white rounded-full items-center justify-center">
					<Award size={75} color="#8fbe43" />
					<p className="font-black text-xl">
						<span className="text-green-600">
							{badges.filter((badge) => !badge.earned).length}
						</span>{' '}
						<span>more badges</span>
					</p>
					<p className="font-bold text-lg text-[#777676]">
						waiting to be earned
					</p>
				</div>
			</section>
		</div>
	)
}
