export type ConditionalRequired<
	T,
	K extends keyof T,
	Flag extends boolean,
> = Flag extends true ? Required<Pick<T, K>> : Partial<Pick<T, K>>

export * from './pages'
export * from './project'
export * from './stats'
