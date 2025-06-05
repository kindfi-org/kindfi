import type * as React from 'react'

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  indicatorClassName?: string
}

export function Progress({ value = 0, className = '', indicatorClassName = '', ...props }: ProgressProps) {
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`relative w-full overflow-hidden rounded bg-muted ${className}`}
      {...props}
    >
      <div
        className={`h-full transition-all duration-300 ${indicatorClassName}`}
        style={{ width: `${value}%` }}
      />
    </div>
  )
} 