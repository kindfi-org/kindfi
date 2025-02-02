interface TestimonialProps {
	quote: string
	author: string
	role: string
}

export const Testimonial = ({ quote, author, role }: TestimonialProps) => (
	<div className="flex flex-col md:flex-row gap-8 items-center">
		<div className="flex-1 space-y-4">
			<blockquote className="text-xl font-medium text-justify leading-relaxed">
				&ldquo;{quote}&rdquo;
			</blockquote>
			<div>
				<div className="font-semibold text-blue-700">{author}</div>
				<div className="text-gray-600">{role}</div>
			</div>
		</div>
	</div>
)
