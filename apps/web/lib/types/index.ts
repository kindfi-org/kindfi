export type ConditionalRequired<
	T,
	K extends keyof T,
	Flag extends boolean,
> = Flag extends true ? Required<Pick<T, K>> : Partial<Pick<T, K>>

export * from './escrow/escrow.types'
export * from './home.types'
export * from './logger.types'
export * from './pages.type'
export * from './passkey.types'
export * from './projects.types'
export * from './right-side-panel.types'
export * from './section.types'
export * from './stats.types'
export * from './user-dashboard.types'
