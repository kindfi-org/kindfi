'use client'

import { Globe, Plus, X } from 'lucide-react'
import type { KeyboardEvent } from 'react'
import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { Button } from '~/components/base/button'
import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '~/components/base/form'
import { Input } from '~/components/base/input'
import { cn } from '~/lib/utils'
import {
	getSocialTypeFromUrl,
	isAllowedSocialUrl,
} from '~/lib/utils/project-utils'
import type { CreateFoundationFormData } from '../types'
import { FormSectionHeader } from './form-section-header'

export function SocialLinksSection() {
	const form = useFormContext<CreateFoundationFormData>()
	const socialLinks = form.watch('socialLinks') ?? {}
	const [newUrl, setNewUrl] = useState('')
	const [linkError, setLinkError] = useState('')

	const addLink = () => {
		const urlTrimmed = newUrl.trim()

		if (!urlTrimmed) {
			setLinkError('URL is required')
			return
		}

		let validUrl: string
		try {
			validUrl = new URL(urlTrimmed).href
		} catch {
			setLinkError('Please enter a valid URL')
			return
		}

		if (!isAllowedSocialUrl(validUrl)) {
			setLinkError('Please enter a URL from a supported social network')
			return
		}

		const platform = getSocialTypeFromUrl(validUrl)
		if (!platform || platform === 'website') {
			setLinkError(
				'Please enter a URL from a supported social network (Twitter/X, LinkedIn, Facebook, Instagram, YouTube, etc.)',
			)
			return
		}

		if (socialLinks[platform]) {
			setLinkError(`A ${platform} link already exists`)
			return
		}

		form.setValue('socialLinks', {
			...socialLinks,
			[platform]: validUrl,
		})
		setNewUrl('')
		setLinkError('')
	}

	const removeLink = (platform: string) => {
		const updated = { ...socialLinks }
		delete updated[platform]
		form.setValue('socialLinks', updated)
	}

	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			e.preventDefault()
			addLink()
		}
	}

	return (
		<div className="space-y-6">
			<FormSectionHeader icon={Globe} title="Social Media Links" optional />

			<FormField
				control={form.control}
				name="socialLinks"
				render={() => (
					<FormItem>
						<FormLabel className="text-base font-medium">
							Social Media Profiles
						</FormLabel>
						<FormControl>
							<div className="space-y-4">
								<div className="flex gap-2">
									<Input
										type="url"
										placeholder="https://twitter.com/yourfoundation or https://linkedin.com/company/yourfoundation"
										value={newUrl}
										onChange={(e) => {
											setNewUrl(e.target.value)
											if (linkError) setLinkError('')
										}}
										onKeyDown={handleKeyDown}
										className={cn(
											'h-11 border-2 focus-visible:border-purple-500 focus-visible:ring-2 focus-visible:ring-purple-500 flex-1',
											linkError
												? 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive'
												: '',
										)}
										aria-label="Social media URL"
									/>
									<Button
										type="button"
										onClick={addLink}
										disabled={!newUrl.trim()}
										className="shrink-0 h-11 px-4 focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
										aria-label="Add social link"
									>
										<Plus className="h-4 w-4" aria-hidden="true" />
									</Button>
								</div>
								{linkError ? (
									<p className="text-sm text-destructive" role="alert">
										{linkError}
									</p>
								) : null}

								{Object.keys(socialLinks).length > 0 ? (
									<div className="space-y-2">
										{Object.entries(socialLinks).map(([platform, url]) => (
											<div
												key={platform}
												className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3"
											>
												<div className="flex-1 min-w-0">
													<div className="text-sm font-medium capitalize">
														{platform}
													</div>
													<div className="text-xs text-muted-foreground truncate">
														{url}
													</div>
												</div>
												<Button
													type="button"
													variant="ghost"
													size="sm"
													onClick={() => removeLink(platform)}
													className="h-8 w-8 p-0 shrink-0 hover:bg-destructive/10 hover:text-destructive focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
													aria-label={`Remove ${platform} link`}
												>
													<X className="h-4 w-4" aria-hidden="true" />
												</Button>
											</div>
										))}
									</div>
								) : null}
							</div>
						</FormControl>
						<FormDescription>
							Add links to your foundation&apos;s social media profiles.
							We&apos;ll automatically detect the platform from the URL.
						</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
		</div>
	)
}
