export const SIDEBAR_COOKIE_NAME = 'sidebar:state'
export const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
export const SIDEBAR_WIDTH = '16rem'
export const SIDEBAR_WIDTH_MOBILE = '18rem'
export const SIDEBAR_WIDTH_ICON = '3rem'
export const SIDEBAR_KEYBOARD_SHORTCUT = 'b'

const TRANSITION_DURATION = '200ms'

export const getSidebarStyles = (reducedMotion: boolean) => ({
	transition: reducedMotion
		? 'none'
		: `transform ${TRANSITION_DURATION} ease-in-out, opacity ${TRANSITION_DURATION} ease-in-out`,
	transformOrigin: 'left',
	willChange: reducedMotion ? 'auto' : 'transform, opacity',
})

export const getSidebarStylesTwo = (reducedMotion: boolean) => ({
	transition: reducedMotion
		? 'none'
		: `transform ${TRANSITION_DURATION} ease-in-out`,
	willChange: reducedMotion ? 'auto' : 'transform',
})
