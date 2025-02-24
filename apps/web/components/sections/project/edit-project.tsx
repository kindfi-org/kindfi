'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import {
	CircleAlert,
	Facebook,
	Globe,
	Image as ImageIcon,
	Instagram,
	Link,
	Linkedin,
	Save,
	Twitter,
	Video,
} from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '~/components/base/button'
import {
	Input,
	InputBase,
	InputBaseAdornment,
	InputBaseControl,
	InputBaseInput,
} from '~/components/base/input'
import { Label } from '~/components/base/label'
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from '~/components/base/select'
import { Textarea } from '~/components/base/textarea'
import { TagManager } from '~/components/shared/tag-manager'
import { useUploadFile } from '~/hooks/use-file-upload'
import { categories } from '~/lib/mock-data/mock-hero-section'
import {
	type EditProjectFormData,
	MAX_LENGTHS,
	editProjectFormSchema,
} from '~/lib/validators/project'

export default function EditProjectForm() {
	const {
		register,
		handleSubmit,
		formState: { errors },
		watch,
		setValue,
	} = useForm<EditProjectFormData>({
		resolver: zodResolver(editProjectFormSchema),
		mode: 'onChange',
	})
	const {
		uploadFile,
		deleteFile,
		fileUrl,
		fileName,
		error: fileUploadError,
		uploading,
	} = useUploadFile()

	const {
		uploadFile: uploadVideoFile,
		deleteFile: deleteVideoFile,
		fileUrl: videoFileUrl,
		fileName: videoFileName,
		error: videoFileUploadError,
		uploading: videoFileUploading,
	} = useUploadFile()

	const allowedImageTypes = {
		PNG: 'image/png',
		JPG: 'image/jpeg',
		WEBP: 'image/webp',
	}
	const allowedVideoTypes = {
		MP4: 'video/mp4',
		WEBM: 'video/webm',
		OGG: 'video/ogg',
	}

	const imageUploadRef = useRef<HTMLInputElement | null>(null)
	const videoUploadRef = useRef<HTMLInputElement | null>(null)

	const taglineValue = watch('tagline', '')
	const descriptionValue = watch('description', '')
	const videoValue = watch('video', '')

	const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files ? e.target.files[0] : null
		if (file) {
			const fileUrl = await uploadFile(file, {
				allowedTypes: allowedImageTypes,
			})
			setValue('image', fileUrl || '')
		}
	}

	const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files ? e.target.files[0] : null
		if (file) {
			const fileUrl = await uploadVideoFile(file, {
				allowedTypes: allowedVideoTypes,
				maxSize: 31457280, // 30MB
			})
			setValue('video', fileUrl || '')
		}
	}

	const deleteImage = async () => {
		await deleteFile()
		setValue('image', '')
	}

	const changeImage = async () => {
		if (imageUploadRef.current) {
			imageUploadRef.current.click()
		}
	}
	const changeVideo = async () => {
		if (videoUploadRef.current) {
			videoUploadRef.current.click()
		}
	}

	const deleteVideo = async () => {
		await deleteVideoFile()
		setValue('video', '')
	}

	const onSubmit = (data: EditProjectFormData) => {
		console.log('Submitting..', data)
		// Handle form submission
	}

	useEffect(() => {
		if (videoValue?.length === 0 && (videoFileUrl?.length || 0) > 0) {
			setValue('video', videoFileUrl || '')
		}
	}, [videoFileUrl, videoValue, setValue])

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			className="mx-auto max-w-2xl px-4 py-8"
		>
			<div className="flex flex-col gap-2 mb-8">
				<h1 className="text-4xl font-bold">Edit Project Basics</h1>
				<p className="text-gray-500 text-lg">
					Update your project&apos;s core information and social media presence.
				</p>
			</div>

			<section className="flex flex-col gap-8">
				<div className="bg-white rounded-lg shadow-[0px_12px_18px_4px_#00000010]">
					<div className="flex flex-col gap-5 p-6">
						<h3 className="text-xl font-bold">Basic Information</h3>
						<div>
							<Label
								htmlFor="company-name"
								className="block text-sm font-medium text-gray-900 mb-1.5"
							>
								Company Name
							</Label>
							<Input
								type="text"
								id="company-name"
								{...register('companyName')}
								placeholder="Enter your company name"
								className={`w-full px-3 py-2 rounded-sm border ${
									errors.companyName
										? 'border-red-500/30 focus-visible:ring-red-500'
										: 'border-gray-200'
								} `}
							/>
							{errors.companyName && (
								<p className="text-sm text-red-500 mt-1">
									{errors.companyName.message}
								</p>
							)}
						</div>

						<div>
							<Label
								htmlFor="tagline"
								className="block text-sm font-medium text-gray-900 mb-1.5"
							>
								Tagline
							</Label>
							<Input
								type="text"
								id="tagline"
								{...register('tagline')}
								placeholder="Enter tagline"
								className={`w-full px-3 py-2 rounded-sm border ${
									errors.tagline
										? 'border-red-500/30 focus-visible:ring-red-500'
										: 'border-gray-200'
								} `}
							/>
							<div className="flex items-center justify-between gap-2 mt-1">
								<p
									className={`${taglineValue.length > MAX_LENGTHS.tagline && 'text-red-500'} text-[13px]`}
								>
									{taglineValue.length}/{MAX_LENGTHS.tagline} characters
								</p>
							</div>
						</div>

						<div>
							<Label
								htmlFor="description"
								className="block text-sm font-medium text-gray-900 mb-1.5"
							>
								Description
							</Label>
							<Textarea
								id="description"
								rows={5}
								{...register('description')}
								placeholder="Tell us about your project"
								className={`w-full px-3 py-2 rounded-sm border ${
									errors.description
										? 'border-red-500/30 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-2'
										: 'border-gray-200'
								}  resize-none`}
							/>
							<div className="flex items-center justify-between gap-2 mt-1">
								<p
									className={`${
										descriptionValue.length > MAX_LENGTHS.description &&
										'text-red-500'
									} text-[13px]`}
								>
									{descriptionValue.length}/{MAX_LENGTHS.description} characters
								</p>
							</div>
						</div>

						<div>
							<label
								htmlFor="category"
								className="block text-sm font-medium text-gray-900 mb-1.5"
							>
								How would you categorize your project?
							</label>
							<div className="relative">
								<Select onValueChange={(e) => setValue('category', e)}>
									<SelectTrigger className="w-full border-gray-200 rounded-sm">
										<SelectValue placeholder="Select a fruit" />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											<SelectLabel>Fruits</SelectLabel>
											{categories.map((category) => (
												<SelectItem key={category.id} value={category.label}>
													{category.label}
												</SelectItem>
											))}
										</SelectGroup>
									</SelectContent>
								</Select>
							</div>
							{errors.category && (
								<p className="text-sm text-red-500 mt-1">
									{errors.category.message}
								</p>
							)}
						</div>

						<div>
							<Label
								htmlFor="tags"
								className="block text-sm font-medium text-gray-900 mb-1.5"
							>
								Tags
							</Label>
							<TagManager
								id="tags"
								onUpdate={(tags) =>
									setValue(
										'tags',
										tags.map((item) => item.text),
									)
								}
							/>
							<div className="flex items-center justify-between gap-2 mt-1">
								<p className={`${errors.tags && 'text-red-500'} text-[13px]`}>
									{errors.tags?.message}
								</p>
							</div>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-lg shadow-[0px_12px_18px_4px_#00000010]">
					<div className="flex flex-col gap-5 p-6">
						<h3 className="text-xl font-bold">Media</h3>
						<div>
							<div>
								<Label
									htmlFor="cover-image"
									className="block text-sm font-medium text-gray-900 mb-1.5"
								>
									Cover Image
								</Label>
								<div className="relative cursor-pointer">
									<Input
										ref={(e) => {
											imageUploadRef.current = e
										}}
										type="file"
										id="cover-image"
										className="w-full h-64 absolute top-0 left-0 opacity-0 cursor-pointer"
										accept="image/jpeg,image/png,image/webp"
										onChange={(e) => handleUpload(e)}
									/>
									{fileUrl ? (
										<div>
											<div
												style={{ backgroundImage: `url(${fileUrl})` }}
												className="w-full h-[240px] bg-contain bg-center bg-no-repeat border border-gray-200 rounded-sm"
											/>
										</div>
									) : (
										<div
											className={`w-full grid place-items-center border-dashed border-2  rounded-sm h-64 ${errors.image ? 'border-red-300' : 'border-gray-200'}`}
										>
											<div className="flex flex-col items-center gap-4 text-center">
												<div className="grid place-items-center bg-gray-200 w-16 h-16 rounded-full">
													<ImageIcon className="w-8 h-8" />
												</div>
												<div className="flex flex-col gap-1">
													<p className="font-medium">
														{uploading
															? 'Uploading image'
															: 'Drop your image here'}
													</p>
													<p className="text-sm text-gray-500">
														{uploading
															? `Sit back and relax as we upload ${fileName}`
															: 'PNG, JGP or WEBP (max 5MB).'}
													</p>
												</div>
											</div>
										</div>
									)}
									{fileUrl && (
										<div className="flex justify-end items-center gap-2 mt-2">
											<Button
												type="button"
												className="text-secondary-500 hover:text-secondary-500/80 h-8 text-sm"
												onClick={changeImage}
											>
												Change Image
											</Button>
											<Button
												type="button"
												className="bg-red-500 text-white h-8 text-sm"
												onClick={deleteImage}
											>
												Delete Image
											</Button>
										</div>
									)}
								</div>
								{fileUploadError && (
									<p className="text-sm text-red-500 mt-1">{fileUploadError}</p>
								)}
								{errors.image && (
									<p className="text-sm text-red-500 mt-1">
										{errors.image.message}
									</p>
								)}
							</div>
							<div className="flex items-start gap-2 border border-gray-200 p-2 pb-3 rounded-md mt-4">
								<CircleAlert className="w-4 h-4 mt-[6px]" />
								<div className="">
									<h6 className="block text-sm font-medium text-gray-900">
										Tip
									</h6>
									<p className="text-[13px]">
										Use high quality images that represent your project well.
										Recommended size: 1200x630 pixels.
									</p>
								</div>
							</div>
						</div>

						<div>
							<Label
								htmlFor="pitch-video"
								className="block text-sm font-medium text-gray-900"
							>
								Embed or upload your pitch video.
							</Label>
							<div className="my-4">
								<InputBase
									className={`${
										errors.video
											? 'border-red-500/30 ring-red-500'
											: 'border-gray-200'
									} rounded-sm`}
								>
									<InputBaseAdornment>
										<div className="mr-2">
											<Link />
										</div>
									</InputBaseAdornment>
									<InputBaseControl>
										<InputBaseInput
											type="text"
											id="video-url"
											{...register('video')}
											// onChange={(e) => setValue('video', e.target.value)}
											placeholder="Enter video URL"
											className="placeholder:text-gray-500"
										/>
									</InputBaseControl>
								</InputBase>
								{errors.video && (
									<p className="text-sm text-red-500 mt-1">
										{errors.video.message}
									</p>
								)}
							</div>

							<div className="relative cursor-pointer">
								<Input
									ref={(e) => {
										videoUploadRef.current = e
									}}
									type="file"
									id="pitch-video"
									className="w-full h-64 absolute top-0 left-0 opacity-0 cursor-pointer"
									accept="video/mp4,video/webm,video/ogg"
									onChange={(e) => handleVideoUpload(e)}
								/>
								{videoValue && !errors.video ? (
									<iframe
										src={videoValue}
										title={`${videoFileName} embeded video`}
										allowFullScreen
										className="w-full h-64 border border-gray-200 rounded-md"
										frameBorder="0"
										allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
										referrerPolicy="strict-origin-when-cross-origin"
									/>
								) : (
									<div
										className={`w-full grid place-items-center border-dashed border-2  rounded-sm h-64 ${errors.video ? 'border-red-300' : 'border-gray-200'}`}
									>
										<div className="flex flex-col items-center gap-4 text-center">
											<div className="grid place-items-center bg-gray-200 w-16 h-16 rounded-full">
												<Video className="w-8 h-8" />
											</div>
											<div className="flex flex-col gap-1">
												<p className="font-medium">
													{videoFileUploading
														? 'Uploading video'
														: 'Or drop your video file here'}
												</p>
												<p className="text-sm text-gray-500">
													{videoFileUploading
														? `Sit back and relax as we upload ${videoFileName}`
														: 'MP4, WEBM or OGG (max 5MB).'}
												</p>
											</div>
										</div>
									</div>
								)}
								{videoFileUrl && (
									<div className="flex justify-end items-center gap-2 mt-2">
										<Button
											type="button"
											className="text-secondary-500 h-8 text-sm hover:text-secondary-500/80 duration-200 rounded-sm"
											onClick={changeVideo}
										>
											Change Video
										</Button>
										<Button
											type="button"
											className="bg-red-500 hover:bg-red-500/80 text-white h-8 text-sm duration-200 rounded-sm"
											onClick={deleteVideo}
										>
											Delete Video
										</Button>
									</div>
								)}
							</div>
							{videoFileUploadError && (
								<p className="text-sm text-red-500 mt-1">
									{videoFileUploadError}
								</p>
							)}
							{errors.video && (
								<p className="text-sm text-red-500 mt-1">
									{errors.video.message}
								</p>
							)}
						</div>
					</div>
				</div>

				<div className="bg-white rounded-lg shadow-[0px_12px_18px_4px_#00000010]">
					<div className="flex flex-col gap-5 p-6">
						<h3 className="text-xl font-bold">Social Media &amp; Links</h3>
						<div>
							<label
								htmlFor="website"
								className="block text-sm font-medium text-gray-900 mb-1.5"
							>
								Website
							</label>
							<InputBase
								className={`${
									errors.website
										? 'border-red-500/30 ring-red-500'
										: 'border-gray-200'
								} rounded-sm`}
							>
								<InputBaseAdornment>
									<div className="mr-2">
										<Globe />
									</div>
								</InputBaseAdornment>
								<InputBaseControl>
									<InputBaseInput
										type="text"
										id="website"
										{...register('website')}
										placeholder="Enter your website URL"
										className="placeholder:text-gray-500"
									/>
								</InputBaseControl>
							</InputBase>
							{errors.website && (
								<p className="text-sm text-red-500 mt-1">
									{errors.website.message}
								</p>
							)}
						</div>
						<div>
							<label
								htmlFor="twitter"
								className="block text-sm font-medium text-gray-900 mb-1.5"
							>
								Twitter
							</label>
							<InputBase
								className={`${
									errors.twitter
										? 'border-red-500/30 ring-red-500'
										: 'border-gray-200'
								} rounded-sm`}
							>
								<InputBaseAdornment>
									<div className="mr-2">
										<Twitter />
									</div>
								</InputBaseAdornment>
								<InputBaseControl>
									<InputBaseInput
										type="text"
										id="twitter"
										{...register('twitter')}
										placeholder="Enter your twitter URL"
										className="placeholder:text-gray-500"
									/>
								</InputBaseControl>
							</InputBase>
							{errors.twitter && (
								<p className="text-sm text-red-500 mt-1">
									{errors.twitter.message}
								</p>
							)}
						</div>
						<div>
							<label
								htmlFor="linkedin"
								className="block text-sm font-medium text-gray-900 mb-1.5"
							>
								Linkedin
							</label>
							<InputBase
								className={`${
									errors.linkedin
										? 'border-red-500/30 ring-red-500'
										: 'border-gray-200'
								} rounded-sm`}
							>
								<InputBaseAdornment>
									<div className="mr-2">
										<Linkedin />
									</div>
								</InputBaseAdornment>
								<InputBaseControl>
									<InputBaseInput
										type="text"
										id="linkedin"
										{...register('linkedin')}
										placeholder="Enter your linkedin URL"
										className="placeholder:text-gray-500"
									/>
								</InputBaseControl>
							</InputBase>
							{errors.linkedin && (
								<p className="text-sm text-red-500 mt-1">
									{errors.linkedin.message}
								</p>
							)}
						</div>
						<div>
							<label
								htmlFor="instagram"
								className="block text-sm font-medium text-gray-900 mb-1.5"
							>
								Instagram
							</label>
							<InputBase
								className={`${
									errors.instagram
										? 'border-red-500/30 ring-red-500'
										: 'border-gray-200'
								} rounded-sm`}
							>
								<InputBaseAdornment>
									<div className="mr-2">
										<Instagram />
									</div>
								</InputBaseAdornment>
								<InputBaseControl>
									<InputBaseInput
										type="text"
										id="instagram"
										{...register('instagram')}
										placeholder="Enter your instagram URL"
										className="placeholder:text-gray-500"
									/>
								</InputBaseControl>
							</InputBase>
							{errors.instagram && (
								<p className="text-sm text-red-500 mt-1">
									{errors.instagram.message}
								</p>
							)}
						</div>
						<div>
							<label
								htmlFor="tiktok"
								className="block text-sm font-medium text-gray-900 mb-1.5"
							>
								TikTok
							</label>
							<InputBase
								className={`${
									errors.tiktok
										? 'border-red-500/30 ring-red-500'
										: 'border-gray-200'
								} rounded-sm`}
							>
								<InputBaseAdornment>
									<div className="mr-2">
										<Link />
									</div>
								</InputBaseAdornment>
								<InputBaseControl>
									<InputBaseInput
										type="text"
										id="tiktok"
										{...register('tiktok')}
										placeholder="Enter your tiktok URL"
										className="placeholder:text-gray-500"
									/>
								</InputBaseControl>
							</InputBase>
							{errors.tiktok && (
								<p className="text-sm text-red-500 mt-1">
									{errors.tiktok.message}
								</p>
							)}
						</div>
						<div>
							<label
								htmlFor="youtube"
								className="block text-sm font-medium text-gray-900 mb-1.5"
							>
								YouTube
							</label>
							<InputBase
								className={`${
									errors.youtube
										? 'border-red-500/30 ring-red-500'
										: 'border-gray-200'
								} rounded-sm`}
							>
								<InputBaseAdornment>
									<div className="mr-2">
										<Link />
									</div>
								</InputBaseAdornment>
								<InputBaseControl>
									<InputBaseInput
										type="text"
										id="youtube"
										{...register('youtube')}
										placeholder="Enter your youtube URL"
										className="placeholder:text-gray-500"
									/>
								</InputBaseControl>
							</InputBase>
							{errors.youtube && (
								<p className="text-sm text-red-500 mt-1">
									{errors.youtube.message}
								</p>
							)}
						</div>
						<div>
							<label
								htmlFor="facebook"
								className="block text-sm font-medium text-gray-900 mb-1.5"
							>
								Facebook
							</label>
							<InputBase
								className={`${
									errors.facebook
										? 'border-red-500/30 ring-red-500'
										: 'border-gray-200'
								} rounded-sm`}
							>
								<InputBaseAdornment>
									<div className="mr-2">
										<Facebook />
									</div>
								</InputBaseAdornment>
								<InputBaseControl>
									<InputBaseInput
										type="text"
										id="facebook"
										{...register('facebook')}
										placeholder="Enter your facebook URL"
										className="placeholder:text-gray-500"
									/>
								</InputBaseControl>
							</InputBase>
							{errors.facebook && (
								<p className="text-sm text-red-500 mt-1">
									{errors.facebook.message}
								</p>
							)}
						</div>
					</div>
				</div>
			</section>

			<div className="flex justify-end pt-4">
				<button
					type="submit"
					className="flex items-center gap-2 px-8 py-3 bg-black text-white rounded-sm hover:bg-black/80 transition-colors text-[13px] duration-500"
				>
					<Save className="w-4 h-4" />
					Save Changes
				</button>
			</div>
		</form>
	)
}
