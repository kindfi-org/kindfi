export const SkeletonFeatureCreators = () => (
	<section className="py-12 bg-gray-100 container mx-auto text-center">
		<div className="container mx-auto text-center">
			<h1 className="text-3xl font-bold mb-6">Featured Creators</h1>
			<p className="text-gray-600 mb-12">Loading...</p>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-14">
				{[1, 2, 3].map((number) => (
					<div
						key={number}
						className="max-w-sm rounded-lg overflow-hidden shadow-lg p-6 bg-white animate-pulse"
						aria-busy="true"
					>
						<div className="flex flex-col items-center">
							<div className="w-24 h-24 rounded-full bg-gray-300" />
							<div className="text-center mt-4">
								<div className="h-6 bg-gray-300 rounded w-3/4 mx-auto mb-2" />
								<div className="h-4 bg-gray-300 rounded w-1/2 mx-auto mb-2" />
							</div>
						</div>
						<div className="mt-4">
							<div className="h-4 bg-gray-300 rounded w-3/4 mx-auto mb-2" />
							<div className="h-4 bg-gray-300 rounded w-1/2 mx-auto mb-2" />
							<div className="h-4 bg-gray-300 rounded w-1/3 mx-auto mb-2" />
							<div className="h-4 bg-gray-300 rounded w-1/4 mx-auto mb-2" />
						</div>
						<div className="mt-4 flex justify-between">
							<div className="bg-gray-300 h-8 w-20 rounded" />
							<div className="bg-gray-300 h-8 w-20 rounded" />
						</div>
					</div>
				))}
			</div>
		</div>
	</section>
)
