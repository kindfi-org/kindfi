import { useEffect, useState } from 'react'
export function useElementVisibility(
	elementIdOrRef: string | React.RefObject<HTMLElement>,
	threshold = 0.1,
): boolean {
	const [isVisible, setIsVisible] = useState(false)
	useEffect(() => {
		if (typeof window === 'undefined') return
		const handleIntersection = (entries: IntersectionObserverEntry[]) => {
			setIsVisible(entries[0].isIntersecting)
		}
		const observer = new IntersectionObserver(handleIntersection, {
			root: null,
			threshold,
		})

		let element: HTMLElement | null = null
		if (typeof elementIdOrRef === 'string') {
			element = document.getElementById(elementIdOrRef)
		} else if (elementIdOrRef.current) {
			element = elementIdOrRef.current
		}

		if (element) {
			observer.observe(element)
		}

		return () => {
			if (element) {
				observer.unobserve(element)
			}
		}
	}, [elementIdOrRef, threshold])
	return isVisible
}
