'use client'

import { Loader2, Save } from 'lucide-react'
import { Button } from '~/components/base/button'

type SaveFooterProps = {
	isDirty: boolean
	isPending: boolean
}

export function SaveFooter({ isDirty, isPending }: SaveFooterProps) {
	return (
		<div className="pt-6 border-t border-gray-200">
			<div className="space-y-4 text-center">
				<div className="text-sm text-muted-foreground">
					{isDirty ? (
						<span className="font-medium text-amber-600">
							You have unsaved changes
						</span>
					) : (
						<span>All changes saved</span>
					)}
				</div>

				<Button
					type="submit"
					disabled={!isDirty || isPending}
					className="flex items-center w-full gap-2 px-8 text-white gradient-btn"
					size="lg"
					aria-describedby={isDirty ? 'unsaved-changes' : 'all-saved'}
					aria-label="Save changes"
				>
					{isPending ? (
						<>
							<Loader2 className="w-4 h-4 animate-spin" />
							Saving...
						</>
					) : (
						<>
							<Save className="w-4 h-4" />
							Save Changes
						</>
					)}
				</Button>
			</div>
		</div>
	)
}
