/* eslint-disable @typescript-eslint/consistent-type-definitions */
import Image from 'next/image'
import Link from 'next/link'
import { Alert, AlertDescription, AlertTitle } from '~/components/base/alert'
import { cn } from '~/lib/utils'

type HProps = React.HTMLAttributes<HTMLHeadingElement>

export const mdxComponents = {
	img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
		const src =
			typeof props.src === 'string' ? props.src : '/images/placeholder.png'
		const alt = props.alt ?? ''
		const width = props.width ? Number(props.width) : 1200
		const height = props.height ? Number(props.height) : 630
		return (
			<Image
				src={src}
				alt={alt}
				width={width}
				height={height}
				className={props.className}
				style={props.style}
				sizes={props.sizes}
			/>
		)
	},
	a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
		<Link
			{...props}
			href={props.href || '#'}
			className={cn('underline underline-offset-4', props.className)}
		/>
	),
	h1: (props: HProps) => (
		<h1
			{...props}
			className={cn(
				'mt-2 scroll-m-20 text-4xl font-bold tracking-tight',
				props.className,
			)}
		/>
	),
	h2: (props: HProps) => (
		<h2
			{...props}
			className={cn(
				'mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0',
				props.className,
			)}
		/>
	),
	h3: (props: HProps) => (
		<h3
			{...props}
			className={cn(
				'mt-8 scroll-m-20 text-2xl font-semibold tracking-tight',
				props.className,
			)}
		/>
	),
	p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
		<p
			{...props}
			className={cn('leading-7 [&:not(:first-child)]:mt-6', props.className)}
		/>
	),
	ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
		<ul
			{...props}
			className={cn('my-6 ml-6 list-disc [&>li]:mt-2', props.className)}
		/>
	),
	Callout: ({
		title,
		children,
		type = 'default',
	}: {
		title?: string
		children?: React.ReactNode
		type?: 'default' | 'destructive'
	}) => (
		<Alert variant={type === 'destructive' ? 'destructive' : 'default'}>
			{title && <AlertTitle>{title}</AlertTitle>}
			<AlertDescription>{children}</AlertDescription>
		</Alert>
	),
	Tweet: ({ id }: { id: string }) => (
		<iframe
			src={`https://twitframe.com/show?url=${encodeURIComponent(`https://twitter.com/x/status/${id}`)}`}
			className="w-full min-h-[200px] border-0"
		/>
	),
}
