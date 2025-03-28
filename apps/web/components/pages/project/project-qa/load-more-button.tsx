interface LoadMoreButtonProps {
	onLoadMore: () => void
}

const LoadMoreButton: React.FC<LoadMoreButtonProps> = ({ onLoadMore }) => {
	return (
		<button
			type="button"
			onClick={onLoadMore}
			className="w-full py-2 mt-4 border rounded-md text-center bg-gray-100 hover:bg-gray-200"
		>
			Load more questions
		</button>
	)
}

export default LoadMoreButton
