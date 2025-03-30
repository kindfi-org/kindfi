'use client'

import { AlertCircle } from 'lucide-react'
import type React from 'react'
import { useCallback, useRef, useState } from 'react'
import Webcam from 'react-webcam'
import { Alert, AlertDescription } from '~/components/base/alert'
import { Button } from '~/components/base/button'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import { useToast } from '~/components/base/toast'
import { cn } from '~/lib/utils'
import type { ToastType } from './types'

type Props = {
	onCancel: () => void
	onContinue: (image: string) => void
}

const ProofOffaceVerification: React.FC<Props> = ({ onCancel, onContinue }) => {
	const { toast } = useToast()
	const WebcamRef = useRef<Webcam>(null)
	const [image, setImage] = useState<string | null>(null)
	const capture = useCallback(() => {
		if (WebcamRef.current) {
			const imageSrc = WebcamRef.current.getScreenshot()
			if (imageSrc) {
				setImage(imageSrc)
				toast({
					title: 'Photo Captured',
					description: 'Your selfie has been successfully captured.',
					className: 'bg-success text-success-foreground',
				} as ToastType)
			} else {
				toast({
					title: 'Capture Failed',
					description: 'Unable to capture an image. Please try again.',
					className: 'bg-destructive text-destructive-foreground',
				} as ToastType)
			}
		}
	}, [toast])

	const retakePhoto = useCallback(() => {
		setImage(null)
		toast({
			title: 'Photo Cleared',
			description: 'You can now take a new selfie.',
		} as ToastType)
	}, [toast])

	const handleContinue = () => {
		if (!image) {
			toast({
				title: 'No Image Captured',
				description: 'Please take a selfie before continuing.',
			} as ToastType)
			return
		}
		onContinue(image)
	}
	return (
		<>
			<Card className="w-full max-w-xl mx-auto">
				<CardHeader>
					<CardTitle className="text-2xl font-semibold flex items-center gap-2">
						<span>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								strokeWidth={1.5}
								stroke="currentColor"
								className="size-6"
								role="img"
								aria-label="Verification checkmark icon"
							>
								<title>Verification checkmark icon</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
								/>
							</svg>
						</span>
						Take a Selfie
					</CardTitle>
					<p className="text-gray-500">
						Please provide a recent document that proves your current address.
					</p>
				</CardHeader>
				<CardContent className="space-y-6">
					<div>
						<h3 className="text-lg font-medium mb-2">Step 3 of 4</h3>
						<div className="w-full h-2 bg-gray-200 rounded-full">
							<div className="w-[75%] h-2 bg-black rounded-full" />
						</div>
					</div>
					<div className="space-y-2">
						<label htmlFor="document-type" className="text-lg font-medium">
							Selfie
						</label>
						<div
							className={cn(
								'border-2 border-dashed rounded-lg  text-center relative  justify-center items-center h-80 ',
							)}
						>
							{!image ? (
								<Webcam
									ref={WebcamRef}
									audio={false}
									screenshotFormat="image/jpeg"
									className="w-full h-full object-cover"
								/>
							) : (
								<img
									src={image}
									alt="Captured"
									className="w-full h-full object-cover"
								/>
							)}
							<button
								type="button"
								onClick={!image ? capture : retakePhoto}
								className={cn(
									'text-base items-center py-3 px-4 gap-2 rounded-md font-medium border flex text-white border-white bg-black',
									'transition-all duration-300 ease-in-out transform',
									'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
									'hover:scale-[1.01] hover:bg-opacity-70 hover:shadow-lg cursor-pointer',
								)}
							>
								{!image ? 'Capture Photo' : 'Retake Photo'}
							</button>
						</div>
						<Alert variant="default">
							<AlertDescription>
								<div className="mt-2">
									<div className="flex items-center gap-2">
										<AlertCircle className="h-4 w-4" />
										<p className="font-medium">Important</p>
									</div>
									<ul className="list-disc pl-6 mt-2 space-y-1">
										Ensure your face is clearly visible and well-lit. Avoid
										wearing hats or sunglasses
									</ul>
								</div>
							</AlertDescription>
						</Alert>
						<div className="flex justify-end space-x-4">
							<Button className="text-black" onClick={onCancel}>
								Cancel
							</Button>
							<Button
								className="bg-black text-white"
								onClick={handleContinue}
								disabled={!image}
							>
								Continue
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		</>
	)
}

export { ProofOffaceVerification }
