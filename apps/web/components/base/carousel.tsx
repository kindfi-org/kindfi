'use client'

import useEmblaCarousel, {
	type UseEmblaCarouselType,
} from 'embla-carousel-react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import * as React from 'react'

import { Button } from '~/components/base/button'
import { cn } from '~/lib/utils'

type CarouselApi = UseEmblaCarouselType[1]
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>
type CarouselOptions = UseCarouselParameters[0]
type CarouselPlugin = UseCarouselParameters[1]

type CarouselProps = {
	/**
	 *  ShadCN/UI Reference:https://ui.shadcn.com/docs/components/carousel
	 * Optional settings for the carousel.
	 */
	opts?: CarouselOptions
	/**
	 * Optional plugins for the carousel.
	 */
	plugins?: CarouselPlugin
	/**
	 * Defines the orientation of the carousel ('horizontal' or 'vertical').
	 * Default is 'horizontal'.
	 */
	orientation?: 'horizontal' | 'vertical'
	/**
	 * A callback function to set the API for the carousel.
	 */
	setApi?: (api: CarouselApi) => void
}

type CarouselContextProps = {
	/** The ref of the carousel element. */
	carouselRef: ReturnType<typeof useEmblaCarousel>[0]
	/** The API of the carousel. */
	api: ReturnType<typeof useEmblaCarousel>[1]
	/** Function to scroll to the previous slide. */
	scrollPrev: () => void
	/** Function to scroll to the next slide. */
	scrollNext: () => void
	/** Whether the carousel can scroll to the previous slide. */
	canScrollPrev: boolean
	/** Whether the carousel can scroll to the next slide. */
	canScrollNext: boolean
} & CarouselProps

const CarouselContext = React.createContext<CarouselContextProps | null>(null)

/**
 * Custom hook to access the carousel context.
 * @throws Will throw an error if used outside of a <Carousel /> component.
 */
function useCarousel() {
	const context = React.useContext(CarouselContext)

	if (!context) {
		throw new Error('useCarousel must be used within a <Carousel />')
	}

	return context
}

/**
 * Carousel component that provides the carousel context and functionality.
 */
const Carousel = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement> & CarouselProps
>(
	(
		{
			orientation = 'horizontal',
			opts,
			setApi,
			plugins,
			className,
			children,
			...props
		},
		ref,
	) => {
		const [carouselRef, api] = useEmblaCarousel(
			{
				...opts,
				axis: orientation === 'horizontal' ? 'x' : 'y',
			},
			plugins,
		)
		const [canScrollPrev, setCanScrollPrev] = React.useState(false)
		const [canScrollNext, setCanScrollNext] = React.useState(false)

		const onSelect = React.useCallback((api: CarouselApi) => {
			if (!api) {
				return
			}

			setCanScrollPrev(api.canScrollPrev())
			setCanScrollNext(api.canScrollNext())
		}, [])

		const scrollPrev = React.useCallback(() => {
			api?.scrollPrev()
		}, [api])

		const scrollNext = React.useCallback(() => {
			api?.scrollNext()
		}, [api])

		const handleKeyDown = React.useCallback(
			(event: React.KeyboardEvent<HTMLDivElement>) => {
				if (event.key === 'ArrowLeft') {
					event.preventDefault()
					scrollPrev()
				} else if (event.key === 'ArrowRight') {
					event.preventDefault()
					scrollNext()
				}
			},
			[scrollPrev, scrollNext],
		)

		React.useEffect(() => {
			if (!api || !setApi) {
				return
			}

			setApi(api)
		}, [api, setApi])

		React.useEffect(() => {
			if (!api) {
				return
			}

			onSelect(api)
			api.on('reInit', onSelect)
			api.on('select', onSelect)

			return () => {
				api?.off('select', onSelect)
			}
		}, [api, onSelect])

		return (
			<CarouselContext.Provider
				value={{
					carouselRef,
					opts,
					api: api,
					orientation:
						orientation || (opts?.axis === 'y' ? 'vertical' : 'horizontal'),
					scrollPrev,
					scrollNext,
					canScrollPrev,
					canScrollNext,
				}}
			>
				<section
					ref={ref}
					onKeyDownCapture={handleKeyDown}
					className={cn('relative', className)}
					{...props}
				>
					{children}
				</section>
			</CarouselContext.Provider>
		)
	},
)
Carousel.displayName = 'Carousel'

/**
 * CarouselContent component that wraps the carousel items and manages overflow.
 */
const CarouselContent = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
	const { carouselRef, orientation } = useCarousel()

	return (
		<div ref={carouselRef} className="overflow-hidden">
			<div
				ref={ref}
				className={cn(
					'flex',
					orientation === 'horizontal' ? '-ml-4' : '-mt-4 flex-col',
					className,
				)}
				{...props}
			/>
		</div>
	)
})
CarouselContent.displayName = 'CarouselContent'

/**
 * CarouselItem component that represents an individual item in the carousel.
 */
const CarouselItem = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
	const { orientation } = useCarousel()

	return (
		<div
			ref={ref}
			role="group"
			aria-roledescription="slide"
			className={cn(
				'min-w-0 shrink-0 grow-0 basis-full py-3',
				orientation === 'horizontal' ? 'pl-4' : 'pt-4',
				className,
			)}
			{...props}
		/>
	)
})
CarouselItem.displayName = 'CarouselItem'

/**
 * CarouselPrevious component that renders a button for scrolling to the previous slide.
 */
const CarouselPrevious = React.forwardRef<
	HTMLButtonElement,
	React.ComponentProps<typeof Button>
>(({ className, variant = 'outline', size = 'icon', ...props }, ref) => {
	const { orientation, scrollPrev, canScrollPrev } = useCarousel()

	return (
		<Button
			ref={ref}
			variant={variant}
			size={size}
			className={cn(
				'absolute  h-8 w-8 rounded-full',
				orientation === 'horizontal'
					? '-left-12 top-1/2 -translate-y-1/2'
					: '-top-12 left-1/2 -translate-x-1/2 rotate-90',
				className,
			)}
			disabled={!canScrollPrev}
			onClick={scrollPrev}
			{...props}
		>
			<ArrowLeft className="h-4 w-4" />
			<span className="sr-only">Previous slide</span>
		</Button>
	)
})
CarouselPrevious.displayName = 'CarouselPrevious'

/**
 * CarouselNext component that renders a button for scrolling to the next slide.
 */
const CarouselNext = React.forwardRef<
	HTMLButtonElement,
	React.ComponentProps<typeof Button>
>(({ className, variant = 'outline', size = 'icon', ...props }, ref) => {
	const { orientation, scrollNext, canScrollNext } = useCarousel()

	return (
		<Button
			ref={ref}
			variant={variant}
			size={size}
			className={cn(
				'absolute h-8 w-8 rounded-full',
				orientation === 'horizontal'
					? '-right-12 top-1/2 -translate-y-1/2'
					: '-bottom-12 left-1/2 -translate-x-1/2 rotate-90',
				className,
			)}
			disabled={!canScrollNext}
			onClick={scrollNext}
			{...props}
		>
			<ArrowRight className="h-4 w-4" />
			<span className="sr-only">Next slide</span>
		</Button>
	)
})
CarouselNext.displayName = 'CarouselNext'

export {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
	type CarouselApi,
}
