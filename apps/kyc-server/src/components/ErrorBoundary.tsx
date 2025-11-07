import React, { type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
	children: ReactNode
	fallback?: ReactNode
}

interface ErrorBoundaryState {
	hasError: boolean
	error?: Error
}

export class ErrorBoundary extends React.Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	constructor(props: ErrorBoundaryProps) {
		super(props)
		this.state = { hasError: false }
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { hasError: true, error }
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error('ErrorBoundary caught an error:', error, errorInfo)
	}

	render() {
		if (this.state.hasError) {
			return (
				this.props.fallback || (
					<div className="flex flex-col items-center justify-center min-h-[400px] p-8">
						<div className="text-center">
							<h2 className="text-xl font-semibold text-foreground mb-2">
								Something went wrong
							</h2>
							<p className="text-muted-foreground mb-4">
								Failed to load the page. Please try refreshing.
							</p>
							<button
								onClick={() => window.location.reload()}
								className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
							>
								Refresh Page
							</button>
						</div>
					</div>
				)
			)
		}

		return this.props.children
	}
}
