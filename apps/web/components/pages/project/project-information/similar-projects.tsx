const SimilarProjects = () => {
    return (  
        <>
        		<div className="w-full bg-white shadow-gray-200 shadow-md rounded-lg py-6 px-6 my-5">
								<p className=" font-bold text-lg">Similar Projects </p>

								<div className="w-full  mt-2">
									<div className="w-full flex items-start justify-between gap-3 my-3">
										<div className="w-[20%] lg:w-[10%] ">
											<div className=" bg-gray-300 rounded-sm h-10" />
										</div>

										<div className="w-[80%] lg:w-[90%]">
											<p className="text-sm font-semibold truncate ">
												EcoFlow Energy Solutions
											</p>
											<p className=" s text-xs text-gray-400 font-normal truncate">
												Renewable energy storage for residential
											</p>

											<div className="w-full flex items-center justify-start gap-3 mt-2">
												<div className="w-auto py-1 px-4 rounded-lg bg-slate-200">
													<p className="font-bold text-[9px] capitalize">
														1.2M raised
													</p>
												</div>

												<p className=" text-gray-400 font-semibold text-xs">
													80%
												</p>
											</div>
										</div>
									</div>
									<div className="w-full flex items-start justify-between gap-3 my-3">
										<div className="w-[20%] lg:w-[10%]">
											<div className=" bg-gray-300 rounded-sm h-10" />
										</div>

										<div className="w-[80%] lg:w-[90%]">
											<p className="text-sm font-semibold truncate ">
												GreenPower Storage Systems
											</p>
											<p className=" s text-xs text-gray-400 font-normal truncate">
												Grid-scale energy storage technology
											</p>

											<div className="w-full flex items-center justify-start gap-3 mt-2">
												<div className="w-auto py-1 px-4 rounded-lg bg-slate-200">
													<p className="font-bold text-[9px] capitalize">
														1.2M raised
													</p>
												</div>

												<p className=" text-gray-400 font-semibold text-xs">
													57%
												</p>
											</div>
										</div>
									</div>

									<div className="w-full mt-5">
										<p className="text-xs text-center cursor-pointer font-bold">
											View more
										</p>
									</div>
								</div>
							</div>
        </>
    );
}
 
export default SimilarProjects;