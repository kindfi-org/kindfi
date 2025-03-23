import { IoMdRibbon } from 'react-icons/io'
import { LiaCheckCircleSolid } from 'react-icons/lia'
import { LiaShieldAltSolid } from 'react-icons/lia'
import { TbUsers } from 'react-icons/tb'

const CredentialCard = () => {
	return (
		<div className="bg-stone-100 pb-8 sm:pb-10 px-4 sm:px-6">
			<div className="shadow-2xl rounded-md w-full sm:w-4/5 md:w-3/4 lg:w-1/2 mx-auto p-4 sm:p-7">
				<div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
					<div className="mx-auto sm:mx-0 sm:self-center">
						<IoMdRibbon className="shadow-xl p-2 rounded-full text-lime-600 text-4xl inline-block h-14 w-14 sm:h-16 sm:w-16" />
					</div>
					<div>
						<h2 className="bg-gradient-to-r from-lime-950 to-lime-600 bg-clip-text text-transparent font-bold text-lg sm:text-xl mb-2 sm:mb-3 text-center sm:text-left">
							Earn Verifiable Stellar Credentials
						</h2>
						<p className="text-gray-700 text-sm sm:text-base text-center sm:text-left">
							Complete learning modules to receive NFT badges minted on the
							Stellar blockchain, showcasing your expertise with immutable
							proof.
						</p>
						<div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 lg:gap-10 mt-4 sm:mt-5 text-xs">
							<p className="text-lime-600 flex gap-1 justify-center sm:justify-start">
								<LiaCheckCircleSolid className="inline self-center" />
								Blockchain Verified
							</p>
							<p className="text-blue-600 flex gap-1 justify-center sm:justify-start">
								<LiaShieldAltSolid className="inline self-center" />
								Tamper-Proof
							</p>
							<p className="text-violet-600 flex gap-1 justify-center sm:justify-start">
								<TbUsers className="inline self-center" />
								Industry Recognized
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default CredentialCard
